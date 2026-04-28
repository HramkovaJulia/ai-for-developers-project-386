import { Router } from 'express';
import type { Request, Response } from 'express';
import {
  bookingsService,
  ValidationError,
  ConflictError,
  NotFoundError,
} from '../services/bookingsService';
import type { BookingCreate } from '../models';

export const bookingsRouter = Router();

// GET /bookings
bookingsRouter.get('/', (_req: Request, res: Response): void => {
  const bookings = bookingsService.list();
  res.status(200).json(bookings);
});

// POST /bookings
bookingsRouter.post('/', (req: Request, res: Response): void => {
  const body = req.body as Partial<BookingCreate>;

  // Проверка наличия обязательных полей перед передачей в сервис
  const requiredFields: (keyof BookingCreate)[] = ['eventTypeId', 'guestName', 'guestEmail', 'start'];
  const missing = requiredFields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');

  if (missing.length > 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: `Missing required fields: ${missing.join(', ')}`,
    });
    return;
  }

  try {
    const booking = bookingsService.create(body as BookingCreate);
    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: 'Bad Request', message: err.message });
      return;
    }
    if (err instanceof NotFoundError) {
      res.status(404).json({ error: 'Not Found', message: err.message });
      return;
    }
    if (err instanceof ConflictError) {
      res.status(409).json({ error: 'Conflict', message: err.message });
      return;
    }
    throw err;
  }
});
