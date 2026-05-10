import { clampMin, toNumber } from '../shared/number';

export function calculateCorporateTax(ct, rules) {
  const revenue = toNumber(ct.revenue);
  const accountingProfit = revenue - toNumber(ct.cost) - toNumber(ct.deductible) - toNumber(ct.nonDeductible);
  const adjustments = toNumber(ct.nonDeductible) - toNumber(ct.exemptIncome) - toNumber(ct.loss);
  let taxableIncome = clampMin(accountingProfit + adjustments);
  let aboveThreshold = clampMin(taxableIncome - rules.threshold);
  let taxDue = aboveThreshold * rules.rate;
  const sbrApplied = ct.smallBusinessRelief === 'yes' && revenue <= rules.sbrRevenueLimit;

  if (sbrApplied) {
    taxableIncome = 0;
    aboveThreshold = 0;
    taxDue = 0;
  }

  return {
    accountingProfit,
    adjustments,
    taxableIncome,
    aboveThreshold,
    taxDue,
    effectiveRate: taxableIncome > 0 ? (taxDue / taxableIncome) * 100 : 0,
    sbrApplied,
  };
}
