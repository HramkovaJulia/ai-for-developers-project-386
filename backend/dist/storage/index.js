"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
const SEED_EVENT_TYPES = [
    {
        id: 'et-seed-001',
        name: 'Консультация',
        description: 'Индивидуальная консультация продолжительностью 60 минут',
        durationMinutes: 60,
    },
    {
        id: 'et-seed-002',
        name: 'Демо продукта',
        description: 'Демонстрация возможностей продукта',
        durationMinutes: 30,
    },
    {
        id: 'et-seed-003',
        name: 'Техническое интервью',
        description: 'Техническое интервью для оценки навыков кандидата',
        durationMinutes: 45,
    },
];
// In-memory storage — не сохраняется между перезапусками
let eventTypes = SEED_EVENT_TYPES.map(et => ({ ...et }));
let bookings = [];
exports.storage = {
    eventTypes: {
        findAll: () => [...eventTypes],
        findById: (id) => eventTypes.find(et => et.id === id),
        create: (eventType) => {
            eventTypes.push(eventType);
            return eventType;
        },
    },
    bookings: {
        findAll: () => [...bookings],
        findOverlapping: (start, end) => bookings.filter(b => {
            const bStart = new Date(b.start);
            const bEnd = new Date(b.end);
            return bStart < end && bEnd > start;
        }),
        create: (booking) => {
            bookings.push(booking);
            return booking;
        },
    },
    // Используется только в тестовом окружении (NODE_ENV=test)
    reset: () => {
        eventTypes = SEED_EVENT_TYPES.map(et => ({ ...et }));
        bookings = [];
    },
};
