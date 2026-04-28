"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsRouter = void 0;
const express_1 = require("express");
const bookingsService_1 = require("../services/bookingsService");
exports.bookingsRouter = (0, express_1.Router)();
// GET /bookings
exports.bookingsRouter.get('/', (_req, res) => {
    const bookings = bookingsService_1.bookingsService.list();
    res.status(200).json(bookings);
});
// POST /bookings
exports.bookingsRouter.post('/', (req, res) => {
    const body = req.body;
    // Проверка наличия обязательных полей перед передачей в сервис
    const requiredFields = ['eventTypeId', 'guestName', 'guestEmail', 'start'];
    const missing = requiredFields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
    if (missing.length > 0) {
        res.status(400).json({
            error: 'Bad Request',
            message: `Missing required fields: ${missing.join(', ')}`,
        });
        return;
    }
    try {
        const booking = bookingsService_1.bookingsService.create(body);
        res.status(201).json(booking);
    }
    catch (err) {
        if (err instanceof bookingsService_1.ValidationError) {
            res.status(400).json({ error: 'Bad Request', message: err.message });
            return;
        }
        if (err instanceof bookingsService_1.NotFoundError) {
            res.status(404).json({ error: 'Not Found', message: err.message });
            return;
        }
        if (err instanceof bookingsService_1.ConflictError) {
            res.status(409).json({ error: 'Conflict', message: err.message });
            return;
        }
        throw err;
    }
});
