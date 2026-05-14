import { TAX_CONFIG } from './taxConfig';
const n = (v) => Number(v) || 0;
export function calculateCorporateTax(form){
  const deductibleExpenses = n(form.directExpenses) + n(form.adminExpenses);
  const inferredAccountingProfit = n(form.revenue) + n(form.otherIncome) - n(form.exemptIncome) - deductibleExpenses;
  const providedAccountingProfit = n(form.accountingProfit);
  const accountingProfit = providedAccountingProfit > 0 ? providedAccountingProfit : inferredAccountingProfit;
  const taxableIncome = accountingProfit + n(form.addBackAdjustments) + n(form.nonDeductibleExpenses) - n(form.deductibleAdjustments);
  const taxableAboveThreshold = Math.max(0, taxableIncome - TAX_CONFIG.corporateTaxThreshold);
  const taxPayable = taxableAboveThreshold * TAX_CONFIG.corporateTaxRate;
  return { profitBeforeTax: accountingProfit, taxableIncome, taxableAboveThreshold, taxPayable };
}
