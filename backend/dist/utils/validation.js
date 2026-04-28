"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidUtcDateTime = isValidUtcDateTime;
exports.toDate = toDate;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
    return EMAIL_RE.test(email);
}
function isValidUtcDateTime(value) {
    if (typeof value !== 'string' || !value)
        return false;
    const d = new Date(value);
    return !isNaN(d.getTime());
}
function toDate(value) {
    return new Date(value);
}
