import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Выбирает значение в Radix UI Select компоненте.
 * Кликает по триггеру, затем по элементу в выпадающем списке.
 */
export async function selectRadixOption(
  page: Page,
  triggerTestId: string,
  optionText: string | RegExp,
): Promise<void> {
  const trigger = page.getByTestId(triggerTestId);
  await trigger.click();
  // Radix рендерит опции в portal (вне иерархии), ищем по role
  const option = page.getByRole('option', { name: optionText });
  await option.waitFor({ state: 'visible' });
  await option.click();
}

/**
 * Ждёт, пока спиннер загрузки исчезнет.
 */
export async function waitForLoadingToFinish(page: Page, testId: string): Promise<void> {
  const spinner = page.getByTestId(testId);
  // Ждём появления (может быть и не появиться если загрузка мгновенная)
  await expect(spinner).not.toBeVisible({ timeout: 10_000 });
}

/**
 * Заполняет и отправляет форму создания бронирования.
 */
export async function fillBookingForm(
  page: Page,
  params: {
    eventTypeName: string | RegExp;
    slotText?: string | RegExp;
    guestName: string;
    guestEmail: string;
  },
): Promise<void> {
  // Выбрать тип события
  await selectRadixOption(page, 'event-type-select', params.eventTypeName);

  // Ждём загрузки слотов
  await expect(page.getByTestId('slot-select')).toBeVisible({ timeout: 10_000 });

  // Выбрать слот (первый доступный, если не указан конкретный)
  if (params.slotText) {
    await selectRadixOption(page, 'slot-select', params.slotText);
  } else {
    // Берём первый доступный слот
    await page.getByTestId('slot-select').click();
    const firstOption = page.getByRole('option').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();
  }

  // Заполнить имя и email
  await page.locator('#guest-name').fill(params.guestName);
  await page.locator('#guest-email').fill(params.guestEmail);
}
