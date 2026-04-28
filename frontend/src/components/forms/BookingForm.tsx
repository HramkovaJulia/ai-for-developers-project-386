import { useState, useEffect } from 'react';
import type { BookingCreate, EventType, Slot } from '@/types';
import { slotsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { formatDateTime } from '@/lib/utils';

interface BookingFormProps {
  eventTypes: EventType[];
  onSubmit: (data: BookingCreate) => Promise<void>;
  onCancel: () => void;
  defaultEventTypeId?: string;
}

export function BookingForm({ eventTypes, onSubmit, onCancel, defaultEventTypeId }: BookingFormProps) {
  const [eventTypeId, setEventTypeId] = useState(defaultEventTypeId ?? '');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventTypeId) {
      setSlots([]);
      setSelectedSlot('');
      return;
    }
    setSlotsLoading(true);
    setSlotsError(null);
    slotsApi
      .list(eventTypeId)
      .then(data => {
        setSlots(data);
        setSelectedSlot('');
      })
      .catch(() => setSlotsError('Не удалось загрузить слоты'))
      .finally(() => setSlotsLoading(false));
  }, [eventTypeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!eventTypeId || !guestName.trim() || !guestEmail.trim() || !selectedSlot) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        eventTypeId,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        start: selectedSlot,
      });
    } catch {
      setError('Ошибка при создании бронирования. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div data-testid="booking-form-error" className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Тип события</Label>
        <Select value={eventTypeId} onValueChange={setEventTypeId}>
          <SelectTrigger data-testid="event-type-select">
            <SelectValue placeholder="Выберите тип события" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map(et => (
              <SelectItem key={et.id} value={et.id}>
                {et.name} ({et.durationMinutes} мин)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {eventTypeId && (
        <div className="space-y-1.5">
          <Label>Доступный слот</Label>
          {slotsLoading ? (
            <div className="flex items-center gap-2 py-2 text-sm text-gray-500">
              <Spinner className="h-4 w-4" />
              Загрузка слотов...
            </div>
          ) : slotsError ? (
            <p className="text-sm text-red-600">{slotsError}</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-500">Нет доступных слотов для этого типа события</p>
          ) : (
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger data-testid="slot-select">
                <SelectValue placeholder="Выберите слот" />
              </SelectTrigger>
              <SelectContent>
                {slots.map(slot => (
                  <SelectItem key={slot.start} value={slot.start}>
                    {formatDateTime(slot.start)} — {formatDateTime(slot.end)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="guest-name">Имя гостя</Label>
        <Input
          id="guest-name"
          placeholder="Иван Иванов"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="guest-email">Email гостя</Label>
        <Input
          id="guest-email"
          type="email"
          placeholder="ivan@example.com"
          value={guestEmail}
          onChange={e => setGuestEmail(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button data-testid="booking-submit-btn" type="submit" disabled={loading || !selectedSlot}>
          {loading ? 'Создание...' : 'Забронировать'}
        </Button>
      </div>
    </form>
  );
}
