export function formatCurrency(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function sanitizeText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).replace(/[\r\n\t]+/g, ' ').trim();
}

export function sanitizeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}
