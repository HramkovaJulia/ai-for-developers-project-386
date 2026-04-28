import { v4 as uuidv4 } from 'uuid';
import type { Booking, BookingCreate } from '../models';
import { storage } from '../storage';
import { hasOverlap } from '../utils/overlap';
import { isValidEmail, isValidUtcDateTime, toDate } from '../utils/validation';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends Error {
  constructor() {
    super('Slot is already booked');
    this.name = 'ConflictError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export const bookingsService = {
  list: (): Booking[] => storage.bookings.findAll(),

  create: (body: BookingCreate): Booking => {
    // 1. Валидация eventTypeId
    const eventType = storage.eventTypes.findById(body.eventTypeId);
    if (!eventType) {
      throw new NotFoundError(`EventType "${body.eventTypeId}" not found`);
    }

    // 2. Валидация start
    if (!isValidUtcDateTime(body.start)) {
      throw new ValidationError('Field "start" must be a valid UTC datetime');
    }

    // 3. Валидация guestEmail
    if (!isValidEmail(body.guestEmail)) {
      throw new ValidationError('Field "guestEmail" must be a valid email address');
    }

    // 4. Валидация guestName
    if (!body.guestName || typeof body.guestName !== 'string' || !body.guestName.trim()) {
      throw new ValidationError('Field "guestName" is required');
    }

    const start = toDate(body.start);
    const end = new Date(start.getTime() + eventType.durationMinutes * 60 * 1000);

    // 5. start должен быть в будущем
    if (start <= new Date()) {
      throw new ValidationError('Field "start" must be a future datetime');
    }

    // 6. Проверка конфликта — слот не должен пересекаться с существующими bookings
    const conflicting = storage.bookings.findAll().some(b =>
      hasOverlap(start, end, new Date(b.start), new Date(b.end)),
    );

    if (conflicting) {
      throw new ConflictError();
    }

    const booking: Booking = {
      id: uuidv4(),
      eventTypeId: body.eventTypeId,
      guestName: body.guestName.trim(),
      guestEmail: body.guestEmail.trim(),
      start: start.toISOString(),
      end: end.toISOString(),
    };

    return storage.bookings.create(booking);
  },
};
