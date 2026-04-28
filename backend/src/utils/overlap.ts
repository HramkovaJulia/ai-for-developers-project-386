/**
 * Проверяет пересечение двух временных интервалов.
 * Интервалы пересекаются, если один начинается до того, как другой заканчивается.
 * Граничное касание (a.end === b.start) НЕ является пересечением.
 */
export function hasOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}
