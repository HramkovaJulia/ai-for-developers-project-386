"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOverlap = hasOverlap;
/**
 * Проверяет пересечение двух временных интервалов.
 * Интервалы пересекаются, если один начинается до того, как другой заканчивается.
 * Граничное касание (a.end === b.start) НЕ является пересечением.
 */
function hasOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && aEnd > bStart;
}
