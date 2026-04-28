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
  start: string;
  end: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  start: string;
  end: string;
}

export interface BookingCreate {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  start: string;
}
