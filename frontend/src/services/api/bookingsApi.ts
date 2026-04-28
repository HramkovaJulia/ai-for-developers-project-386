import { axiosInstance } from '@/lib/axios';
import type { Booking, BookingCreate } from '@/types';

export const bookingsApi = {
  list: () => axiosInstance.get<Booking[]>('/bookings').then(r => r.data),
  create: (body: BookingCreate) =>
    axiosInstance.post<Booking>('/bookings', body).then(r => r.data),
};
