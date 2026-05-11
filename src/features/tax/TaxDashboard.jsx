import React from 'react';
import { RouteLink } from '../../components/Router';
import { VatWizard } from './VatWizard';
import { CorporateTaxWizard } from './CorporateTaxWizard';
import { draftStorage } from './lib/localDraftStorage';
import { buildMonthlyEntries, calculateVat } from './lib/vatCalculator';
import { calculateCorporateTax } from './lib/corporateTaxCalculator';
import { money, TaxModeCard, TaxSummaryCard } from './components/common.jsx';
import { TAX_CONFIG } from './lib/taxConfig';
import { formatVatPeriodLabel, inferSelectionFromDates, getPeriodFromSelection } from './lib/vatPeriod';
import { VAT_PRICING_MODES, normalizeVatPricingMode } from './lib/vatPricing';

const currentYear = new Date().getFullYear();
const workspaceSettingsDefault = { vatPricingMode: VAT_PRICING_MODES.EXCLUSIVE };
const vatDefault = { businessName: '', trn: '', filingFrequency: 'Quarterly', filingYear: currentYear, filingMonth: 'January', filingQuarter: 'Q1', filingStartMonth: 'January', taxPeriodStart: '', taxPeriodEnd: '', standardRatedSales: 0, zeroRatedSales: 0, exemptSales: 0, standardRatedPurchases: 0, recoverableInputVat: 0, nonRecoverableVat: 0, previousAdjustment: 0, badDebtRelief: 0, adjustmentNotes: '', monthlyEntries: [], vatPricingMode: workspaceSettingsDefault.vatPricingMode };
const ctDefault = { companyName: '', taxRegistrationNumber: '', financialYearStart: '', financialYearEnd: '', businessActivity: '', revenue: 0, otherIncome: 0, exemptIncome: 0, directExpenses: 0, adminExpenses: 0, nonDeductibleExpenses: 0, accountingProfit: 0, addBackAdjustments: 0, deductibleAdjustments: 0 };

const resourceLinks = [
  { label: 'FTA Login', href: 'https://eservices.tax.gov.ae/#/Logon', external: true },
  { label: 'VAT Guidelines', href: 'https://tax.gov.ae/en/taxes/Vat/vat.topics.aspx', external: true },
  { label: 'Corporate Tax Guidelines', href: 'https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx', external: true },
  { label: 'FTA YouTube', href: 'https://www.youtube.com/@uaetax', external: true },
];

function normalizeVatDraft(input, workspaceSettings) {
  const merged = { ...vatDefault, ...input, vatPricingMode: normalizeVatPricingMode(input?.vatPricingMode || workspaceSettings.vatPricingMode) };
  const selection = inferSelectionFromDates(merged);
  const period = getPeriodFromSelection(selection);
  const next = { ...merged, ...selection, ...period };
  next.monthlyEntries = buildMonthlyEntries(next);
  return next;
}

export function TaxDashboard() {
  const [mode, setMode] = React.useState('');
  const [workspaceSettings, setWorkspaceSettings] = React.useState(() => ({ ...workspaceSettingsDefault, ...draftStorage.load('workspaceSettings', workspaceSettingsDefault), vatPricingMode: normalizeVatPricingMode(draftStorage.load('workspaceSettings', workspaceSettingsDefault).vatPricingMode) }));
  const [vat, setVat] = React.useState(() => normalizeVatDraft(draftStorage.load('vatDraft', vatDefault), workspaceSettings));
  const [ct, setCt] = React.useState(() => draftStorage.load('ctDraft', ctDefault));
  const v = calculateVat(vat);
  const c = calculateCorporateTax(ct);

  return <main className='content'><header className='hero'><div><p className='eyebrow'>UAE Tax Calculator</p><h1>UAE VAT & Corporate Tax Calculator</h1><p>Prepare VAT returns and corporate tax estimates with guided calculations.</p></div><div className='hero-card'><span className='badge'>{TAX_CONFIG.badge}</span><nav className='resource-nav no-print' aria-label='Resources'><div className='resource-desktop'>{resourceLinks.map((link) => link.external ? <a key={link.label} className='resource-pill' href={link.href} target='_blank' rel='noreferrer'>{link.label}</a> : <RouteLink key={link.label} className='resource-pill' to={link.href}>{link.label}</RouteLink>)}</div><details className='resource-mobile'><summary>Resources</summary><div className='resource-menu'>{resourceLinks.map((link) => link.external ? <a key={link.label} href={link.href} target='_blank' rel='noreferrer'>{link.label}</a> : <RouteLink key={link.label} to={link.href}>{link.label}</RouteLink>)}</div></details></nav></div></header>
    <section className='card'><h2>Live Summary</h2><div className='grid-section'><TaxSummaryCard label='VAT Payable / Refundable' value={money(v.netVat)} /><TaxSummaryCard label='VAT Taxable Sales (Auto)' value={money(v.salesBreakdown.net)} /><TaxSummaryCard label='Corporate Tax Estimate' value={money(c.taxPayable)} /><TaxSummaryCard label='Selected Tax Period' value={formatVatPeriodLabel(vat)} /></div><div className='selector-grid no-print'><TaxModeCard title='VAT Return' desc='Open VAT return wizard' onClick={() => setMode('vat')} active={mode === 'vat'} /><TaxModeCard title='Corporate Tax' desc='Open corporate tax wizard' onClick={() => setMode('ct')} active={mode === 'ct'} /></div></section>
    {mode === 'vat' && <VatWizard data={vat} setData={setVat} onSave={() => draftStorage.save('vatDraft', vat)} onReset={() => { if (confirm('Reset VAT draft?')) { const next = normalizeVatDraft(vatDefault, workspaceSettings); setVat(next); draftStorage.clear('vatDraft'); } }} />}
    {mode === 'ct' && <CorporateTaxWizard data={ct} setData={setCt} onSave={() => draftStorage.save('ctDraft', ct)} onReset={() => { if (confirm('Reset Corporate Tax draft?')) { setCt(ctDefault); draftStorage.clear('ctDraft'); } }} />}
  </main>;
}
