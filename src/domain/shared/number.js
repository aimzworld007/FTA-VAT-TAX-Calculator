export function toNumber(value) {
  return Number.parseFloat(value || 0) || 0;
}

export function clampMin(value, min = 0) {
  return Math.max(min, value);
}
