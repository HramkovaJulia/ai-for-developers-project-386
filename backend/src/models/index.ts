// TypeSpec → TypeScript: зеркальное отражение контракта

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface EventTypeCreate {
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Slot {
  start: string; // utcDateTime (ISO 8601)
  end: string;   // utcDateTime (ISO 8601)
}

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  start: string; // utcDateTime
  end: string;   // utcDateTime
}

export interface BookingCreate {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  start: string; // utcDateTime
}
