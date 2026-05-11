import React from 'react';
import { VatWizard } from './VatWizard';
import { CorporateTaxWizard } from './CorporateTaxWizard';
import { draftStorage } from './lib/localDraftStorage';
import { buildMonthlyEntries, calculateVat } from './lib/vatCalculator';
import { calculateCorporateTax } from './lib/corporateTaxCalculator';
import { money, TaxModeCard, TaxSummaryCard } from './components/common.jsx';
import { TAX_CONFIG } from './lib/taxConfig';
import { formatVatPeriodLabel, inferSelectionFromDates, getPeriodFromSelection } from './lib/vatPeriod';

const currentYear = new Date().getFullYear();
const vatDefault = { businessName: '', trn: '', filingFrequency: 'Quarterly', filingYear: currentYear, filingMonth: 'January', filingQuarter: 'Q1', taxPeriodStart: '', taxPeriodEnd: '', standardRatedSales: 0, zeroRatedSales: 0, exemptSales: 0, standardRatedPurchases: 0, recoverableInputVat: 0, nonRecoverableVat: 0, previousAdjustment: 0, badDebtRelief: 0, adjustmentNotes: '', monthlyEntries: [] };
const ctDefault = { companyName: '', taxRegistrationNumber: '', financialYearStart: '', financialYearEnd: '', businessActivity: '', revenue: 0, otherIncome: 0, exemptIncome: 0, directExpenses: 0, adminExpenses: 0, nonDeductibleExpenses: 0, accountingProfit: 0, addBackAdjustments: 0, deductibleAdjustments: 0 };

function normalizeVatDraft(input) {
  const merged = { ...vatDefault, ...input };
  const selection = inferSelectionFromDates(merged);
  const period = getPeriodFromSelection(selection);
  const next = { ...merged, ...selection, ...period };
  next.monthlyEntries = buildMonthlyEntries(next);
  return next;
}

export function TaxDashboard() {
  const [mode, setMode] = React.useState('');
  const [vat, setVat] = React.useState(() => normalizeVatDraft(draftStorage.load('vatDraft', vatDefault)));
  const [ct, setCt] = React.useState(() => draftStorage.load('ctDraft', ctDefault));
  const v = calculateVat(vat);
  const c = calculateCorporateTax(ct);
  const completion = Math.round(((mode === 'vat' ? 1 : 0) + (mode === 'ct' ? 1 : 0)) * 50);

  return <main className='content'><header className='hero'><div><p className='eyebrow'>UAE Tax Calculator</p><h1>UAE VAT & Corporate Tax Calculator</h1><p>Prepare VAT returns and corporate tax estimates with guided calculations.</p></div><div className='hero-card'><span className='badge'>{TAX_CONFIG.badge}</span></div></header>
    <section className='card'><h2>Live Summary</h2><div className='grid-section'><TaxSummaryCard label='VAT Payable / Refundable' value={money(v.netVat)} /><TaxSummaryCard label='VAT Taxable Sales (Auto)' value={money(v.totalSales)} /><TaxSummaryCard label='Corporate Tax Estimate' value={money(c.taxPayable)} /><TaxSummaryCard label='Selected Tax Period' value={formatVatPeriodLabel(vat)} /><TaxSummaryCard label='Completion Progress' value={`${completion}%`} /></div><div className='selector-grid no-print'><TaxModeCard title='VAT Return' desc='Open VAT return wizard' onClick={() => setMode('vat')} active={mode === 'vat'} /><TaxModeCard title='Corporate Tax' desc='Open corporate tax wizard' onClick={() => setMode('ct')} active={mode === 'ct'} /></div></section>
    {mode === 'vat' && <VatWizard data={vat} setData={setVat} onSave={() => draftStorage.save('vatDraft', vat)} onReset={() => { if (confirm('Reset VAT draft?')) { const next = normalizeVatDraft(vatDefault); setVat(next); draftStorage.clear('vatDraft'); } }} />}
    {mode === 'ct' && <CorporateTaxWizard data={ct} setData={setCt} onSave={() => draftStorage.save('ctDraft', ct)} onReset={() => { if (confirm('Reset Corporate Tax draft?')) { setCt(ctDefault); draftStorage.clear('ctDraft'); } }} />}
  </main>;
}
