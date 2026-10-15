import { timingSafeEqual } from 'node:crypto';
export function codespaceOrigin(name, domain) {
  if (!/^[a-z0-9-]+$/.test(name || '') || domain !== 'app.github.dev') throw new Error('A supported GitHub Codespace is required.');
  return `https://${name}-7681.${domain}`;
}
export function sameOrigin(value, expected) { return typeof value === 'string' && value === expected; }
export function equalSecret(value, secret) {
  if (typeof value !== 'string' || value.length > 256) return false;
  const a = Buffer.from(value), b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function cookieValue(header, name) {
  if (typeof header !== 'string') return '';
  const item = header.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return item ? item.slice(name.length + 1) : '';
}
export function sizeOf(value) {
  return value && Number.isInteger(value.cols) && value.cols >= 20 && value.cols <= 240 && Number.isInteger(value.rows) && value.rows >= 5 && value.rows <= 100 ? { cols: value.cols, rows: value.rows } : null;
}
