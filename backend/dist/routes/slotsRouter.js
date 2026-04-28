"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotsRouter = void 0;
const express_1 = require("express");
const slotsService_1 = require("../services/slotsService");
exports.slotsRouter = (0, express_1.Router)({ mergeParams: true });
// GET /event-types/:eventTypeId/slots
exports.slotsRouter.get('/', (req, res) => {
    const { eventTypeId } = req.params;
    try {
        const slots = slotsService_1.slotsService.listAvailable(eventTypeId);
        res.status(200).json(slots);
    }
    catch (err) {
        if (err instanceof slotsService_1.EventTypeNotFoundError) {
            res.status(404).json({ error: 'Not Found', message: err.message });
            return;
        }
        throw err;
    }
});
