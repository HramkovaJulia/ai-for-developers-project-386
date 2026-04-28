import type { APIRequestContext } from '@playwright/test';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

/**
 * Сбрасывает in-memory состояние backend к seed-данным.
 * Вызывается в beforeEach для изоляции тестов.
 */
export async function resetBackend(request: APIRequestContext): Promise<void> {
  const res = await request.post(`${BACKEND_URL}/__reset`);
  if (!res.ok()) {
    throw new Error(`/__reset failed: ${res.status()} ${await res.text()}`);
  }
}

/** Возвращает список event types через API (для setup в тестах) */
export async function getEventTypes(request: APIRequestContext) {
  const res = await request.get(`${BACKEND_URL}/event-types`);
  return res.json() as Promise<Array<{ id: string; name: string; durationMinutes: number }>>;
}

/** Возвращает доступные слоты для event type через API */
export async function getSlots(request: APIRequestContext, eventTypeId: string) {
  const res = await request.get(`${BACKEND_URL}/event-types/${eventTypeId}/slots`);
  return res.json() as Promise<Array<{ start: string; end: string }>>;
}

/** Создаёт бронирование напрямую через API (минуя UI — для setup конфликт-сценария) */
export async function createBookingViaApi(
  request: APIRequestContext,
  payload: { eventTypeId: string; guestName: string; guestEmail: string; start: string },
) {
  const res = await request.post(`${BACKEND_URL}/bookings`, { data: payload });
  return { status: res.status(), body: await res.json() };
}
