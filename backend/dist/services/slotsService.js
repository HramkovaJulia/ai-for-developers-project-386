"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotsService = exports.EventTypeNotFoundError = void 0;
const storage_1 = require("../storage");
const overlap_1 = require("../utils/overlap");
const WORK_HOUR_START = 9; // 09:00 UTC
const WORK_HOUR_END = 18; // 18:00 UTC
const DAYS_AHEAD = 14; // генерируем слоты на 14 дней вперёд
/**
 * Генерирует все потенциальные слоты для заданного durationMinutes
 * в рабочие часы (9:00–18:00 UTC) на ближайшие DAYS_AHEAD дней.
 */
function generateRawSlots(durationMinutes, from) {
    const slots = [];
    const stepMs = durationMinutes * 60 * 1000;
    for (let day = 0; day < DAYS_AHEAD; day++) {
        const date = new Date(from);
        date.setUTCHours(0, 0, 0, 0);
        date.setUTCDate(date.getUTCDate() + day);
        let cursor = new Date(date);
        cursor.setUTCHours(WORK_HOUR_START, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setUTCHours(WORK_HOUR_END, 0, 0, 0);
        while (cursor.getTime() + stepMs <= dayEnd.getTime()) {
            const slotEnd = new Date(cursor.getTime() + stepMs);
            slots.push({
                start: cursor.toISOString(),
                end: slotEnd.toISOString(),
            });
            cursor = slotEnd;
        }
    }
    return slots;
}
class EventTypeNotFoundError extends Error {
    constructor(id) {
        super(`EventType "${id}" not found`);
        this.name = 'EventTypeNotFoundError';
    }
}
exports.EventTypeNotFoundError = EventTypeNotFoundError;
exports.slotsService = {
    listAvailable: (eventTypeId) => {
        const eventType = storage_1.storage.eventTypes.findById(eventTypeId);
        if (!eventType)
            throw new EventTypeNotFoundError(eventTypeId);
        const now = new Date();
        const allSlots = generateRawSlots(eventType.durationMinutes, now);
        const allBookings = storage_1.storage.bookings.findAll();
        return allSlots.filter(slot => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            // Отбрасываем слоты в прошлом (start должен быть строго в будущем)
            if (slotStart <= now)
                return false;
            // Отбрасываем слоты, пересекающиеся с существующими бронированиями
            const isConflict = allBookings.some(b => (0, overlap_1.hasOverlap)(slotStart, slotEnd, new Date(b.start), new Date(b.end)));
            return !isConflict;
        });
    },
};
