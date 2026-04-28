const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function isValidUtcDateTime(value: string): boolean {
  if (typeof value !== 'string' || !value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

export function toDate(value: string): Date {
  return new Date(value);
}
