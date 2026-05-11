import { buildMonthlyEntriesFromPeriod } from './vatPeriod';
import { VAT_PRICING_MODES, normalizeVatPricingMode, splitVatFromAmount, summarizeVatAmounts } from './vatPricing';

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

  const pricingMode = normalizeVatPricingMode(form.vatPricingMode || form.vatMode);
  const taxableInputTotal = totalPurchases + totalExpenses;
  const outputVat = splitVatFromAmount(totalSales, pricingMode).vat;
  const computedRecoverableVat = splitVatFromAmount(taxableInputTotal, pricingMode).vat;
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
    label: netVat >= 0 ? 'VAT Payable' : 'VAT Refundable',
    vatPricingMode: pricingMode,
    salesBreakdown: splitVatFromAmount(totalSales, pricingMode),
    inputBreakdown: splitVatFromAmount(taxableInputTotal, pricingMode),
    monthlySummary: summarizeVatAmounts(monthlyEntries.map((entry) => clamp(entry.sales)), pricingMode),
    isInclusive: pricingMode === VAT_PRICING_MODES.INCLUSIVE
  };
}
