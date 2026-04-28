import { useState } from 'react';
import type { EventTypeCreate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EventTypeFormProps {
  onSubmit: (data: EventTypeCreate) => Promise<void>;
  onCancel: () => void;
}

export function EventTypeForm({ onSubmit, onCancel }: EventTypeFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const duration = parseInt(durationMinutes, 10);
    if (!name.trim() || !description.trim() || isNaN(duration) || duration <= 0) {
      setError('Заполните все поля корректно');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), durationMinutes: duration });
    } catch {
      setError('Ошибка при создании. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="et-name">Название</Label>
        <Input
          id="et-name"
          placeholder="Например: Консультация"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="et-description">Описание</Label>
        <Textarea
          id="et-description"
          placeholder="Опишите тип события"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="et-duration">Длительность (минуты)</Label>
        <Input
          id="et-duration"
          type="number"
          placeholder="30"
          min={1}
          value={durationMinutes}
          onChange={e => setDurationMinutes(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
