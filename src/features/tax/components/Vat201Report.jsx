import React from 'react';
import { buildMonthlyEntries } from '../lib/vatCalculator';
import { formatVatPeriodLabel } from '../lib/vatPeriod';
import { normalizeVatAmounts, normalizeVatPricingMode, VAT_PRICING_MODES } from '../lib/vatPricing';
import { VatReportTemplate } from './export/VatReportTemplate';

const emirateRows = [
  ['1a', 'Abu Dhabi', 'Standard rated supplies in Abu Dhabi'],
  ['1b', 'Dubai', 'Standard rated supplies in Dubai'],
  ['1c', 'Sharjah', 'Standard rated supplies in Sharjah'],
  ['1d', 'Ajman', 'Standard rated supplies in Ajman'],
  ['1e', 'Umm Al Quwain', 'Standard rated supplies in Umm Al Quwain'],
  ['1f', 'Ras Al Khaimah', 'Standard rated supplies in Ras Al Khaimah'],
  ['1g', 'Fujairah', 'Standard rated supplies in Fujairah']
];
const n = (v) => Number(v) || 0;
const getSelectedEmirateVatRow = (selectedEmirate, standardSales, pricingMode) => {
  const emirate = emirateRows.find(([, emirateName]) => emirateName === selectedEmirate) || emirateRows[2];
  const [box, , description] = emirate;
  return { ...normalizeVatAmounts(standardSales, pricingMode), box, description, adjustment: 0 };
};

export function Vat201Report({ data, result }) {
  const generatedAt = new Date();
  const period = formatVatPeriodLabel(data);
  const monthlyEntries = buildMonthlyEntries(data);
  const pricingMode = normalizeVatPricingMode(data.vatPricingMode || data.vatMode || result?.vatPricingMode);
  const vatModeLabel = pricingMode === VAT_PRICING_MODES.INCLUSIVE ? 'Inclusive' : 'Exclusive';
  const standardSales = monthlyEntries.reduce((sum, e) => sum + n(e.sales), 0) || n(data.standardRatedSales);
  const totalPurchases = monthlyEntries.reduce((sum, e) => sum + n(e.purchases), 0) || n(data.standardRatedPurchases);
  const totalExpenses = monthlyEntries.reduce((sum, e) => sum + n(e.expenses), 0);
  const inputBaseGross = totalPurchases + totalExpenses;
  const inputBreakdown = normalizeVatAmounts(inputBaseGross, pricingMode);
  const selectedEmirate = data.businessLocationEmirate || 'Sharjah';
  const rows = [
    getSelectedEmirateVatRow(selectedEmirate, standardSales, pricingMode),
    { box: '2', description: 'Tax Refunds provided to Tourists under the Tax Refunds for Tourists Scheme', amount: 0, vatAmount: 0, adjustment: 0 },
    { box: '3', description: 'Supplies subject to the reverse charge provisions', amount: 0, vatAmount: 0, adjustment: 0 },
    { box: '4', description: 'Zero rated supplies', taxableAmount: n(data.zeroRatedSales), vatAmount: 0, grossAmount: n(data.zeroRatedSales), adjustment: 0 },
    { box: '5', description: 'Exempt supplies', taxableAmount: n(data.exemptSales), vatAmount: 0, grossAmount: n(data.exemptSales), adjustment: 0 },
    { box: '6', description: 'Goods imported into the UAE', amount: 0, vatAmount: 0, adjustment: 0 },
    { box: '7', description: 'Adjustments to goods imported into the UAE', amount: 0, vatAmount: 0, adjustment: result.adjustments },
    { box: '8', description: 'Totals', taxableAmount: result.salesBreakdown.net, vatAmount: result.outputVat, grossAmount: result.salesBreakdown.total, adjustment: result.adjustments, total: true },
    { box: '9', description: 'Standard rated expenses', taxableAmount: inputBreakdown.taxableAmount, vatAmount: result.inputVat, grossAmount: inputBreakdown.grossAmount, adjustment: 0 },
    { box: '10', description: 'Supplies subject to the reverse charge provisions', amount: 0, vatAmount: 0, adjustment: 0 },
    { box: '11', description: 'Totals', taxableAmount: inputBreakdown.taxableAmount, vatAmount: result.inputVat, grossAmount: inputBreakdown.grossAmount, adjustment: 0, total: true },
    { box: '12', description: 'Total value of due tax for the period', amount: result.outputVat + result.adjustments, vatAmount: 0, adjustment: 0 },
    { box: '13', description: 'Total value of recoverable tax for the period', amount: result.inputVat, vatAmount: 0, adjustment: 0 },
    { box: '14', description: 'Payable tax for the period', amount: result.netVat, vatAmount: 0, adjustment: 0, total: true }
  ];

  return <VatReportTemplate
    period={period}
    generatedDate={generatedAt.toLocaleDateString()}
    vatModeLabel={vatModeLabel}
    data={data}
    selectedEmirate={selectedEmirate}
    result={result}
    zeroRatedSales={n(data.zeroRatedSales)}
    exemptSales={n(data.exemptSales)}
    rows={rows}
  />;
}
