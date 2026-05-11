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

const navLinks = [
  { label: 'FTA Login', href: 'https://eservices.tax.gov.ae/#/Logon', external: true },
  { label: 'VAT Guidelines', href: 'https://tax.gov.ae/en/taxes/Vat/vat.topics.aspx', external: true },
  { label: 'Corporate Tax Guidelines', href: 'https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx', external: true },
  { label: 'FTA YouTube', href: 'https://www.youtube.com/@uaetax', external: true },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Documentation', href: '/documentation' },
];

function LiveSummaryChart({ vatResult, corporateResult }) {
  const points = [
    { label: 'Sales Base', value: Math.max(vatResult.salesBreakdown.net, 0) },
    { label: 'VAT Due', value: Math.max(vatResult.outputVat, 0) },
    { label: 'Input VAT', value: Math.max(vatResult.recoverableVat, 0) },
    { label: 'Net VAT', value: Math.abs(vatResult.netVat) },
    { label: 'CT Estimate', value: Math.max(corporateResult.taxPayable, 0) },
  ];
  const hasData = points.some((point) => point.value > 0);
  const maxValue = Math.max(...points.map((point) => point.value), 1);
  const pathPoints = points
    .map((point, idx) => {
      const x = (idx / (points.length - 1)) * 100;
      const y = 88 - (point.value / maxValue) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className='live-summary-chart' aria-live='polite'>
      <div className='chart-header'>
        <h3>Live Calculation Trend</h3>
        <p>Session view based on current values only.</p>
      </div>
      {hasData ? (
        <>
          <svg viewBox='0 0 100 100' role='img' aria-label='Live calculation trend chart'>
            <polyline points={pathPoints} className='chart-line' />
            {points.map((point, idx) => {
              const x = (idx / (points.length - 1)) * 100;
              const y = 88 - (point.value / maxValue) * 70;
              return <circle key={point.label} cx={x} cy={y} r='2.2' className='chart-dot' />;
            })}
          </svg>
          <div className='chart-labels'>
            {points.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        </>
      ) : (
        <div className='chart-placeholder'>Graph will update as you enter values.</div>
      )}
    </div>
  );
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
  const [mode, setMode] = React.useState('');
  const [navOpen, setNavOpen] = React.useState(false);
  const [workspaceSettings, setWorkspaceSettings] = React.useState(() => ({ ...workspaceSettingsDefault, ...draftStorage.load('workspaceSettings', workspaceSettingsDefault), vatPricingMode: normalizeVatPricingMode(draftStorage.load('workspaceSettings', workspaceSettingsDefault).vatPricingMode) }));
  const [vat, setVat] = React.useState(() => normalizeVatDraft(draftStorage.load('vatDraft', vatDefault), workspaceSettings));
  const [ct, setCt] = React.useState(() => draftStorage.load('ctDraft', ctDefault));
  const v = calculateVat(vat);
  const c = calculateCorporateTax(ct);

  return <main className='content page-fade-in'><header className='top-navbar no-print'><div className='top-navbar-inner'><span className='badge top-badge'>{TAX_CONFIG.badge}</span><button className='nav-toggle' type='button' aria-expanded={navOpen} aria-label='Toggle navigation menu' onClick={() => setNavOpen((prev) => !prev)}>☰</button><nav className={`top-links ${navOpen ? 'open' : ''}`} aria-label='Tax resources and pages'>{navLinks.map((link) => link.external ? <a key={link.label} href={link.href} target='_blank' rel='noopener noreferrer'>{link.label}</a> : <RouteLink key={link.label} to={link.href} onClick={() => setNavOpen(false)}>{link.label}</RouteLink>)}</nav></div></header><header className='hero'><div><p className='eyebrow'>UAE Tax Calculator</p><h1>UAE VAT & Corporate Tax Calculator</h1><p>Prepare VAT returns and corporate tax estimates with guided calculations.</p></div></header>
    <section className='card summary-panel'><h2>Live Summary</h2><div className='grid-section'><TaxSummaryCard label='VAT Payable / Refundable' value={money(v.netVat)} /><TaxSummaryCard label='VAT Taxable Sales (Auto)' value={money(v.salesBreakdown.net)} /><TaxSummaryCard label='Corporate Tax Estimate' value={money(c.taxPayable)} /><TaxSummaryCard label='Selected Tax Period' value={formatVatPeriodLabel(vat)} /></div><LiveSummaryChart vatResult={v} corporateResult={c} /><div className='selector-grid no-print'><TaxModeCard title='VAT Return' desc='Open VAT return wizard' onClick={() => setMode('vat')} active={mode === 'vat'} /><TaxModeCard title='Corporate Tax' desc='Open corporate tax wizard' onClick={() => setMode('ct')} active={mode === 'ct'} /></div></section>
    {mode === 'vat' && <div className='wizard-shell'>{<VatWizard data={vat} setData={setVat} onSave={() => draftStorage.save('vatDraft', vat)} onReset={() => { if (confirm('Reset VAT draft?')) { const next = normalizeVatDraft(vatDefault, workspaceSettings); setVat(next); draftStorage.clear('vatDraft'); } }} />}</div>}
    {mode === 'ct' && <div className='wizard-shell'>{<CorporateTaxWizard data={ct} setData={setCt} onSave={() => draftStorage.save('ctDraft', ct)} onReset={() => { if (confirm('Reset Corporate Tax draft?')) { setCt(ctDefault); draftStorage.clear('ctDraft'); } }} />}</div>}
  </main>;
}
