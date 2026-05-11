import { TAX_CONFIG } from './taxConfig';
const n = (v) => Number(v) || 0;
export function calculateCorporateTax(form){
  const deductibleExpenses = n(form.directExpenses) + n(form.adminExpenses);
  const taxableIncome = n(form.revenue) + n(form.otherIncome) - n(form.exemptIncome) - deductibleExpenses + n(form.nonDeductibleExpenses) + n(form.addBackAdjustments) - n(form.deductibleAdjustments);
  const taxableAboveThreshold = Math.max(0, taxableIncome - TAX_CONFIG.corporateTaxThreshold);
  const taxPayable = taxableAboveThreshold * TAX_CONFIG.corporateTaxRate;
  return { taxableIncome, taxableAboveThreshold, taxPayable };
}
