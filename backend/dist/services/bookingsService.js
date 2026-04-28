"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsService = exports.NotFoundError = exports.ConflictError = exports.ValidationError = void 0;
const uuid_1 = require("uuid");
const storage_1 = require("../storage");
const overlap_1 = require("../utils/overlap");
const validation_1 = require("../utils/validation");
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends Error {
    constructor() {
        super('Slot is already booked');
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
exports.bookingsService = {
    list: () => storage_1.storage.bookings.findAll(),
    create: (body) => {
        // 1. Валидация eventTypeId
        const eventType = storage_1.storage.eventTypes.findById(body.eventTypeId);
        if (!eventType) {
            throw new NotFoundError(`EventType "${body.eventTypeId}" not found`);
        }
        // 2. Валидация start
        if (!(0, validation_1.isValidUtcDateTime)(body.start)) {
            throw new ValidationError('Field "start" must be a valid UTC datetime');
        }
        // 3. Валидация guestEmail
        if (!(0, validation_1.isValidEmail)(body.guestEmail)) {
            throw new ValidationError('Field "guestEmail" must be a valid email address');
        }
        // 4. Валидация guestName
        if (!body.guestName || typeof body.guestName !== 'string' || !body.guestName.trim()) {
            throw new ValidationError('Field "guestName" is required');
        }
        const start = (0, validation_1.toDate)(body.start);
        const end = new Date(start.getTime() + eventType.durationMinutes * 60 * 1000);
        // 5. start должен быть в будущем
        if (start <= new Date()) {
            throw new ValidationError('Field "start" must be a future datetime');
        }
        // 6. Проверка конфликта — слот не должен пересекаться с существующими bookings
        const conflicting = storage_1.storage.bookings.findAll().some(b => (0, overlap_1.hasOverlap)(start, end, new Date(b.start), new Date(b.end)));
        if (conflicting) {
            throw new ConflictError();
        }
        const booking = {
            id: (0, uuid_1.v4)(),
            eventTypeId: body.eventTypeId,
            guestName: body.guestName.trim(),
            guestEmail: body.guestEmail.trim(),
            start: start.toISOString(),
            end: end.toISOString(),
        };
        return storage_1.storage.bookings.create(booking);
    },
};
