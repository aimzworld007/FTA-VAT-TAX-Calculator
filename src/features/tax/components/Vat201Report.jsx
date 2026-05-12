import React from 'react';
import { buildMonthlyEntries } from '../lib/vatCalculator';
import { formatVatPeriodLabel } from '../lib/vatPeriod';
import { normalizeVatAmounts, normalizeVatPricingMode, VAT_PRICING_MODES } from '../lib/vatPricing';
import { formatAED, InfoLine, KpiCard, ReportFooter, ReportHeader, ReportShell } from './reportShared';

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
  return {
    ...normalizeVatAmounts(standardSales, pricingMode),
    box,
    description,
    adjustment: 0
  };
};


const renderCompanyInfo = ({ data, period, generatedAt, vatModeLabel, selectedEmirate }) => (
  <section className='vat201-company-info'>
    <h3>Company Information</h3>
    <div className='vat201-info-grid'>
      <InfoLine label='Company Name' value={data.businessName || '—'} />
      <InfoLine label='TRN' value={data.trn || '—'} />
      <InfoLine label='Business Location Emirate' value={selectedEmirate} />
      <InfoLine label='VAT Period' value={period} />
      <InfoLine label='Prepared By' value='FTA VAT & Tax Filing Assistant' />
      <InfoLine label='Prepared Date' value={generatedAt.toLocaleString()} />
      <InfoLine label='VAT Pricing Mode' value={vatModeLabel} />
    </div>
  </section>
);

const renderSummaryCards = ({ result, zeroRatedSales, exemptSales }) => {
  const netClass = result.netVat > 0 ? 'payable' : result.netVat < 0 ? 'refundable' : 'neutral';
  return <section className='vat201-kpi-grid'>
    <KpiCard label='Taxable Sales' value={formatAED(result.salesBreakdown.net)} />
    <KpiCard label='Output VAT' value={formatAED(result.outputVat)} />
    <KpiCard label='Recoverable VAT' value={formatAED(result.inputVat)} />
    <KpiCard label='Zero Rated' value={formatAED(zeroRatedSales)} />
    <KpiCard label='Exempt' value={formatAED(exemptSales)} />
    <KpiCard label='Net VAT Result' value={result.netVat >= 0 ? `Payable ${formatAED(result.netVat)}` : `Refundable ${formatAED(Math.abs(result.netVat))}`} tone={netClass} />
  </section>;
};

const renderVatBoxTable = (rows) => <table className='vat201-table fta-table'>
  <thead>
    <tr>
      <th>Box</th>
      <th>Description</th>
      <th className='num'>Amount AED</th>
      <th className='num'>VAT AED</th>
      <th className='num'>Adjustment AED</th>
    </tr>
  </thead>
  <tbody>
    {rows.map((row) => <tr key={row.box} className={row.total ? 'row-total' : ''}>
      <td>{row.box}</td>
      <td>{row.description}</td>
      <td className='num'>{formatAED(row.taxableAmount ?? row.amount ?? 0)}</td>
      <td className='num'>{formatAED(row.vatAmount)}</td>
      <td className='num'>{formatAED(row.adjustment)}</td>
    </tr>)}
  </tbody>
</table>;

const renderDisclaimer = () => <p className='vat201-disclaimer'>This report is a calculation assistant summary only. Verify all figures, invoices, exemptions, input tax eligibility, and FTA requirements before official submission.</p>;

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

  const sectionOneRows = [
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

  return <ReportShell id='vat201-report' className='vat201-report'>
    <ReportHeader title='UAE VAT201 Return Summary' subtitle='Prepared from FTA VAT & Tax Filing Assistant' info={[
      { label: 'Business Name', value: data.businessName || '—' },
      { label: 'TRN', value: data.trn || '—' },
      { label: 'Business Location Emirate', value: selectedEmirate },
      { label: 'VAT Period', value: period },
      { label: 'Prepared Date', value: generatedAt.toLocaleDateString() },
      { label: 'VAT Mode', value: vatModeLabel }
    ]} />
    {renderCompanyInfo({ data, period, generatedAt, vatModeLabel, selectedEmirate })}
    {renderSummaryCards({ result, zeroRatedSales: n(data.zeroRatedSales), exemptSales: n(data.exemptSales) })}
    <section className='vat201-table-wrap'>
      <h3>VAT201 Box Summary</h3>
      {renderVatBoxTable(sectionOneRows)}
    </section>
    {renderDisclaimer()}
    <ReportFooter />
  </ReportShell>;
}
