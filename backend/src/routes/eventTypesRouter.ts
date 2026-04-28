import { Router } from 'express';
import type { Request, Response } from 'express';
import { eventTypesService } from '../services/eventTypesService';
import type { EventTypeCreate } from '../models';

export const eventTypesRouter = Router();

// GET /event-types
eventTypesRouter.get('/', (_req: Request, res: Response): void => {
  const eventTypes = eventTypesService.list();
  res.status(200).json(eventTypes);
});

// POST /event-types
eventTypesRouter.post('/', (req: Request, res: Response): void => {
  const body = req.body as Partial<EventTypeCreate>;

  if (
    typeof body.name !== 'string' || !body.name.trim() ||
    typeof body.description !== 'string' || !body.description.trim() ||
    typeof body.durationMinutes !== 'number' ||
    !Number.isInteger(body.durationMinutes) ||
    body.durationMinutes <= 0
  ) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Fields "name" (string), "description" (string), "durationMinutes" (positive integer) are required',
    });
    return;
  }

  const created = eventTypesService.create({
    name: body.name.trim(),
    description: body.description.trim(),
    durationMinutes: body.durationMinutes,
  });

  res.status(201).json(created);
});
