import React from 'react';
import { buildMonthlyEntries } from '../lib/vatCalculator';
import { money } from './common.jsx';

const emRows = [
  ['1a', 'Abu Dhabi - Standard rated supplies', 'abuDhabiSales'],
  ['1b', 'Dubai - Standard rated supplies', 'dubaiSales'],
  ['1c', 'Sharjah - Standard rated supplies', 'sharjahSales'],
  ['1d', 'Ajman - Standard rated supplies', 'ajmanSales'],
  ['1e', 'Umm Al Quwain - Standard rated supplies', 'uaqSales'],
  ['1f', 'Ras Al Khaimah - Standard rated supplies', 'rakSales'],
  ['1g', 'Fujairah - Standard rated supplies', 'fujairahSales']
];

const val = (v, fallback = '—') => (v === 0 || v ? v : fallback);
const n = (v) => Number(v) || 0;
const sectionTitle = (title) => <h3 className='vat201-section-title'>{title}</h3>;

export function Vat201Report({ data, result }) {
  const generatedAt = new Date();
  const hasEmirates = emRows.some(([, , key]) => n(data[key]) > 0);
  const monthlyEntries = buildMonthlyEntries(data);
  const standardSales = monthlyEntries.reduce((sum, e) => sum + n(e.sales), 0) || n(data.standardRatedSales);
  const totalPurchases = monthlyEntries.reduce((sum, e) => sum + n(e.purchases), 0) || n(data.standardRatedPurchases);
  const totalExpenses = monthlyEntries.reduce((sum, e) => sum + n(e.expenses), 0);
  const row1 = emRows.map(([box, description, key]) => ({
    box,
    description,
    amount: hasEmirates ? n(data[key]) : box === '1c' ? standardSales : 0,
    vat: hasEmirates ? n(data[key]) * 0.05 : box === '1c' ? result.outputVat : 0,
    adjustment: 0
  }));

  const boxRows = [
    ...row1,
    { box: '2', description: 'Tax refunds provided to tourists', amount: 0, vat: 0, adjustment: 0 },
    { box: '3', description: 'Supplies subject to reverse charge provisions', amount: 0, vat: 0, adjustment: 0 },
    { box: '4', description: 'Zero rated supplies', amount: n(data.zeroRatedSales), vat: 0, adjustment: 0 },
    { box: '5', description: 'Exempt supplies', amount: n(data.exemptSales), vat: 0, adjustment: 0 },
    { box: '6', description: 'Goods imported into UAE', amount: 0, vat: 0, adjustment: 0 },
    { box: '7', description: 'Adjustments to goods imported into UAE', amount: 0, vat: 0, adjustment: n(data.previousAdjustment) - n(data.badDebtRelief) },
    { box: '8', description: 'Total output tax due', amount: standardSales, vat: result.outputVat, adjustment: 0, total: true },
    { box: '9', description: 'Standard rated expenses', amount: totalPurchases + totalExpenses, vat: 0, adjustment: 0 },
    { box: '10', description: 'Supplies subject to reverse charge provisions', amount: 0, vat: 0, adjustment: 0 },
    { box: '11', description: 'Total recoverable tax', amount: totalPurchases + totalExpenses, vat: result.inputVat, adjustment: 0, total: true },
    { box: '12', description: 'Total tax due', amount: standardSales, vat: result.outputVat, adjustment: result.adjustments, total: true },
    { box: '13', description: 'Total recoverable tax', amount: totalPurchases + totalExpenses, vat: result.inputVat, adjustment: 0, total: true },
    { box: '14', description: 'Payable tax for the period', amount: 0, vat: result.netVat, adjustment: 0, total: true }
  ];

  const period = data.taxPeriodStart && data.taxPeriodEnd ? `${data.taxPeriodStart} to ${data.taxPeriodEnd}` : '—';
  const monthlyRows = monthlyEntries.map((entry) => {
    const sales = n(entry.sales);
    const purchases = n(entry.purchases);
    const expenses = n(entry.expenses);
    const outputVat = data.vatMode === 'Inclusive' ? sales - (sales / 1.05) : sales * 0.05;
    const recoverableVat = data.vatMode === 'Inclusive'
      ? (purchases + expenses) - ((purchases + expenses) / 1.05)
      : (purchases + expenses) * 0.05;
    return { month: entry.month, sales, purchases, expenses, outputVat, recoverableVat, netVat: outputVat - recoverableVat };
  });

  return <section id='vat201-report' className='vat201-report'>
    <header className='vat201-header'>
      <div className='vat201-logo'>FTA</div>
      <div><h1>UAE VAT201 Return Summary</h1><p>Prepared from UAE VAT Return Calculator Pro</p></div>
      <aside>
        <small>{val(data.businessName)}</small>
        <small>{period}</small>
        <small>{generatedAt.toLocaleString()}</small>
      </aside>
    </header>

    {sectionTitle('Company Information')}
    <div className='vat201-box vat201-company'>
      {[
        ['Company Name', val(data.businessName)], ['TRN', val(data.trn)], ['VAT Period', period],
        ['Prepared By', val(data.preparedBy)], ['Prepared Date', generatedAt.toLocaleDateString()], ['VAT Mode', val(data.vatMode || 'Standard')]
      ].map(([k, v]) => <div key={k}><label>{k}</label><strong>{v}</strong></div>)}
    </div>

    {sectionTitle('VAT Summary')}
    <div className='vat201-cards'>
      <Card label='Taxable Sales' value={money(standardSales)} />
      <Card label='Output VAT' value={money(result.outputVat)} />
      <Card label='Recoverable VAT' value={money(result.inputVat)} />
      <Card label='Zero Rated' value={money(n(data.zeroRatedSales))} />
      <Card label='Exempt' value={money(n(data.exemptSales))} />
      <Card label='Net VAT' value={`${result.netVat >= 0 ? 'Payable' : 'Refundable'} ${money(Math.abs(result.netVat))}`} />
    </div>

    {sectionTitle('VAT201 Box Summary')}
    <ReportTable rows={boxRows} />

    {sectionTitle('Monthly Input Summary')}
    <table className='vat201-table'>
      <thead><tr><th>Month</th><th>Sales</th><th>Purchases</th><th>Expenses</th><th>Output VAT</th><th>Recoverable VAT</th><th>Net VAT</th></tr></thead>
      <tbody>{monthlyRows.map((r, i) => <tr key={i}><td>{val(r.month)}</td><td>{money(r.sales)}</td><td>{money(r.purchases)}</td><td>{money(r.expenses)}</td><td>{money(r.outputVat)}</td><td>{money(r.recoverableVat)}</td><td>{money(r.netVat)}</td></tr>)}</tbody>
    </table>

    {sectionTitle('Declaration / Signature')}
    <div className='vat201-box'>
      <div className='vat201-signatures'><Sig title='Prepared By / Signature' value={val(data.preparedBy)} /><Sig title='Reviewed By / Signature' value='—' /><Sig title='Submission Date / Date' value={generatedAt.toLocaleDateString()} /></div>
      <p className='vat201-note'>This report is a calculation aid only. Verify UAE FTA rules, invoice eligibility, exempt/zero-rated supplies, and accounting records before official VAT submission.</p>
    </div>

    <footer className='vat201-footer'>Disclaimer: This report is for draft computation support and must be validated before filing.</footer>
  </section>;
}

function ReportTable({ rows }) {return <table className='vat201-table'><thead><tr><th>Box</th><th>Description</th><th>Amount AED</th><th>VAT AED</th><th>Adjustment AED</th></tr></thead><tbody>{rows.map((r) => <tr key={r.box} className={r.total ? 'row-total' : ''}><td>{r.box}</td><td>{r.description}</td><td className='num'>{money(r.amount)}</td><td className='num'>{money(r.vat)}</td><td className='num'>{money(r.adjustment)}</td></tr>)}</tbody></table>;}
function Card({ label, value }) { return <article className='vat201-card'><label>{label}</label><strong>{value}</strong></article>; }
function Sig({ title, value }) { return <div className='sig-box'><span>{title}</span><strong>{value}</strong></div>; }
