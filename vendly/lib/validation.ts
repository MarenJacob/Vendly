export function cleanText(value: unknown, max = 500) {
  return String(value ?? '').trim().replace(/[<>]/g, '').slice(0, max);
}
export function validEmail(value: unknown) {
  const email = cleanText(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}
export function positiveInt(value: unknown, max = 20) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
}
