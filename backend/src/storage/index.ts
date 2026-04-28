import type { EventType, Booking } from '../models';

const SEED_EVENT_TYPES: EventType[] = [
  {
    id: 'et-seed-001',
    name: 'Консультация',
    description: 'Индивидуальная консультация продолжительностью 60 минут',
    durationMinutes: 60,
  },
  {
    id: 'et-seed-002',
    name: 'Демо продукта',
    description: 'Демонстрация возможностей продукта',
    durationMinutes: 30,
  },
  {
    id: 'et-seed-003',
    name: 'Техническое интервью',
    description: 'Техническое интервью для оценки навыков кандидата',
    durationMinutes: 45,
  },
];

// In-memory storage — не сохраняется между перезапусками
let eventTypes: EventType[] = SEED_EVENT_TYPES.map(et => ({ ...et }));
let bookings: Booking[] = [];

export const storage = {
  eventTypes: {
    findAll: (): EventType[] => [...eventTypes],

    findById: (id: string): EventType | undefined =>
      eventTypes.find(et => et.id === id),

    create: (eventType: EventType): EventType => {
      eventTypes.push(eventType);
      return eventType;
    },
  },

  bookings: {
    findAll: (): Booking[] => [...bookings],

    findOverlapping: (start: Date, end: Date): Booking[] =>
      bookings.filter(b => {
        const bStart = new Date(b.start);
        const bEnd = new Date(b.end);
        return bStart < end && bEnd > start;
      }),

    create: (booking: Booking): Booking => {
      bookings.push(booking);
      return booking;
    },
  },

  // Используется только в тестовом окружении (NODE_ENV=test)
  reset: (): void => {
    eventTypes = SEED_EVENT_TYPES.map(et => ({ ...et }));
    bookings = [];
  },
};
