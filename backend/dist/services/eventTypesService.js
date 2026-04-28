"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventTypesService = void 0;
const uuid_1 = require("uuid");
const storage_1 = require("../storage");
exports.eventTypesService = {
    list: () => storage_1.storage.eventTypes.findAll(),
    create: (body) => {
        const eventType = {
            id: (0, uuid_1.v4)(),
            name: body.name,
            description: body.description,
            durationMinutes: body.durationMinutes,
        };
        return storage_1.storage.eventTypes.create(eventType);
    },
};
