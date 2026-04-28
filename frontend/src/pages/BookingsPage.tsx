import { useState, useEffect } from 'react';
import { Plus, BookOpen, Mail, User, Clock, Calendar } from 'lucide-react';
import type { Booking, EventType } from '@/types';
import { bookingsApi, eventTypesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { BookingForm } from '@/components/forms/BookingForm';
import { formatDateTime } from '@/lib/utils';

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([bookingsApi.list(), eventTypesApi.list()])
      .then(([b, et]) => {
        setBookings(b);
        setEventTypes(et);
      })
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: Parameters<typeof bookingsApi.create>[0]) => {
    const created = await bookingsApi.create(data);
    setBookings(prev => [created, ...prev]);
    setCreateOpen(false);
  };

  const getEventTypeName = (id: string) =>
    eventTypes.find(et => et.id === id)?.name ?? id;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бронирования</h1>
          <p className="text-sm text-gray-500 mt-1">Список всех бронирований</p>
        </div>
        <Button data-testid="create-booking-btn" onClick={() => setCreateOpen(true)} disabled={eventTypes.length === 0}>
          <Plus className="h-4 w-4" />
          Забронировать
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {!loading && error && (
        <div data-testid="bookings-error" className="rounded-md bg-red-50 border border-red-200 px-4 py-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <Button variant="outline" className="mt-3" onClick={fetchData}>
            Попробовать снова
          </Button>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Нет бронирований</p>
          <p className="text-sm mt-1">Создайте первое бронирование</p>
          {eventTypes.length > 0 && (
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Забронировать
            </Button>
          )}
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <>
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Гость</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Тип события</TableHead>
                      <TableHead>Начало</TableHead>
                      <TableHead>Конец</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-testid="bookings-table-body">
                    {bookings.map(booking => (
                      <TableRow key={booking.id} data-testid="booking-row" data-booking-id={booking.id}>
                        <TableCell className="font-medium">{booking.guestName}</TableCell>
                        <TableCell className="text-gray-500">{booking.guestEmail}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-medium">
                            <Clock className="h-3 w-3" />
                            {getEventTypeName(booking.eventTypeId)}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {formatDateTime(booking.start)}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {formatDateTime(booking.end)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="md:hidden space-y-3">
            {bookings.map(booking => (
              <Card key={booking.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <User className="h-4 w-4 text-gray-400" />
                    {booking.guestName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    {booking.guestEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="h-4 w-4" />
                    {getEventTypeName(booking.eventTypeId)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(booking.start)} — {formatDateTime(booking.end)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Создать бронирование</DialogTitle>
          </DialogHeader>
          <BookingForm
            eventTypes={eventTypes}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
