import React from 'react';
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

const navLinks = [
  { label: 'FTA Login', href: 'https://eservices.tax.gov.ae/#/Logon' },
  { label: 'VAT Guidelines', href: 'https://tax.gov.ae/en/taxes/Vat/vat.topics.aspx' },
  { label: 'Corporate Tax Guidelines', href: 'https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx' },
  { label: 'FTA YouTube', href: 'https://www.youtube.com/@uaetax' },
];

function getVatStatus(netVat) {
  if (netVat > 0) {
    return { type: 'payable', label: 'PAYABLE', amountLabel: money(netVat), className: 'status-payable', prefix: 'Payable' };
  }
  if (netVat < 0) {
    return { type: 'refundable', label: 'REFUNDABLE', amountLabel: money(Math.abs(netVat)), className: 'status-refundable', prefix: 'Refundable' };
  }
  return { type: 'balanced', label: 'BALANCED', amountLabel: money(0), className: 'status-balanced', prefix: '' };
}

function normalizeVatDraft(input, workspaceSettings) {
  const merged = { ...vatDefault, ...input, vatPricingMode: normalizeVatPricingMode(input?.vatPricingMode || workspaceSettings.vatPricingMode) };
  const selection = inferSelectionFromDates(merged);
  const period = getPeriodFromSelection(selection);
  const next = { ...merged, ...selection, ...period };
  next.monthlyEntries = buildMonthlyEntries(next);
  return next;
}

export function TaxDashboard() {
  const [mode, setMode] = React.useState('vat');
  const [navOpen, setNavOpen] = React.useState(false);
  const [logoAvailable, setLogoAvailable] = React.useState(true);
  const [workspaceSettings] = React.useState(() => ({ ...workspaceSettingsDefault, ...draftStorage.load('workspaceSettings', workspaceSettingsDefault), vatPricingMode: normalizeVatPricingMode(draftStorage.load('workspaceSettings', workspaceSettingsDefault).vatPricingMode) }));
  const [vat, setVat] = React.useState(() => normalizeVatDraft(draftStorage.load('vatDraft', vatDefault), workspaceSettings));
  const [ct, setCt] = React.useState(() => draftStorage.load('ctDraft', ctDefault));
  const v = calculateVat(vat);
  const c = calculateCorporateTax(ct);

  return <main className='content page-fade-in'><header className='top-navbar no-print'><div className='top-navbar-inner'><div className='brand-lockup'><div className='header-logo' aria-label='FTA tax assistant logo'>{logoAvailable ? <img src='/logo.png' alt='FTA VAT & Tax Filing Assistant logo' onError={() => setLogoAvailable(false)} /> : <span>FTA</span>}</div><div><strong>FTA VAT &amp; Tax Filing Assistant</strong><div className='badge top-badge'>UAE VAT 5% | Corporate Tax 9%</div></div></div><button className='nav-toggle' type='button' aria-expanded={navOpen} aria-label='Toggle navigation menu' onClick={() => setNavOpen((prev) => !prev)}>☰</button><nav className={`top-links ${navOpen ? 'open' : ''}`} aria-label='Tax resources'>{navLinks.map((link) => <a key={link.label} href={link.href} target='_blank' rel='noopener noreferrer'>{link.label}</a>)}</nav></div></header><header className='hero'><div><p className='eyebrow'>UAE TAX ASSISTANT</p><p className='hero-lead'>Prepare VAT returns and corporate tax estimates with guided step-by-step assistance.</p><p>For calculation assistance and record preparation. Verify figures before official FTA submission.</p></div></header>
    <section className='card summary-panel'><h2>Live Summary</h2><div className={`grid-section ${mode === 'ct' ? 'summary-grid-ct' : 'summary-grid-vat'}`}>{mode === 'ct' ? <><TaxSummaryCard label='Corporate Tax Estimate' value={money(c.taxPayable)} /><TaxSummaryCard label='Taxable Income' value={money(c.taxableIncome)} /><TaxSummaryCard label='Profit Before Tax' value={money(c.profitBeforeTax)} /><TaxSummaryCard label='Selected Tax Period' value={formatVatPeriodLabel(vat)} /></> : (() => { const vatStatus = getVatStatus(v.netVat); return <><div className='kpi'><div className='kpi-row'><span>VAT Payable / Refundable</span><span className={`status-badge ${vatStatus.className}`}>{vatStatus.label}</span></div><strong>{vatStatus.amountLabel}</strong><small>{vatStatus.prefix ? `${vatStatus.prefix} ${vatStatus.amountLabel}` : vatStatus.amountLabel}</small></div><TaxSummaryCard label='VAT Taxable Sales' value={money(v.salesBreakdown.net)} /><TaxSummaryCard label='Selected Tax Period' value={formatVatPeriodLabel(vat)} /></>; })()}</div><div className='selector-grid no-print'><TaxModeCard title='VAT Return' desc='Open VAT return wizard' onClick={() => setMode('vat')} active={mode === 'vat'} /><TaxModeCard title='Corporate Tax' desc='Open corporate tax wizard' onClick={() => setMode('ct')} active={mode === 'ct'} /></div></section>
    {mode === 'vat' && <div className='wizard-shell'>{<VatWizard data={vat} setData={setVat} onSave={() => draftStorage.save('vatDraft', vat)} onReset={() => { if (confirm('Reset VAT draft?')) { const next = normalizeVatDraft(vatDefault, workspaceSettings); setVat(next); draftStorage.clear('vatDraft'); } }} />}</div>}
    {mode === 'ct' && <div className='wizard-shell'>{<CorporateTaxWizard data={ct} setData={setCt} onSave={() => draftStorage.save('ctDraft', ct)} onReset={() => { if (confirm('Reset Corporate Tax draft?')) { setCt(ctDefault); draftStorage.clear('ctDraft'); } }} />}</div>}
  </main>;
}
