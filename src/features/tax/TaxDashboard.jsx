import React from 'react';
import { VatWizard } from './VatWizard';
import { CorporateTaxWizard } from './CorporateTaxWizard';
import { draftStorage } from './lib/localDraftStorage';
import { buildMonthlyEntries, calculateVat } from './lib/vatCalculator';
import { calculateCorporateTax } from './lib/corporateTaxCalculator';
import { money, TaxModeCard, TaxSummaryCard } from './components/common.jsx';
import { TAX_CONFIG } from './lib/taxConfig';
import { formatVatPeriodLabel, inferSelectionFromDates, getPeriodFromSelection } from './lib/vatPeriod';
import { VAT_PRICING_MODES, VAT_PRICING_OPTIONS, normalizeVatPricingMode } from './lib/vatPricing';

const currentYear = new Date().getFullYear();
const workspaceSettingsDefault = { vatPricingMode: VAT_PRICING_MODES.EXCLUSIVE };
const vatDefault = { businessName: '', trn: '', filingFrequency: 'Quarterly', filingYear: currentYear, filingMonth: 'January', filingQuarter: 'Q1', filingStartMonth: 'January', taxPeriodStart: '', taxPeriodEnd: '', standardRatedSales: 0, zeroRatedSales: 0, exemptSales: 0, standardRatedPurchases: 0, recoverableInputVat: 0, nonRecoverableVat: 0, previousAdjustment: 0, badDebtRelief: 0, adjustmentNotes: '', monthlyEntries: [], vatPricingMode: workspaceSettingsDefault.vatPricingMode };
const ctDefault = { companyName: '', taxRegistrationNumber: '', financialYearStart: '', financialYearEnd: '', businessActivity: '', revenue: 0, otherIncome: 0, exemptIncome: 0, directExpenses: 0, adminExpenses: 0, nonDeductibleExpenses: 0, accountingProfit: 0, addBackAdjustments: 0, deductibleAdjustments: 0 };

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

  const updateVatPricingMode = (selectedMode) => {
    const nextMode = normalizeVatPricingMode(selectedMode);
    const nextSettings = { ...workspaceSettings, vatPricingMode: nextMode };
    setWorkspaceSettings(nextSettings);
    draftStorage.save('workspaceSettings', nextSettings);
    setVat((prev) => ({ ...prev, vatPricingMode: nextMode }));
  };

  return <main className='content'><header className='hero'><div><p className='eyebrow'>UAE Tax Calculator</p><h1>UAE VAT & Corporate Tax Calculator</h1><p>Prepare VAT returns and corporate tax estimates with guided calculations.</p></div><div className='hero-card'><span className='badge'>{TAX_CONFIG.badge}</span></div></header>
    <section className='card'>
      <h2>Workspace Settings</h2>
      <div className='setting-card'>
        <div className='setting-header'>
          <h3>VAT Pricing Mode</h3>
          <span className='setting-hint' title='Changing this affects future pricing calculations only.'>ⓘ</span>
        </div>
        <div className='vat-mode-segment'>
          {VAT_PRICING_OPTIONS.map((option) => <button key={option.value} className={`vat-mode-option ${workspaceSettings.vatPricingMode === option.value ? 'active' : ''}`} onClick={() => updateVatPricingMode(option.value)}><strong>{option.label}</strong><small>{option.description}</small></button>)}
        </div>
      </div>
    </section>
    <section className='card'><h2>Live Summary</h2><div className='grid-section'><TaxSummaryCard label='VAT Payable / Refundable' value={money(v.netVat)} /><TaxSummaryCard label='VAT Taxable Sales (Auto)' value={money(v.totalSales)} /><TaxSummaryCard label='Corporate Tax Estimate' value={money(c.taxPayable)} /><TaxSummaryCard label='Selected Tax Period' value={formatVatPeriodLabel(vat)} /></div><div className='selector-grid no-print'><TaxModeCard title='VAT Return' desc='Open VAT return wizard' onClick={() => setMode('vat')} active={mode === 'vat'} /><TaxModeCard title='Corporate Tax' desc='Open corporate tax wizard' onClick={() => setMode('ct')} active={mode === 'ct'} /></div></section>
    {mode === 'vat' && <VatWizard data={vat} setData={setVat} onSave={() => draftStorage.save('vatDraft', vat)} onReset={() => { if (confirm('Reset VAT draft?')) { const next = normalizeVatDraft(vatDefault, workspaceSettings); setVat(next); draftStorage.clear('vatDraft'); } }} />}
    {mode === 'ct' && <CorporateTaxWizard data={ct} setData={setCt} onSave={() => draftStorage.save('ctDraft', ct)} onReset={() => { if (confirm('Reset Corporate Tax draft?')) { setCt(ctDefault); draftStorage.clear('ctDraft'); } }} />}
  </main>;
}
