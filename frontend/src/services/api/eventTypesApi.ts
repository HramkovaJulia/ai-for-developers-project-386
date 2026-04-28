import { axiosInstance } from '@/lib/axios';
import type { EventType, EventTypeCreate } from '@/types';

export const eventTypesApi = {
  list: () => axiosInstance.get<EventType[]>('/event-types').then(r => r.data),
  create: (body: EventTypeCreate) =>
    axiosInstance.post<EventType>('/event-types', body).then(r => r.data),
};
