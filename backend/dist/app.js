"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const eventTypesRouter_1 = require("./routes/eventTypesRouter");
const slotsRouter_1 = require("./routes/slotsRouter");
const bookingsRouter_1 = require("./routes/bookingsRouter");
const storage_1 = require("./storage");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Routes — строго по TypeSpec контракту
    app.use('/event-types', eventTypesRouter_1.eventTypesRouter);
    app.use('/event-types/:eventTypeId/slots', slotsRouter_1.slotsRouter);
    app.use('/bookings', bookingsRouter_1.bookingsRouter);
    // Тестовый endpoint — только вне продакшена, сбрасывает in-memory состояние
    if (process.env.NODE_ENV !== 'production') {
        app.post('/__reset', (_req, res) => {
            storage_1.storage.reset();
            res.status(200).json({ ok: true });
        });
    }
    // Статические файлы фронтенда (если собраны)
    const publicDir = path_1.default.join(__dirname, '..', 'public');
    if (fs_1.default.existsSync(publicDir)) {
        app.use(express_1.default.static(publicDir));
        // SPA fallback — все не-API маршруты отдают index.html
        app.get('*', (_req, res) => {
            res.sendFile(path_1.default.join(publicDir, 'index.html'));
        });
    }
    else {
        // 404 для неизвестных маршрутов (dev-режим без фронтенда)
        app.use((_req, res) => {
            res.status(404).json({ error: 'Not Found', message: 'Route not found' });
        });
    }
    // Глобальный обработчик непойманных ошибок
    app.use((err, _req, res, _next) => {
        console.error('[Unhandled error]', err);
        res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred' });
    });
    return app;
}
