import { toNumber } from '../shared/number';

export function splitVat(total, mode, vatRate) {
  const amount = toNumber(total);
  if (mode === 'inclusive') {
    const vat = amount * vatRate / (1 + vatRate);
    return { taxable: amount - vat, vat };
  }
  return { taxable: amount, vat: amount * vatRate };
}

export function calculateVat(vat, rules) {
  const totals = vat.months.reduce((acc, row) => ({
    sales: acc.sales + toNumber(row.sales),
    purchases: acc.purchases + toNumber(row.purchases),
    expenses: acc.expenses + toNumber(row.expenses),
  }), { sales: 0, purchases: 0, expenses: 0 });

  const salesSplit = splitVat(totals.sales, vat.mode, rules.vatRate);
  const inputSplit = splitVat(totals.purchases + totals.expenses, vat.mode, rules.vatRate);
  const outputVat = salesSplit.vat + toNumber(vat.salesAdjustmentVat);
  const inputVat = inputSplit.vat + toNumber(vat.expenseAdjustmentVat);
  const netVat = outputVat - inputVat;

  return {
    ...totals,
    taxableSales: salesSplit.taxable,
    taxableInputs: inputSplit.taxable,
    outputVat,
    inputVat,
    netVat,
    isPayable: netVat >= 0,
  };
}
