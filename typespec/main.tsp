import "@typespec/http";

using TypeSpec.Http;

@service({
  title: "Calendar Booking Service",
  version: "1.0.0",
})
namespace CalendarBooking;

// ─── Models ───────────────────────────────────────────────

model EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: int32;
}

model EventTypeCreate {
  name: string;
  description: string;
  durationMinutes: int32;
}

model Slot {
  start: utcDateTime;
  end: utcDateTime;
}

model Booking {
  id: string;
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  start: utcDateTime;
  end: utcDateTime;
}

model BookingCreate {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  start: utcDateTime;
}

// ─── Event Types ──────────────────────────────────────────

@route("/event-types")
interface EventTypes {
  @get
  list(): EventType[];

  @post
  create(@body body: EventTypeCreate): EventType;
}

// ─── Slots ────────────────────────────────────────────────

@route("/event-types/{eventTypeId}/slots")
interface Slots {
  @get
  list(@path eventTypeId: string): Slot[];
}

// ─── Bookings ─────────────────────────────────────────────

@route("/bookings")
interface Bookings {
  @get
  list(): Booking[];

  @post
  create(@body body: BookingCreate): Booking;
}
