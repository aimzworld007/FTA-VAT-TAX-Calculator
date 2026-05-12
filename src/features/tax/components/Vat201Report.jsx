import React from 'react';
import { buildMonthlyEntries } from '../lib/vatCalculator';
import { formatVatPeriodLabel } from '../lib/vatPeriod';
import { normalizeVatAmounts, normalizeVatPricingMode, VAT_PRICING_MODES } from '../lib/vatPricing';
import { money } from './common.jsx';

const emirateRows = [
  ['1a', 'Abu Dhabi', 'Standard rated supplies in Abu Dhabi', 'abuDhabiSales'],
  ['1b', 'Dubai', 'Standard rated supplies in Dubai', 'dubaiSales'],
  ['1c', 'Sharjah', 'Standard rated supplies in Sharjah', 'sharjahSales'],
  ['1d', 'Ajman', 'Standard rated supplies in Ajman', 'ajmanSales'],
  ['1e', 'Umm Al Quwain', 'Standard rated supplies in Umm Al Quwain', 'uaqSales'],
  ['1f', 'Ras Al Khaimah', 'Standard rated supplies in Ras Al Khaimah', 'rakSales'],
  ['1g', 'Fujairah', 'Standard rated supplies in Fujairah', 'fujairahSales']
];

const n = (v) => Number(v) || 0;

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

  const salesRows = emirateRows
    .filter(([, emirate]) => emirate === selectedEmirate)
    .map(([box, , description]) => ({
      ...normalizeVatAmounts(standardSales, pricingMode),
      box,
      description,
      adjustment: 0
    }));

  const sectionOneRows = [
    ...salesRows,
    { box: '2', description: 'Tax Refunds provided to Tourists under the Tax Refunds for Tourists Scheme', amount: 0, vatAmount: 0, adjustment: 0 },
    { box: '3', description: 'Supplies subject to the reverse charge provisions', amount: 0, vatAmount: 0, adjustment: 0 },
    { box: '4', description: 'Zero rated supplies', taxableAmount: n(data.zeroRatedSales), vatAmount: 0, grossAmount: n(data.zeroRatedSales), adjustment: 0 },
    { box: '5', description: 'Exempt supplies', taxableAmount: n(data.exemptSales), vatAmount: 0, grossAmount: n(data.exemptSales), adjustment: 0 },
    { box: '6', description: 'Goods imported into the UAE', amount: 0, vatAmount: 0, adjustment: 0 },
    { box: '7', description: 'Adjustments to goods imported into the UAE', amount: 0, vatAmount: 0, adjustment: result.adjustments },
    { box: '8', description: 'Totals', taxableAmount: result.salesBreakdown.net, vatAmount: result.outputVat, grossAmount: result.salesBreakdown.total, adjustment: result.adjustments, total: true }
  ];

  const sectionTwoRows = [
    { box: '9', description: 'Standard rated expenses', taxableAmount: inputBreakdown.taxableAmount, vatAmount: result.inputVat, grossAmount: inputBreakdown.grossAmount, adjustment: 0 },
    { box: '10', description: 'Supplies subject to the reverse charge provisions', amount: 0, vatAmount: 0, adjustment: 0 },
    { box: '11', description: 'Totals', taxableAmount: inputBreakdown.taxableAmount, vatAmount: result.inputVat, grossAmount: inputBreakdown.grossAmount, adjustment: 0, total: true }
  ];

  const sectionThreeRows = [
    { box: '12', description: 'Total value of due tax for the period', amount: result.outputVat + result.adjustments },
    { box: '13', description: 'Total value of recoverable tax for the period', amount: result.inputVat },
    { box: '14', description: 'Payable tax for the period', amount: result.netVat }
  ];

  return <section id='vat201-report' className='vat201-report'>
    <header className='vat201-doc-header'>
      <h1>VAT Return</h1>
      <div>
        <small>{data.businessName || '—'}</small>
        <small>{period}</small>
        <small>Business Location: {selectedEmirate}</small>
        <small>VAT Mode: {vatModeLabel}</small>
        <small>{generatedAt.toLocaleString()}</small>
      </div>
    </header>
    <p className='field-help'>FTA VAT Return Amount should be excluding VAT. If your sales are VAT-inclusive, the system automatically separates taxable value and VAT.</p>

    <div className='vat201-table-wrap'>
      <h3>1. VAT on Sales and All Other Outputs</h3>
      <ReportTable rows={sectionOneRows} />

      <h3>2. VAT on Expenses and All Other Inputs</h3>
      <ReportTable rows={sectionTwoRows} />

      <h3>3. Net VAT Due</h3>
      <NetTable rows={sectionThreeRows} />
    </div>

    <div className='vat201-summary'>
      <p><strong>Net position:</strong> {result.netVat >= 0 ? `Payable ${money(result.netVat)}` : `Refundable ${money(Math.abs(result.netVat))}`}</p>
      <p>This preview is for internal calculation and record keeping. Please verify figures before filing with the UAE FTA.</p>
    </div>
  </section>;
}

function ReportTable({ rows }) {
  return <table className='vat201-table fta-table'>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount (AED)</th>
        <th>VAT Amount (AED)</th>
        <th>Adjustment (AED)</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => <tr key={row.box} className={row.total ? 'row-total' : ''}>
        <td>{row.box} {row.description}</td>
        <td className='num'>{money(row.taxableAmount ?? row.amount ?? 0)}</td>
        <td className='num'>{money(row.vatAmount)}</td>
        <td className='num'>{money(row.adjustment)}</td>
      </tr>)}
    </tbody>
  </table>;
}

function NetTable({ rows }) {
  return <table className='vat201-table fta-table'>
    <thead>
      <tr>
        <th>Description</th>
        <th>Amount (AED)</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => <tr key={row.box} className={row.box === '14' ? 'row-total' : ''}>
        <td>{row.box} {row.description}</td>
        <td className='num'>{money(row.amount)}</td>
      </tr>)}
    </tbody>
  </table>;
}
