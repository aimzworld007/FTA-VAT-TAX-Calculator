import { TAX_CONFIG } from './taxConfig';

export const VAT_PRICING_MODES = {
  INCLUSIVE: 'inclusive',
  EXCLUSIVE: 'exclusive'
};

export const VAT_PRICING_OPTIONS = [
  {
    value: VAT_PRICING_MODES.INCLUSIVE,
    label: 'VAT Inclusive (5%)',
    description: 'Entered prices already include 5% VAT.'
  },
  {
    value: VAT_PRICING_MODES.EXCLUSIVE,
    label: 'VAT Exclusive (5%)',
    description: '5% VAT will be added on top of entered prices.'
  }
];

const n = (value) => Number(value) || 0;

export function normalizeVatPricingMode(mode) {
  return mode === VAT_PRICING_MODES.INCLUSIVE ? VAT_PRICING_MODES.INCLUSIVE : VAT_PRICING_MODES.EXCLUSIVE;
}

export function splitVatFromAmount(amount, mode) {
  const totalAmount = n(amount);
  if (normalizeVatPricingMode(mode) === VAT_PRICING_MODES.INCLUSIVE) {
    const net = totalAmount / (1 + TAX_CONFIG.vatRate);
    return { net, vat: totalAmount - net, total: totalAmount };
  }

  const net = totalAmount;
  const vat = net * TAX_CONFIG.vatRate;
  return { net, vat, total: net + vat };
}

export function summarizeVatAmounts(amounts, mode) {
  return amounts.reduce((acc, amount) => {
    const value = splitVatFromAmount(amount, mode);
    return {
      net: acc.net + value.net,
      vat: acc.vat + value.vat,
      total: acc.total + value.total
    };
  }, { net: 0, vat: 0, total: 0 });
}
