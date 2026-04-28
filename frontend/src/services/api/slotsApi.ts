import { axiosInstance } from '@/lib/axios';
import type { Slot } from '@/types';

export const slotsApi = {
  list: (eventTypeId: string) =>
    axiosInstance
      .get<Slot[]>(`/event-types/${eventTypeId}/slots`)
      .then(r => r.data),
};
