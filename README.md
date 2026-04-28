### Hexlet tests and linter status:
[![Actions Status](https://github.com/HramkovaJulia/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/HramkovaJulia/ai-for-developers-project-386/actions)

## Calendar Booking Service

Полный стек: frontend + backend, реализованный строго по TypeSpec контракту.

---

## Backend

**Стек:** Node.js · TypeScript · Express.js · in-memory storage

### Запуск (dev)

```bash
cd backend
npm install
npm run dev        # http://localhost:3000
```

### Запуск (production)

```bash
cd backend
npm run build
npm start
```

### API Endpoints

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/event-types` | Список типов событий |
| POST | `/event-types` | Создать тип события |
| GET | `/event-types/:id/slots` | Доступные слоты (с учётом бронирований) |
| GET | `/bookings` | Список бронирований |
| POST | `/bookings` | Создать бронирование |

### HTTP коды

- `200` — успех (GET)
- `201` — создано (POST)
- `400` — ошибка валидации (невалидный email, отсутствующие поля, дата в прошлом)
- `404` — ресурс не найден (несуществующий eventTypeId)
- `409` — конфликт слота (Slot is already booked)

### Бизнес-логика

- **Слоты**: генерируются на 14 дней вперёд, рабочие часы 09:00–18:00 UTC, шаг = `durationMinutes` типа события
- **Конфликт**: любое пересечение интервалов блокирует бронирование (даже частичное)
- **end вычисляется**: `start + eventType.durationMinutes`
- **Seed data**: 3 типа событий (60, 30, 45 мин) при старте сервера

### Архитектура

```
backend/src/
  models/      — TypeScript-зеркала TypeSpec моделей
  storage/     — in-memory хранилище (EventType[], Booking[])
  services/
    eventTypesService  — list, create
    slotsService       — генерация слотов, фильтрация занятых
    bookingsService    — create с валидацией и проверкой конфликта
  routes/
    eventTypesRouter
    slotsRouter
    bookingsRouter
  utils/
    overlap.ts    — hasOverlap(aStart, aEnd, bStart, bEnd)
    validation.ts — isValidEmail, isValidUtcDateTime
  app.ts        — Express app factory
  index.ts      — entry point
```

---

## Frontend

**Стек:** Vite 5 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · axios

### Запуск

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Убедись, что backend запущен на порту 3000 (или настрой `VITE_API_BASE_URL` в `.env`).

По умолчанию `VITE_API_BASE_URL=http://localhost:4010` (Prism mock).

Для работы с реальным backend:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000
```

---

## Prism Mock (альтернатива реальному backend)

```bash
prism mock openapi.yaml --port 4010 --cors
```

OpenAPI спецификация: `openapi.yaml` (строго по `typespec/main.tsp`).
