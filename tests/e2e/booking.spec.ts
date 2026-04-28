import { test, expect } from '@playwright/test';
import { resetBackend, getEventTypes, getSlots, createBookingViaApi } from '../helpers/api-helpers';
import { selectRadixOption, fillBookingForm } from '../helpers/ui-helpers';

test.describe('Bookings flow', () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  // ─── 1. Страница бронирований ────────────────────────────────────────────────

  test('отображает заголовок страницы бронирований', async ({ page }) => {
    await page.goto('/bookings');
    await expect(page.getByRole('heading', { name: 'Бронирования' })).toBeVisible();
  });

  test('показывает пустое состояние когда бронирований нет', async ({ page }) => {
    await page.goto('/bookings');
    await expect(page.getByTestId('bookings-error')).not.toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('Нет бронирований')).toBeVisible();
  });

  test('кнопка "Забронировать" активна при наличии event types', async ({ page }) => {
    await page.goto('/bookings');
    await expect(page.getByText('Нет бронирований')).toBeVisible();
    const btn = page.getByTestId('create-booking-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  // ─── 2. Полный booking flow (критический сценарий) ──────────────────────────

  test('КРИТИЧЕСКИЙ: создаёт бронирование полным UI-флоу', async ({ page, request }) => {
    // Убеждаемся, что есть будущие слоты перед тестом
    const slots = await getSlots(request, 'et-seed-001');
    expect(slots.length).toBeGreaterThan(0);

    const GUEST_NAME = 'Иван Тестов';
    const GUEST_EMAIL = `ivan-${Date.now()}@test.com`;

    await page.goto('/bookings');
    await expect(page.getByText('Нет бронирований')).toBeVisible();

    await page.getByTestId('create-booking-btn').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Создать бронирование')).toBeVisible();

    await fillBookingForm(page, {
      eventTypeName: /Консультация/,
      guestName: GUEST_NAME,
      guestEmail: GUEST_EMAIL,
    });

    const submitBtn = page.getByTestId('booking-submit-btn');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Диалог закрылся — ждём дольше для учёта сетевого запроса
    await expect(dialog).not.toBeVisible({ timeout: 12_000 });

    // Бронирование появилось в таблице
    const rows = page.getByTestId('booking-row');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(GUEST_NAME);
    await expect(rows.first()).toContainText(GUEST_EMAIL);
    await expect(rows.first()).toContainText('Консультация');
  });

  test('созданное бронирование содержит корректные данные в таблице', async ({ page, request }) => {
    const slots = await getSlots(request, 'et-seed-002');
    expect(slots.length).toBeGreaterThan(0);

    const GUEST_NAME = 'Мария Петрова';
    const GUEST_EMAIL = `maria-${Date.now()}@example.com`;

    await page.goto('/bookings');
    await page.getByTestId('create-booking-btn').click();

    await fillBookingForm(page, {
      eventTypeName: /Демо продукта/,
      guestName: GUEST_NAME,
      guestEmail: GUEST_EMAIL,
    });

    await page.getByTestId('booking-submit-btn').click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 12_000 });

    const row = page.getByTestId('booking-row').first();
    await expect(row.getByText(GUEST_NAME)).toBeVisible();
    await expect(row.getByText(GUEST_EMAIL)).toBeVisible();
    await expect(row.getByText('Демо продукта')).toBeVisible();

    // Дата начала и конца отображаются (формат дд.мм.гггг чч:мм)
    const startCell = row.locator('td').nth(3);
    const endCell = row.locator('td').nth(4);
    await expect(startCell).toContainText(/\d{2}\.\d{2}\.\d{4}/);
    await expect(endCell).toContainText(/\d{2}\.\d{2}\.\d{4}/);
  });

  // ─── 3. Conflict scenario ─────────────────────────────────────────────────────

  test('КОНФЛИКТ: API возвращает 409 при повторном бронировании того же слота', async ({ request }) => {
    const slots = await getSlots(request, 'et-seed-002');
    expect(slots.length).toBeGreaterThan(0);
    const targetSlot = slots[0];

    // Первое бронирование — успешное
    const first = await createBookingViaApi(request, {
      eventTypeId: 'et-seed-002',
      guestName: 'Пользователь 1',
      guestEmail: 'user1@conflict.com',
      start: targetSlot.start,
    });
    expect(first.status).toBe(201);

    // Второе бронирование на тот же слот — 409
    const second = await createBookingViaApi(request, {
      eventTypeId: 'et-seed-002',
      guestName: 'Пользователь 2',
      guestEmail: 'user2@conflict.com',
      start: targetSlot.start,
    });
    expect(second.status).toBe(409);
    expect(second.body).toMatchObject({
      error: 'Conflict',
      message: 'Slot is already booked',
    });
  });

  test('КОНФЛИКТ: API возвращает 409 при частичном перекрытии (30 мин внутри 60 мин)', async ({ request }) => {
    // Берём слоты для 60-минутного события
    const slots60 = await getSlots(request, 'et-seed-001');
    expect(slots60.length).toBeGreaterThan(0);
    const targetSlot = slots60[0]; // например, 16:00-17:00 UTC

    // Бронируем 60-минутный слот
    const first = await createBookingViaApi(request, {
      eventTypeId: 'et-seed-001',
      guestName: 'Первый',
      guestEmail: 'first@overlap.com',
      start: targetSlot.start,
    });
    expect(first.status).toBe(201);

    // Пробуем 30-минутный слот, начинающийся на 30 мин позже — он внутри 60-минутного
    const overlapStart = new Date(targetSlot.start);
    overlapStart.setUTCMinutes(overlapStart.getUTCMinutes() + 30);

    const second = await createBookingViaApi(request, {
      eventTypeId: 'et-seed-002',
      guestName: 'Второй',
      guestEmail: 'second@overlap.com',
      start: overlapStart.toISOString(),
    });

    expect(second.status).toBe(409);
    expect(second.body.message).toBe('Slot is already booked');
  });

  test('КОНФЛИКТ: забронированный слот исчезает из списка доступных', async ({ request }) => {
    const slotsBefore = await getSlots(request, 'et-seed-001');
    expect(slotsBefore.length).toBeGreaterThan(0);
    const targetSlot = slotsBefore[0];

    // Бронируем слот через API
    const res = await createBookingViaApi(request, {
      eventTypeId: 'et-seed-001',
      guestName: 'Тест',
      guestEmail: 'test@disappear.com',
      start: targetSlot.start,
    });
    expect(res.status).toBe(201);

    // Получаем обновлённый список слотов
    const slotsAfter = await getSlots(request, 'et-seed-001');

    // Забронированный слот должен исчезнуть
    const bookedSlotPresent = slotsAfter.some(s => s.start === targetSlot.start);
    expect(bookedSlotPresent).toBe(false);
    expect(slotsAfter.length).toBe(slotsBefore.length - 1);
  });

  test('КОНФЛИКТ: UI показывает ошибку при неудачном бронировании (409 mock)', async ({ page, request }) => {
    const slots = await getSlots(request, 'et-seed-001');
    expect(slots.length).toBeGreaterThan(0);

    // Перехватываем POST /bookings и возвращаем 409
    await page.route('**/bookings', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Conflict', message: 'Slot is already booked' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/bookings');
    await page.getByTestId('create-booking-btn').click();

    await fillBookingForm(page, {
      eventTypeName: /Консультация/,
      guestName: 'Тест Конфликт',
      guestEmail: 'conflict@test.com',
    });

    await page.getByTestId('booking-submit-btn').click();

    // UI показывает сообщение об ошибке
    const errorMsg = page.getByTestId('booking-form-error');
    await expect(errorMsg).toBeVisible({ timeout: 8_000 });
    await expect(errorMsg).toContainText(/Ошибка при создании бронирования/);

    // Диалог остаётся открытым
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  // ─── 4. Полный E2E флоу через несколько страниц ──────────────────────────────

  test('ИНТЕГРАЦИЯ: полный путь пользователя от event types до booking', async ({ page, request }) => {
    // Проверяем наличие слотов для выбранного event type
    const slots = await getSlots(request, 'et-seed-003');
    expect(slots.length).toBeGreaterThan(0);

    const GUEST_NAME = 'Алексей Интеграция';
    const GUEST_EMAIL = `alex-${Date.now()}@test.com`;

    // 1. Открыть главную
    await page.goto('/');
    await expect(page.getByTestId('event-types-heading')).toBeVisible();
    await expect(page.getByTestId('event-types-loading')).not.toBeVisible();

    // 2. Перейти на страницу event type
    await page.getByText('Техническое интервью', { exact: true }).click();
    await expect(page).toHaveURL(/\/event-types\/et-seed-003/);
    await expect(page.getByTestId('event-type-detail-name')).toHaveText('Техническое интервью');

    // 3. Убедиться что слоты загрузились
    await expect(page.getByTestId('slots-loading')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('slots-list')).toBeVisible();
    const slotCount = await page.getByTestId('slot-item').count();
    expect(slotCount).toBeGreaterThan(0);

    // 4. Перейти к бронированиям через navbar
    await page.getByRole('link', { name: /Бронирования/ }).click();
    await expect(page).toHaveURL('/bookings');

    // 5. Создать бронирование
    await expect(page.getByText('Нет бронирований')).toBeVisible();
    await page.getByTestId('create-booking-btn').click();

    await fillBookingForm(page, {
      eventTypeName: /Техническое интервью/,
      guestName: GUEST_NAME,
      guestEmail: GUEST_EMAIL,
    });

    await page.getByTestId('booking-submit-btn').click();

    // 6. Проверить появление бронирования в списке
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 12_000 });
    const row = page.getByTestId('booking-row').first();
    await expect(row).toContainText(GUEST_NAME);
    await expect(row).toContainText(GUEST_EMAIL);
    await expect(row).toContainText('Техническое интервью');
  });
});
