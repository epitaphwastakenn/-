// VARIABLES
export const tau = Math.PI * 2;

// FUNCTIONS
export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function approach(value, target, step) {
  if (value < target) return Math.min(target, value + step);
  return Math.max(target, value - step);
}

export function dist2(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function dist(ax, ay, bx, by) {
  return Math.sqrt(dist2(ax, ay, bx, by));
}

export function angleDiff(a, b) {
  let d = (b - a) % tau;
  if (d > Math.PI) d -= tau;
  if (d < -Math.PI) d += tau;
  return d;
}

export function easeOutCubic(t) {
  const u = 1 - t;
  return 1 - u * u * u;
}

export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
}

export function formatNumber(value) {
  if (value >= 1e6) return (value / 1e6).toFixed(1).replace('.0', '') + 'M';
  if (value >= 1e4) return (value / 1e3).toFixed(1).replace('.0', '') + 'k';
  return String(Math.floor(value));
}
