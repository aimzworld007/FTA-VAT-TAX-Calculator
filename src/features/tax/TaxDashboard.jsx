import React from 'react';
import { VatWizard } from './VatWizard';
import { CorporateTaxWizard } from './CorporateTaxWizard';
import { draftStorage } from './lib/localDraftStorage';
import { buildMonthlyEntries, calculateVat } from './lib/vatCalculator';
import { calculateCorporateTax } from './lib/corporateTaxCalculator';
import { money, TaxModeCard, TaxSummaryCard } from './components/common.jsx';
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
  if (netVat > 0) return { label: 'PAYABLE', amountLabel: money(netVat), className: 'status-payable', prefix: 'Payable' };
  if (netVat < 0) return { label: 'REFUNDABLE', amountLabel: money(Math.abs(netVat)), className: 'status-refundable', prefix: 'Refundable' };
  return { label: 'BALANCED', amountLabel: money(0), className: 'status-balanced', prefix: '' };
}

function normalizeVatDraft(input, workspaceSettings) {
  const merged = { ...vatDefault, ...input, vatPricingMode: normalizeVatPricingMode(input?.vatPricingMode || workspaceSettings.vatPricingMode) };
  const selection = inferSelectionFromDates(merged);
  const period = getPeriodFromSelection(selection);
  const next = { ...merged, ...selection, ...period };
  next.monthlyEntries = buildMonthlyEntries(next);
  return next;
}

function TaxAssistantHeader({ navOpen, setNavOpen }) {
  return <header className='top-navbar no-print'><div className='top-navbar-inner'><div className='brand-lockup'><div className='header-logo' aria-label='FTA tax assistant logo'><img src='/logo.png' alt='FTA VAT & Tax Filing Assistant logo' /></div><div><strong>FTA VAT &amp; Tax Filing Assistant</strong></div></div><button className='nav-toggle' type='button' aria-expanded={navOpen} aria-label='Toggle navigation menu' onClick={() => setNavOpen((prev) => !prev)}>☰</button><nav className={`top-links ${navOpen ? 'open' : ''}`} aria-label='Tax resources'>{navLinks.map((link) => <a key={link.label} href={link.href} target='_blank' rel='noopener noreferrer'>{link.label}</a>)}</nav></div></header>;
}

function LiveSummary({ mode, vatData, vatCalc, ctCalc }) {
  if (mode === 'corporateTax') {
    return <section className='card summary-panel workspace-summary'><h2>Corporate Tax Live Summary</h2><div className='grid-section summary-grid-ct'><TaxSummaryCard label='Corporate Tax Estimate' value={money(ctCalc.taxPayable)} /><TaxSummaryCard label='Taxable Income' value={money(ctCalc.taxableIncome)} /><TaxSummaryCard label='Profit Before Tax' value={money(ctCalc.profitBeforeTax)} /><TaxSummaryCard label='Selected Tax Period' value={formatVatPeriodLabel(vatData)} /></div></section>;
  }
  const vatStatus = getVatStatus(vatCalc.netVat);
  return <section className='card summary-panel workspace-summary'><h2>VAT Live Summary</h2><div className='grid-section summary-grid-vat'><div className='kpi'><div className='kpi-row'><span>VAT Payable / Refundable</span><span className={`status-badge ${vatStatus.className}`}>{vatStatus.label}</span></div><strong>{vatStatus.amountLabel}</strong><small>{vatStatus.prefix ? `${vatStatus.prefix} ${vatStatus.amountLabel}` : vatStatus.amountLabel}</small></div><TaxSummaryCard label='VAT Taxable Sales' value={money(vatCalc.salesBreakdown.net)} /><TaxSummaryCard label='Selected VAT Period' value={formatVatPeriodLabel(vatData)} /></div></section>;
}

export function TaxDashboard() {
  const [activeModule, setActiveModule] = React.useState('home');
  const [navOpen, setNavOpen] = React.useState(false);
  const [workspaceSettings] = React.useState(() => ({ ...workspaceSettingsDefault, ...draftStorage.load('workspaceSettings', workspaceSettingsDefault), vatPricingMode: normalizeVatPricingMode(draftStorage.load('workspaceSettings', workspaceSettingsDefault).vatPricingMode) }));
  const [vat, setVat] = React.useState(() => normalizeVatDraft(draftStorage.load('vatDraft', vatDefault), workspaceSettings));
  const [ct, setCt] = React.useState(() => draftStorage.load('ctDraft', ctDefault));

  const v = calculateVat(vat);
  const c = calculateCorporateTax(ct);

  return <main className='content page-fade-in tax-assistant-app'><TaxAssistantHeader navOpen={navOpen} setNavOpen={setNavOpen} />
    <section className='info-strip card no-print' aria-label='Important filing notice'>
      <div className='info-marquee' role='status' aria-live='polite'>
        <div className='info-marquee-track'>
          <span><strong>UAE Tax Assistant</strong> ℹ️ Guided VAT and Corporate Tax filing support ℹ️ Calculation aid only. Verify before official FTA submission.</span>
          <span aria-hidden='true'><strong>UAE Tax Assistant</strong> ℹ️ Guided VAT and Corporate Tax filing support ℹ️ Calculation aid only. Verify before official FTA submission.</span>
        </div>
      </div>
    </section>

    <section className={`screen-shell ${activeModule === 'home' ? 'is-active' : ''}`}>
      <section className='card'><h2>Choose a tax module</h2><div className='selector-grid no-print'><TaxModeCard title='VAT Return Wizard' badge='UAE VAT 5%' desc='Open VAT return workspace' onClick={() => setActiveModule('vat')} active={false} /><TaxModeCard title='Corporate Tax Wizard' badge='Corporate Tax 9%' desc='Open corporate tax workspace' onClick={() => setActiveModule('corporateTax')} active={false} /></div></section>
    </section>

    {activeModule === 'vat' && <section className='screen-shell is-active wizard-shell'><LiveSummary mode='vat' vatData={vat} vatCalc={v} ctCalc={c} /><div className='workspace-toolbar no-print'><button className='ghost' type='button' onClick={() => setActiveModule('home')}>← Back to Tax Home</button></div><VatWizard data={vat} setData={setVat} onSave={() => draftStorage.save('vatDraft', vat)} onReset={() => { if (confirm('Reset VAT draft?')) { const next = normalizeVatDraft(vatDefault, workspaceSettings); setVat(next); draftStorage.clear('vatDraft'); } }} /></section>}

    {activeModule === 'corporateTax' && <section className='screen-shell is-active wizard-shell'><LiveSummary mode='corporateTax' vatData={vat} vatCalc={v} ctCalc={c} /><div className='workspace-toolbar no-print'><button className='ghost' type='button' onClick={() => setActiveModule('home')}>← Back to Tax Home</button></div><CorporateTaxWizard data={ct} setData={setCt} onSave={() => draftStorage.save('ctDraft', ct)} onReset={() => { if (confirm('Reset Corporate Tax draft?')) { setCt(ctDefault); draftStorage.clear('ctDraft'); } }} /></section>}
  </main>;
}
