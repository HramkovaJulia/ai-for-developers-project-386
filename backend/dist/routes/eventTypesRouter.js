"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventTypesRouter = void 0;
const express_1 = require("express");
const eventTypesService_1 = require("../services/eventTypesService");
exports.eventTypesRouter = (0, express_1.Router)();
// GET /event-types
exports.eventTypesRouter.get('/', (_req, res) => {
    const eventTypes = eventTypesService_1.eventTypesService.list();
    res.status(200).json(eventTypes);
});
// POST /event-types
exports.eventTypesRouter.post('/', (req, res) => {
    const body = req.body;
    if (typeof body.name !== 'string' || !body.name.trim() ||
        typeof body.description !== 'string' || !body.description.trim() ||
        typeof body.durationMinutes !== 'number' ||
        !Number.isInteger(body.durationMinutes) ||
        body.durationMinutes <= 0) {
        res.status(400).json({
            error: 'Bad Request',
            message: 'Fields "name" (string), "description" (string), "durationMinutes" (positive integer) are required',
        });
        return;
    }
    const created = eventTypesService_1.eventTypesService.create({
        name: body.name.trim(),
        description: body.description.trim(),
        durationMinutes: body.durationMinutes,
    });
    res.status(201).json(created);
});
