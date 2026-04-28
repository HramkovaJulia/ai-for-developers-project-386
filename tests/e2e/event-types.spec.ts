import { test, expect } from '@playwright/test';
import { resetBackend } from '../helpers/api-helpers';

test.describe('Event Types page', () => {
  test.beforeEach(async ({ request }) => {
    await resetBackend(request);
  });

  test('отображает заголовок страницы', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('event-types-heading')).toHaveText('Типы событий');
  });

  test('загружает и отображает seed event types', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('event-types-loading')).not.toBeVisible();

    const cards = page.getByTestId('event-type-card');
    await expect(cards).toHaveCount(3);

    // Используем exact: true чтобы избежать совпадения с текстом описания
    await expect(page.getByText('Консультация', { exact: true })).toBeVisible();
    await expect(page.getByText('Демо продукта', { exact: true })).toBeVisible();
    await expect(page.getByText('Техническое интервью', { exact: true })).toBeVisible();
  });

  test('отображает длительность каждого event type', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('event-types-loading')).not.toBeVisible();

    // Ищем внутри карточек, чтобы не пересекаться с текстом описаний
    const cards = page.getByTestId('event-type-card');
    await expect(cards.getByText('60 мин', { exact: true })).toBeVisible();
    await expect(cards.getByText('30 мин', { exact: true })).toBeVisible();
    await expect(cards.getByText('45 мин', { exact: true })).toBeVisible();
  });

  test('кнопка "Создать тип" видна и кликабельна', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByTestId('create-event-type-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('открывает диалог создания при нажатии на кнопку', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('create-event-type-btn').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Создать тип события')).toBeVisible();

    await expect(dialog.locator('#et-name')).toBeVisible();
    await expect(dialog.locator('#et-description')).toBeVisible();
    await expect(dialog.locator('#et-duration')).toBeVisible();
  });

  test('создаёт новый event type и он появляется в списке', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('event-types-loading')).not.toBeVisible();

    await page.getByTestId('create-event-type-btn').click();

    const dialog = page.getByRole('dialog');
    await dialog.locator('#et-name').fill('Тестовая встреча');
    await dialog.locator('#et-description').fill('Описание для автотеста');
    await dialog.locator('#et-duration').fill('25');
    await dialog.getByRole('button', { name: 'Создать' }).click();

    await expect(dialog).not.toBeVisible();

    const cards = page.getByTestId('event-type-card');
    await expect(cards).toHaveCount(4);
    await expect(page.getByText('Тестовая встреча', { exact: true })).toBeVisible();
    await expect(cards.getByText('25 мин', { exact: true })).toBeVisible();
  });

  test('клик по карточке переходит на страницу детали', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('event-types-loading')).not.toBeVisible();

    await page.getByText('Консультация', { exact: true }).click();
    await expect(page).toHaveURL(/\/event-types\/et-seed-001/);
  });
});
