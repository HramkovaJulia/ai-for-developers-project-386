import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, ChevronRight } from 'lucide-react';
import type { EventType } from '@/types';
import { eventTypesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { EventTypeForm } from '@/components/forms/EventTypeForm';

export function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const fetchEventTypes = () => {
    setLoading(true);
    setError(null);
    eventTypesApi
      .list()
      .then(setEventTypes)
      .catch(() => setError('Не удалось загрузить типы событий'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const handleCreate = async (data: Parameters<typeof eventTypesApi.create>[0]) => {
    const created = await eventTypesApi.create(data);
    setEventTypes(prev => [...prev, created]);
    setCreateOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 data-testid="event-types-heading" className="text-2xl font-bold text-gray-900">Типы событий</h1>
          <p className="text-sm text-gray-500 mt-1">Управление шаблонами встреч</p>
        </div>
        <Button data-testid="create-event-type-btn" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Создать тип
        </Button>
      </div>

      {loading && (
        <div data-testid="event-types-loading" className="flex justify-center items-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      )}

      {!loading && error && (
        <div data-testid="event-types-error" className="rounded-md bg-red-50 border border-red-200 px-4 py-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <Button variant="outline" className="mt-3" onClick={fetchEventTypes}>
            Попробовать снова
          </Button>
        </div>
      )}

      {!loading && !error && eventTypes.length === 0 && (
        <div data-testid="event-types-empty" className="text-center py-16 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Нет типов событий</p>
          <p className="text-sm mt-1">Создайте первый тип события, чтобы начать принимать бронирования</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Создать тип
          </Button>
        </div>
      )}

      {!loading && !error && eventTypes.length > 0 && (
        <div data-testid="event-types-list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTypes.map(et => (
            <Card
              key={et.id}
              data-testid="event-type-card"
              data-event-type-id={et.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/event-types/${et.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="text-base">{et.name}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{et.description}</p>
                <div className="flex items-center gap-1.5 text-sm text-blue-600 font-medium">
                  <Clock className="h-4 w-4" />
                  {et.durationMinutes} мин
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать тип события</DialogTitle>
          </DialogHeader>
          <EventTypeForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
