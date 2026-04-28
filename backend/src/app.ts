import express from 'express';
import cors from 'cors';
import { eventTypesRouter } from './routes/eventTypesRouter';
import { slotsRouter } from './routes/slotsRouter';
import { bookingsRouter } from './routes/bookingsRouter';
import { storage } from './storage';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Routes — строго по TypeSpec контракту
  app.use('/event-types', eventTypesRouter);
  app.use('/event-types/:eventTypeId/slots', slotsRouter);
  app.use('/bookings', bookingsRouter);

  // Тестовый endpoint — только вне продакшена, сбрасывает in-memory состояние
  if (process.env.NODE_ENV !== 'production') {
    app.post('/__reset', (_req, res) => {
      storage.reset();
      res.status(200).json({ ok: true });
    });
  }

  // 404 для неизвестных маршрутов
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'Route not found' });
  });

  // Глобальный обработчик непойманных ошибок
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Unhandled error]', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
  });

  return app;
}
