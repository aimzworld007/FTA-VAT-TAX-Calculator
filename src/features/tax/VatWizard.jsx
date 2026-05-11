import React from 'react';
import { buildMonthlyEntries, calculateVat } from './lib/vatCalculator';
import { validateRequired, validateVatPeriodSelection } from './lib/taxValidation';
import { TAX_CONFIG } from './lib/taxConfig';
import { ExportActions, FormSection, TaxSummaryCard, WizardProgress, money } from './components/common.jsx';
import { downloadPdfReport } from './lib/pdfGenerator';
import { Vat201Report } from './components/Vat201Report.jsx';
import { MONTHS, QUARTERS, formatVatPeriodLabel, getPeriodFromSelection } from './lib/vatPeriod';

const steps = ['Business Details', 'Sales', 'Purchases & Expenses', 'Adjustments', 'Review', 'Export'];
const n = (v) => Number(v) || 0;
const clampInput = (v) => Math.max(0, n(v));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

export function VatWizard({ data, setData, onSave, onReset }) {
  const [step, setStep] = React.useState(1);
  const result = calculateVat(data);
  const reqErr = validateRequired(data.businessName, 'Business name') || validateRequired(data.trn, 'TRN') || validateVatPeriodSelection(data);

  React.useEffect(() => {
    const period = getPeriodFromSelection(data);
    const nextEntries = buildMonthlyEntries({ ...data, ...period });
    if (JSON.stringify(nextEntries) !== JSON.stringify(data.monthlyEntries || []) || period.taxPeriodStart !== data.taxPeriodStart || period.taxPeriodEnd !== data.taxPeriodEnd) {
      setData({ ...data, ...period, monthlyEntries: nextEntries });
    }
  }, [data.filingFrequency, data.filingYear, data.filingMonth, data.filingQuarter]);

  const next = () => setStep((s) => Math.min(6, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const updateEntry = (month, key, value) => {
    const updated = buildMonthlyEntries(data).map((entry) => (entry.month === month ? { ...entry, [key]: clampInput(value) } : entry));
    setData({ ...data, monthlyEntries: updated });
  };

  const monthCount = buildMonthlyEntries(data).length;

  return <div><WizardProgress step={step} total={6} /><FormSection title={`VAT Wizard: ${steps[step - 1]}`}>
    {step === 1 && <div className='form-grid two'>
      <input placeholder='Business name' value={data.businessName} onChange={e => setData({ ...data, businessName: e.target.value })} />
      <input placeholder='TRN' value={data.trn} onChange={e => setData({ ...data, trn: e.target.value })} />
      <select value={data.filingFrequency} onChange={e => setData({ ...data, filingFrequency: e.target.value })}>{TAX_CONFIG.filingFrequencies.map(f => <option key={f}>{f}</option>)}</select>
      <select value={data.filingYear} onChange={e => setData({ ...data, filingYear: Number(e.target.value) })}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
      {data.filingFrequency === 'Monthly' && <select value={data.filingMonth} onChange={e => setData({ ...data, filingMonth: e.target.value })}>{MONTHS.map(m => <option key={m}>{m}</option>)}</select>}
      {data.filingFrequency === 'Quarterly' && <select value={data.filingQuarter} onChange={e => setData({ ...data, filingQuarter: e.target.value })}>{QUARTERS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}</select>}
      {data.filingFrequency === 'Yearly' && <p className='field-help'>Full year selected</p>}
      <p className='field-help'>Selected Tax Period: {formatVatPeriodLabel(data)}</p>
      {(reqErr) && <p className='field-help'>{reqErr}</p>}
    </div>}
    {step === 2 && <div className='grid-section'>
      <p className='field-help'>Your selected filing frequency is {data.filingFrequency}, so enter {monthCount} {monthCount === 1 ? 'month' : 'months'} of sales.</p>
      <div className='vat-monthly-wrap'><table className='vat-monthly-table'><thead><tr><th>Month</th><th>Sales</th><th>Output VAT</th></tr></thead><tbody>{buildMonthlyEntries(data).map((entry) => <tr key={entry.month}><td>{entry.month}</td><td><input type='number' min='0' value={entry.sales} onChange={e => updateEntry(entry.month, 'sales', e.target.value)} /></td><td className='vat-readonly'>{money(data.vatMode === 'Inclusive' ? n(entry.sales) - (n(entry.sales) / 1.05) : n(entry.sales) * 0.05)}</td></tr>)}</tbody></table></div>
      <div className='grid-section three'>
        <TaxSummaryCard label='Total Sales' value={money(result.totalSales)} />
        <TaxSummaryCard label='Total Output VAT' value={money(result.outputVat)} />
      </div>
      <div className='form-grid two'>
        <input type='number' min='0' placeholder='Zero-rated sales' value={data.zeroRatedSales} onChange={e => setData({ ...data, zeroRatedSales: e.target.value })} />
        <input type='number' min='0' placeholder='Exempt sales' value={data.exemptSales} onChange={e => setData({ ...data, exemptSales: e.target.value })} />
      </div>
    </div>}
    {step === 3 && <div className='grid-section'>
      <p className='field-help'>Your selected filing frequency is {data.filingFrequency}, so enter {monthCount} {monthCount === 1 ? 'month' : 'months'} of purchases and expenses.</p>
      <div className='vat-monthly-wrap'><table className='vat-monthly-table'><thead><tr><th>Month</th><th>Purchases</th><th>Expenses</th><th>Recoverable VAT</th></tr></thead><tbody>{buildMonthlyEntries(data).map((entry) => { const base = n(entry.purchases) + n(entry.expenses); const recoverable = data.vatMode === 'Inclusive' ? base - (base / 1.05) : base * 0.05; return <tr key={entry.month}><td>{entry.month}</td><td><input type='number' min='0' value={entry.purchases} onChange={e => updateEntry(entry.month, 'purchases', e.target.value)} /></td><td><input type='number' min='0' value={entry.expenses} onChange={e => updateEntry(entry.month, 'expenses', e.target.value)} /></td><td className='vat-readonly'>{money(recoverable)}</td></tr>; })}</tbody></table></div>
      <div className='grid-section four'>
        <TaxSummaryCard label='Total Purchases' value={money(result.totalPurchases)} />
        <TaxSummaryCard label='Total Expenses' value={money(result.totalExpenses)} />
        <TaxSummaryCard label='Total Recoverable VAT' value={money(result.inputVat)} />
      </div>
      <input type='number' min='0' placeholder='Non-recoverable VAT' value={data.nonRecoverableVat} onChange={e => setData({ ...data, nonRecoverableVat: e.target.value })} />
    </div>}
    {step === 4 && <div className='form-grid three'><input type='number' placeholder='Previous period adjustment' value={data.previousAdjustment} onChange={e => setData({ ...data, previousAdjustment: e.target.value })} /><input type='number' placeholder='Bad debt relief' value={data.badDebtRelief} onChange={e => setData({ ...data, badDebtRelief: e.target.value })} /><textarea placeholder='Other adjustment notes' value={data.adjustmentNotes} onChange={e => setData({ ...data, adjustmentNotes: e.target.value })} /></div>}
    {step === 5 && <div className='grid-section'><TaxSummaryCard label='Total output VAT' value={money(result.outputVat)} /><TaxSummaryCard label='Total input VAT' value={money(result.inputVat)} /><TaxSummaryCard label='Adjustments' value={money(result.adjustments)} /><TaxSummaryCard label={result.label} value={money(result.netVat)} /><p>For preparation only. Please verify before official FTA submission.</p></div>}
    {step === 6 && <Vat201Report data={{ ...data, monthlyEntries: buildMonthlyEntries(data) }} result={result} />}
  </FormSection>
    <div className='wizard-nav no-print'><button onClick={back} disabled={step === 1}>Back</button><button onClick={next} disabled={step === 6}>Continue</button></div>
    {step === 6 && <ExportActions onSave={onSave} onReset={onReset} onPrint={() => window.print()} onPdf={() => downloadPdfReport(data)} />}
  </div>;
}
