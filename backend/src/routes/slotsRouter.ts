import { Router } from 'express';
import type { Request, Response } from 'express';
import { slotsService, EventTypeNotFoundError } from '../services/slotsService';

export const slotsRouter = Router({ mergeParams: true });

// GET /event-types/:eventTypeId/slots
slotsRouter.get('/', (req: Request, res: Response): void => {
  const { eventTypeId } = req.params;

  try {
    const slots = slotsService.listAvailable(eventTypeId);
    res.status(200).json(slots);
  } catch (err) {
    if (err instanceof EventTypeNotFoundError) {
      res.status(404).json({ error: 'Not Found', message: err.message });
      return;
    }
    throw err;
  }
});
