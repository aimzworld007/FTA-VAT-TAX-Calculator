import { TAX_CONFIG } from './taxConfig';
import { buildMonthlyEntriesFromPeriod } from './vatPeriod';

const n = (v) => Number(v) || 0;
const clamp = (v) => Math.max(0, n(v));

export function buildMonthlyEntries(form) {
  return buildMonthlyEntriesFromPeriod(form, form.monthlyEntries);
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
