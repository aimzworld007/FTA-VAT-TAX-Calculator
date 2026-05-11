import { TAX_CONFIG } from './taxConfig';
const n = (v) => Number(v) || 0;
export function calculateVat(form){
  const outputVat = n(form.standardRatedSales) * TAX_CONFIG.vatRate;
  const adjustments = n(form.previousAdjustment) - n(form.badDebtRelief);
  const netVat = outputVat - n(form.recoverableInputVat) + adjustments;
  return { outputVat, inputVat: n(form.recoverableInputVat), adjustments, netVat, label: netVat >= 0 ? 'VAT Payable' : 'VAT Refundable' };
}
