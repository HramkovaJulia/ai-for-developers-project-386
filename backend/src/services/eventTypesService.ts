import { v4 as uuidv4 } from 'uuid';
import type { EventType, EventTypeCreate } from '../models';
import { storage } from '../storage';

export const eventTypesService = {
  list: (): EventType[] => storage.eventTypes.findAll(),

  create: (body: EventTypeCreate): EventType => {
    const eventType: EventType = {
      id: uuidv4(),
      name: body.name,
      description: body.description,
      durationMinutes: body.durationMinutes,
    };
    return storage.eventTypes.create(eventType);
  },
};
