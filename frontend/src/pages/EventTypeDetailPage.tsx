import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, BookOpen } from 'lucide-react';
import type { EventType, Slot } from '@/types';
import { eventTypesApi, slotsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formatDate, formatTime } from '@/lib/utils';

function groupSlotsByDate(slots: Slot[]): Map<string, Slot[]> {
  const map = new Map<string, Slot[]>();
  for (const slot of slots) {
    const date = formatDate(slot.start);
    const existing = map.get(date) ?? [];
    map.set(date, [...existing, slot]);
  }
  return map;
}

export function EventTypeDetailPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [etLoading, setEtLoading] = useState(true);
  const [etError, setEtError] = useState<string | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventTypeId) return;

    setEtLoading(true);
    eventTypesApi
      .list()
      .then(all => {
        const found = all.find(e => e.id === eventTypeId);
        if (!found) throw new Error('Not found');
        setEventType(found);
      })
      .catch(() => setEtError('Тип события не найден'))
      .finally(() => setEtLoading(false));

    setSlotsLoading(true);
    slotsApi
      .list(eventTypeId)
      .then(setSlots)
      .catch(() => setSlotsError('Не удалось загрузить слоты'))
      .finally(() => setSlotsLoading(false));
  }, [eventTypeId]);

  const groupedSlots = groupSlotsByDate(slots);

  return (
    <div>
      <Button variant="ghost" className="mb-6 -ml-2" onClick={() => navigate('/')}>
        <ArrowLeft className="h-4 w-4" />
        Назад к типам событий
      </Button>

      {etLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-8 w-8" />
        </div>
      ) : etError || !eventType ? (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-6 text-center">
          <p className="text-red-700">{etError ?? 'Тип события не найден'}</p>
        </div>
      ) : (
        <>
          <Card data-testid="event-type-detail-card" className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle data-testid="event-type-detail-name" className="text-xl">{eventType.name}</CardTitle>
                <div data-testid="event-type-detail-duration" className="flex items-center gap-1.5 text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4" />
                  {eventType.durationMinutes} мин
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{eventType.description}</p>
            </CardContent>
          </Card>

          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Доступные слоты</h2>
          </div>

          {slotsLoading ? (
            <div data-testid="slots-loading" className="flex justify-center py-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : slotsError ? (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-6 text-center">
              <p className="text-red-700">{slotsError}</p>
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => {
                  setSlotsLoading(true);
                  setSlotsError(null);
                  slotsApi
                    .list(eventTypeId!)
                    .then(setSlots)
                    .catch(() => setSlotsError('Не удалось загрузить слоты'))
                    .finally(() => setSlotsLoading(false));
                }}
              >
                Попробовать снова
              </Button>
            </div>
          ) : slots.length === 0 ? (
            <div data-testid="slots-empty" className="text-center py-12 text-gray-500">
              <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Нет доступных слотов</p>
              <p className="text-sm mt-1">Слоты временно недоступны</p>
            </div>
          ) : (
            <div data-testid="slots-list" className="space-y-6">
              {Array.from(groupedSlots.entries()).map(([date, daySlots]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
                    {date}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {daySlots.map(slot => (
                      <div
                        key={slot.start}
                        data-testid="slot-item"
                        data-slot-start={slot.start}
                        className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-3 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-default"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(slot.start)}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          — {formatTime(slot.end)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
