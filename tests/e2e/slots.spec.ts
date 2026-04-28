import { test, expect } from '@playwright/test';
import { resetBackend, getSlots } from '../helpers/api-helpers';

test.describe('Slots page (Event Type Detail)', () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  test('отображает информацию о event type', async ({ page }) => {
    await page.goto('/event-types/et-seed-001');

    // Ждём загрузки данных о типе события
    await expect(page.getByTestId('event-type-detail-card')).toBeVisible();
    await expect(page.getByTestId('event-type-detail-name')).toHaveText('Консультация');
    await expect(page.getByTestId('event-type-detail-duration')).toContainText('60 мин');
  });

  test('загружает и отображает доступные слоты', async ({ page }) => {
    await page.goto('/event-types/et-seed-001');

    // Ждём загрузки слотов (спиннер исчезает)
    await expect(page.getByTestId('slots-loading')).not.toBeVisible({ timeout: 10_000 });

    const slotsList = page.getByTestId('slots-list');
    await expect(slotsList).toBeVisible();

    const slots = page.getByTestId('slot-item');
    await expect(slots).not.toHaveCount(0);
  });

  test('слоты сгруппированы по дате и показывают время', async ({ page }) => {
    await page.goto('/event-types/et-seed-001');
    await expect(page.getByTestId('slots-loading')).not.toBeVisible({ timeout: 10_000 });

    // Слоты отображаются с временем в формате ЧЧ:ММ
    const firstSlot = page.getByTestId('slot-item').first();
    await expect(firstSlot).toBeVisible();
    // Время вида "09:00" — проверяем паттерн
    const text = await firstSlot.textContent();
    expect(text).toMatch(/\d{2}:\d{2}/);
  });

  test('количество слотов соответствует API', async ({ page, request }) => {
    const apiSlots = await getSlots(request, 'et-seed-001');
    await page.goto('/event-types/et-seed-001');
    await expect(page.getByTestId('slots-loading')).not.toBeVisible({ timeout: 10_000 });

    const uiSlots = page.getByTestId('slot-item');
    await expect(uiSlots).toHaveCount(apiSlots.length);
  });

  test('кнопка "Назад" возвращает на главную страницу', async ({ page }) => {
    await page.goto('/event-types/et-seed-001');
    await page.getByRole('button', { name: /Назад к типам событий/ }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('event-types-heading')).toBeVisible();
  });

  test('слоты для "Демо продукта" (30 мин) кратны 30 минутам', async ({ page, request }) => {
    const slots = await getSlots(request, 'et-seed-002');

    // Каждый слот должен быть длиной 30 минут
    for (const slot of slots.slice(0, 5)) {
      const start = new Date(slot.start).getTime();
      const end = new Date(slot.end).getTime();
      const durationMs = end - start;
      expect(durationMs).toBe(30 * 60 * 1000);
    }

    // Проверяем UI для второго типа события
    await page.goto('/event-types/et-seed-002');
    await expect(page.getByTestId('slots-loading')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('slot-item').first()).toBeVisible();
  });

  test('показывает сообщение об ошибке при несуществующем event type', async ({ page }) => {
    await page.goto('/event-types/non-existent-id');
    // Ждём попытки загрузки
    await expect(page.getByText(/не найден|not found/i)).toBeVisible({ timeout: 10_000 });
  });
});
