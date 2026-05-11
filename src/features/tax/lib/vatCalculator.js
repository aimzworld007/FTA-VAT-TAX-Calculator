import { TAX_CONFIG } from './taxConfig';

const n = (v) => Number(v) || 0;
const clamp = (v) => Math.max(0, n(v));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getVatMonthsForFrequency(filingFrequency, taxPeriodStart) {
  const count = filingFrequency === 'Monthly' ? 1 : filingFrequency === 'Yearly' ? 12 : 3;
  const startMonthIndex = taxPeriodStart ? new Date(taxPeriodStart).getMonth() : 0;
  const normalizedStart = Number.isFinite(startMonthIndex) && startMonthIndex >= 0 ? startMonthIndex : 0;
  return Array.from({ length: count }, (_, i) => MONTHS[(normalizedStart + i) % 12]);
}

export function buildMonthlyEntries(form) {
  const months = getVatMonthsForFrequency(form.filingFrequency, form.taxPeriodStart);
  const existing = Array.isArray(form.monthlyEntries) ? form.monthlyEntries : [];
  const byMonth = new Map(existing.map((entry) => [entry?.month, entry]));

  return months.map((month) => {
    const prev = byMonth.get(month) || {};
    return {
      month,
      sales: clamp(prev.sales),
      purchases: clamp(prev.purchases),
      expenses: clamp(prev.expenses)
    };
  });
}

export function calculateVat(form) {
  const hasMonthlyEntries = Array.isArray(form.monthlyEntries) && form.monthlyEntries.length > 0;
  const monthlyEntries = hasMonthlyEntries ? form.monthlyEntries : [];
  const totalSales = hasMonthlyEntries ? monthlyEntries.reduce((sum, e) => sum + clamp(e.sales), 0) : clamp(form.standardRatedSales);
  const totalPurchases = hasMonthlyEntries ? monthlyEntries.reduce((sum, e) => sum + clamp(e.purchases), 0) : clamp(form.standardRatedPurchases);
  const totalExpenses = hasMonthlyEntries ? monthlyEntries.reduce((sum, e) => sum + clamp(e.expenses), 0) : 0;

  const vatInclusive = form.vatMode === 'Inclusive';
  const taxableInputTotal = totalPurchases + totalExpenses;
  const outputVat = vatInclusive ? totalSales - (totalSales / (1 + TAX_CONFIG.vatRate)) : totalSales * TAX_CONFIG.vatRate;
  const computedRecoverableVat = vatInclusive
    ? taxableInputTotal - (taxableInputTotal / (1 + TAX_CONFIG.vatRate))
    : taxableInputTotal * TAX_CONFIG.vatRate;
  const inputVat = hasMonthlyEntries ? computedRecoverableVat : clamp(form.recoverableInputVat);

  const adjustments = n(form.previousAdjustment) - n(form.badDebtRelief);
  const netVat = outputVat - inputVat + adjustments;

  return {
    outputVat,
    inputVat,
    adjustments,
    netVat,
    totalSales,
    totalPurchases,
    totalExpenses,
    taxableInputTotal,
    label: netVat >= 0 ? 'VAT Payable' : 'VAT Refundable'
  };
}
