import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Building2, Calculator, FileText, RotateCcw, Printer, Landmark, BadgeCheck, Save, ArrowLeft } from 'lucide-react';
import './styles.css';
import { money } from './domain/shared/money';
import { toNumber as number } from './domain/shared/number';
import { VAT_RULES_2026 } from './domain/vat/rules';
import { calculateVat } from './domain/vat/calculator';
import { CORPORATE_TAX_RULES_2026 } from './domain/corporateTax/rules';
import { calculateCorporateTax } from './domain/corporateTax/calculator';
import { usePersistentState } from './infrastructure/storage/usePersistentState';

const FTA_LOGO = 'https://eservices.tax.gov.ae/sap/public/bc/ui2/zmcf_fmca_public/user_management/img/FTA_logo_new.png';
const VAT_DEFAULT = { emirate: '1c', mode: VAT_RULES_2026.defaultMode, zeroRated: 0, exemptSales: 0, salesAdjustmentVat: 0, expenseAdjustmentVat: 0, notes: '', months: [{ month: '', sales: 0, purchases: 0, expenses: 0 }, { month: '', sales: 0, purchases: 0, expenses: 0 }, { month: '', sales: 0, purchases: 0, expenses: 0 }] };
const CT_DEFAULT = { fyStart: '2026-01-01', fyEnd: '2026-12-31', entityType: 'Mainland / Normal UAE Business', smallBusinessRelief: 'no', revenue: 0, cost: 0, deductible: 0, nonDeductible: 0, exemptIncome: 0, loss: 0, notes: '' };

const reqProfile = ['businessName'];
const profileFields = [
  { key: 'businessName', label: 'Business Name', required: true },
  { key: 'trn', label: 'TRN', required: false },
  { key: 'preparedBy', label: 'Prepared By', required: false },
  { key: 'period', label: 'Period', required: false },
];
const reqVatStep1 = ['emirate', 'mode'];
const reqCtStep2 = ['revenue', 'cost', 'deductible'];

function Field({ label, required, help, error, children }) {
  return <label className="field"><span>{label}{required && <em>*</em>}</span>{children}{(error || help) && <small className="field-help">{error || help}</small>}</label>;
}
const Kpi = ({ label, value, tone = '', note }) => <div className={`kpi ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [wizardStep, setWizardStep] = usePersistentState('uaeTaxSuiteWizardStep', { vat: 0, ct: 0 });
  const [profile, setProfile] = usePersistentState('uaeTaxSuiteProfile', { businessName: '', trn: '', preparedBy: '', period: '' });
  const [vat, setVat] = usePersistentState('uaeTaxSuiteVat', VAT_DEFAULT);
  const [ct, setCt] = usePersistentState('uaeTaxSuiteCorporateTax', CT_DEFAULT);
  const [meta, setMeta] = usePersistentState('uaeTaxSuiteMeta', { vatEditedAt: '', ctEditedAt: '' });

  const vatResult = useMemo(() => calculateVat(vat, VAT_RULES_2026), [vat]);
  const ctResult = useMemo(() => calculateCorporateTax(ct, CORPORATE_TAX_RULES_2026), [ct]);

  const touch = (k) => setMeta((m) => ({ ...m, [k]: new Date().toISOString() }));
  const setVatTracked = (v) => { setVat(v); touch('vatEditedAt'); };
  const setCtTracked = (v) => { setCt(v); touch('ctEditedAt'); };

  const completion = useMemo(() => {
    const p = profileFields.filter((f) => String(profile[f.key] || '').trim()).length;
    const vatInputs = [vat.zeroRated, vat.exemptSales, vat.salesAdjustmentVat, vat.expenseAdjustmentVat, ...vat.months.flatMap((m) => [m.sales, m.purchases, m.expenses])].filter((v) => Number(v) !== 0).length + vat.months.filter((m) => String(m.month || '').trim()).length;
    const ctInputs = [ct.revenue, ct.cost, ct.deductible, ct.nonDeductible, ct.exemptIncome, ct.loss].filter((v) => Number(v) !== 0).length;
    return { profile: Math.round((p / profileFields.length) * 100), vat: Math.round((vatInputs / 16) * 100), ct: Math.round((ctInputs / 6) * 100) };
  }, [profile, vat, ct]);

  const openWizard = (type) => {
    const profileComplete = reqProfile.every((k) => String(profile[k] || '').trim());
    if (profileComplete) setModuleStep(type, 1);
    setActiveTab(type);
  };
  const setModuleStep = (type, step) => setWizardStep((s) => ({ ...s, [type]: step }));
  const missingRequired = reqProfile.filter((k) => !String(profile[k] || '').trim()).length;
  const resetAll = () => { if (!confirm('Reset all saved values in this browser?')) return; ['uaeTaxSuiteProfile', 'uaeTaxSuiteVat', 'uaeTaxSuiteCorporateTax', 'uaeTaxSuitePriorPeriod', 'uaeTaxSuiteWizardStep'].forEach((k) => localStorage.removeItem(k)); location.reload(); };

  return <LayoutShell activeTab={activeTab} sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} resetAll={resetAll} />}>
    <HeroHeader vatResult={vatResult} />
    <div className="content-grid">
      <div>
      <PrintMeta activeTab={activeTab} profile={profile} />
        {activeTab === 'home' && <HomeDashboard completion={completion} meta={meta} vatResult={vatResult} ctResult={ctResult} onSelect={openWizard} profile={profile} setProfile={setProfile} />}
        {activeTab === 'vat' && <WizardShell type="vat" wizardStep={wizardStep.vat} setWizardStep={(n) => setModuleStep('vat', n)} profile={profile} setProfile={setProfile} vat={vat} setVat={setVatTracked} result={vatResult} completion={completion.vat} meta={meta} backHome={() => setActiveTab('home')} />}
        {activeTab === 'ct' && <WizardShell type="ct" wizardStep={wizardStep.ct} setWizardStep={(n) => setModuleStep('ct', n)} profile={profile} setProfile={setProfile} ct={ct} setCt={setCtTracked} result={ctResult} completion={completion.ct} meta={meta} backHome={() => setActiveTab('home')} />}
      </div>
      <LiveSummary activeTab={activeTab} vatResult={vatResult} ctResult={ctResult} completion={completion} missingRequired={missingRequired} />
    </div>
  </LayoutShell>;
}
const LayoutShell = ({ activeTab, sidebar, children }) => <div className={`app-shell ${activeTab === 'vat' ? 'print-vat' : activeTab === 'ct' ? 'print-ct' : ''}`}>{sidebar}<main className="content">{children}</main></div>;
const Sidebar = ({ activeTab, setActiveTab, resetAll }) => <aside className="sidebar no-print"><div className="brand"><img src={FTA_LOGO} alt="FTA UAE" /><div><strong>UAE Tax Suite</strong><span>VAT + Corporate Tax</span></div></div><button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}><Landmark size={18} />Home</button><button className={activeTab === 'vat' ? 'active' : ''} onClick={() => setActiveTab('vat')}><FileText size={18} />VAT Return</button><button className={activeTab === 'ct' ? 'active' : ''} onClick={() => setActiveTab('ct')}><Calculator size={18} />Corporate Tax</button><button className="danger" onClick={resetAll}><RotateCcw size={18} />Reset</button></aside>;
const HeroHeader = ({ vatResult }) => <header className="hero"><div><p className="eyebrow">🇦🇪 Internal UAE tax worksheet</p><h1>UAE Tax Suite Wizard</h1></div><div className="hero-card"><BadgeCheck /><span>Auto saved locally</span><strong>{money(Math.abs(vatResult.netVat))}</strong><small>{vatResult.isPayable ? 'Estimated VAT payable' : 'Estimated VAT refund / credit'}</small></div></header>;

const getStatus = (pct) => (pct === 0 ? 'Not Started' : pct === 100 ? 'Ready' : 'Draft');
const TaxSelectionCards = ({ completion, meta, vatResult, ctResult, onSelect, canSelect }) => <div className="selector-grid">{[
  { key: 'vat', title: 'VAT Return', desc: 'Prepare UAE VAT return through guided steps.', pct: completion.vat, edited: meta.vatEditedAt, amount: money(vatResult.netVat), cta: completion.vat ? 'Continue VAT' : 'Start VAT' },
  { key: 'ct', title: 'Corporate Tax', desc: 'Calculate UAE corporate tax and review adjustments.', pct: completion.ct, edited: meta.ctEditedAt, amount: money(ctResult.taxDue), cta: completion.ct ? 'Continue CT' : 'Start CT' },
].map((c) => <div key={c.key} className="selector-card material"><strong>{c.title}</strong><p>{c.desc}</p><span>Completion: {c.pct}%</span><span>Status: {getStatus(c.pct)}</span><span>Last edited: {c.edited ? new Date(c.edited).toLocaleString() : 'Never'}</span><span>Key amount: {c.amount}</span><button className="cta" disabled={!canSelect} title={!canSelect ? 'Complete Business Profile first.' : ''} onClick={() => onSelect(c.key)}>{c.cta}</button></div>)}</div>;

const HomeDashboard = ({ completion, meta, vatResult, ctResult, onSelect, profile, setProfile }) => {
  const missingProfile = reqProfile.filter((k) => !String(profile[k] || '').trim());
  const canSelect = missingProfile.length === 0;

  return <>
    <SharedBusinessProfile profile={profile} setProfile={setProfile} errors={missingProfile} />
    <section className="card">
      <div className="card-title">
        <h2>Dashboard</h2>
        {!canSelect && <small>Complete Business Profile to continue.</small>}
      </div>
      <TaxSelectionCards completion={completion} meta={meta} vatResult={vatResult} ctResult={ctResult} onSelect={onSelect} canSelect={canSelect} />
    </section>
  </>;
};
const SharedBusinessProfile = ({ profile, setProfile, errors = [] }) => <section className="card"><div className="card-title"><h2><Building2 size={20} />Business Profile</h2></div><div className="form-grid four">{profileFields.map((field) => <Field key={field.key} label={field.label} required={field.required} error={field.required && errors.includes(field.key) ? 'Required field.' : ''}><input className={field.required && errors.includes(field.key) ? 'invalid' : ''} value={profile[field.key]} onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })} /></Field>)}</div></section>;

function WizardShell({ type, wizardStep, setWizardStep, profile, setProfile, vat, setVat, ct, setCt, result, completion, meta, backHome }) {
  const steps = type === 'vat' ? ['Profile', 'Inputs', 'Review', 'Export'] : ['Profile', 'Revenue & Expenses', 'Adjustments / Relief', 'Review & Export'];
  const requiredNow = wizardStep === 0 ? reqProfile.filter((k) => !String(profile[k] || '').trim()) : type === 'vat' && wizardStep === 1 ? reqVatStep1.filter((k) => !String(vat[k] || '').trim()) : type === 'ct' && wizardStep === 1 ? reqCtStep2.filter((k) => String(ct[k] ?? '').trim() === '') : [];
  const canNext = requiredNow.length === 0;
  const atFinalStep = wizardStep === steps.length - 1;

  return <section className="wizard-wrap">
    <section className="card wizard-topbar"><button className="ghost" onClick={backHome}><ArrowLeft size={16} /> Back to Dashboard</button><strong>{type === 'vat' ? 'VAT Return Wizard' : 'Corporate Tax Wizard'}</strong><span>Completion: {completion}%</span><span>Autosave: {type === 'vat' ? (meta.vatEditedAt ? 'Saved' : 'Waiting') : (meta.ctEditedAt ? 'Saved' : 'Waiting')}</span></section>
    <WizardStepTabs steps={steps} wizardStep={wizardStep} setWizardStep={setWizardStep} />
    <WizardProgressBar label={steps[wizardStep]} percent={Math.round(((wizardStep + 1) / steps.length) * 100)} statusText={requiredNow.length ? `${requiredNow.length} required missing` : 'Ready to continue'} />
    {type === 'vat' ? <VatWizard wizardStep={wizardStep} profile={profile} setProfile={setProfile} vat={vat} setVat={setVat} result={result} /> : <CorporateTaxWizard wizardStep={wizardStep} ct={ct} setCt={setCt} result={result} profile={profile} setProfile={setProfile} />}
    {atFinalStep && <ExportActions type={type} canExport />}
    <div className="wizard-nav"><button disabled={wizardStep === 0} onClick={() => setWizardStep(wizardStep - 1)}>Previous</button><button disabled={atFinalStep || !canNext} onClick={() => setWizardStep(wizardStep + 1)}>Next</button></div>
  </section>;
}
const WizardStepTabs = ({ steps, wizardStep, setWizardStep }) => <div className="wizard-steps">{steps.map((s, i) => <button key={s} className={i === wizardStep ? 'active' : ''} onClick={() => setWizardStep(i)}>{i + 1}. {s}</button>)}</div>;

function VatWizard({ wizardStep, profile, setProfile, vat, setVat, result }) {
  const update = (key, value) => setVat({ ...vat, [key]: value });
  const updateMonth = (i, key, value) => { const months = [...vat.months]; months[i] = { ...months[i], [key]: value }; setVat({ ...vat, months }); };
  if (wizardStep === 0) return <SharedBusinessProfile profile={profile} setProfile={setProfile} errors={reqProfile.filter((k) => !String(profile[k] || '').trim())} />;
  if (wizardStep === 1) return <section className="card"><div className="form-grid three"><Field label="Main Emirate" required><select value={vat.emirate} onChange={e => update('emirate', e.target.value)}>{Object.entries(VAT_RULES_2026.emirates).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field><Field label="Amount Type" required><select value={vat.mode} onChange={e => update('mode', e.target.value)}><option value="inclusive">VAT Inclusive</option><option value="exclusive">VAT Exclusive</option></select></Field><Field label="Sales Adjustment VAT"><input type="number" value={vat.salesAdjustmentVat} onChange={e => update('salesAdjustmentVat', e.target.value)} /></Field><Field label="Expense Adjustment VAT"><input type="number" value={vat.expenseAdjustmentVat} onChange={e => update('expenseAdjustmentVat', e.target.value)} /></Field><Field label="Zero Rated Sales"><input type="number" value={vat.zeroRated} onChange={e => update('zeroRated', e.target.value)} /></Field><Field label="Exempt Sales"><input type="number" value={vat.exemptSales} onChange={e => update('exemptSales', e.target.value)} /></Field></div><div className="month-grid">{vat.months.map((m, i) => <div className="month-card" key={i}><Field label={`Month ${i + 1}`}><input value={m.month} onChange={e => updateMonth(i, 'month', e.target.value)} /></Field><Field label="Sales"><input type="number" value={m.sales} onChange={e => updateMonth(i, 'sales', e.target.value)} /></Field><Field label="Purchases"><input type="number" value={m.purchases} onChange={e => updateMonth(i, 'purchases', e.target.value)} /></Field><Field label="Expenses"><input type="number" value={m.expenses} onChange={e => updateMonth(i, 'expenses', e.target.value)} /></Field></div>)}</div></section>;
  if (wizardStep === 2) return <><VatReturnPdfLayout profile={profile} vat={vat} result={result} /><ReviewSummary type="vat" result={result} /></>;
  return <><VatReturnPdfLayout profile={profile} vat={vat} result={result} /><ReviewSummary type="vat" result={result} /></>;
}
function CorporateTaxWizard({ wizardStep, ct, setCt, result, profile, setProfile }) {
  const update = (k, v) => setCt({ ...ct, [k]: v });
  if (wizardStep === 0) return <SharedBusinessProfile profile={profile} setProfile={setProfile} errors={reqProfile.filter((k) => !String(profile[k] || '').trim())} />;
  if (wizardStep === 1) return <section className="card"><div className="form-grid three"><Field label="Financial Year Start"><input type="date" value={ct.fyStart} onChange={e => update('fyStart', e.target.value)} /></Field><Field label="Financial Year End"><input type="date" value={ct.fyEnd} onChange={e => update('fyEnd', e.target.value)} /></Field><Field label="Entity Type"><input value={ct.entityType} onChange={e => update('entityType', e.target.value)} /></Field><Field label="Total Revenue / Sales" required><input type="number" value={ct.revenue} onChange={e => update('revenue', e.target.value)} /></Field><Field label="Cost of Sales / Direct Costs" required><input type="number" value={ct.cost} onChange={e => update('cost', e.target.value)} /></Field><Field label="Deductible Expenses" required><input type="number" value={ct.deductible} onChange={e => update('deductible', e.target.value)} /></Field></div></section>;
  if (wizardStep === 2) return <section className="card"><div className="form-grid three"><Field label="Small Business Relief"><select value={ct.smallBusinessRelief} onChange={e => update('smallBusinessRelief', e.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></Field><Field label="Non-Deductible Expenses"><input type="number" value={ct.nonDeductible} onChange={e => update('nonDeductible', e.target.value)} /></Field><Field label="Exempt / Non-Taxable Income"><input type="number" value={ct.exemptIncome} onChange={e => update('exemptIncome', e.target.value)} /></Field><Field label="Tax Loss Carried Forward"><input type="number" value={ct.loss} onChange={e => update('loss', e.target.value)} /></Field></div></section>;
  return <ReviewSummary type="ct" result={result} />;
}


const vatBoxRows = [
  { box: '1a', description: 'Standard rated supplies', amountKey: 'taxableSales', vatKey: 'outputVat' },
  { box: '1b', description: 'Tax due on standard rated supplies', amountKey: null, vatKey: null },
  { box: '2', description: 'Tax due on reverse charge supplies', amountKey: null, vatKey: null },
  { box: '3', description: 'Zero-rated supplies', amountKey: 'zeroRated', vatKey: null },
  { box: '4', description: 'Exempt supplies', amountKey: 'exemptSales', vatKey: null },
  { box: '5', description: 'Total sales and all outputs', amountKey: 'grossSales', vatKey: 'outputVat' },
  { box: '6', description: 'Standard rated expenses', amountKey: 'taxableInputs', vatKey: 'inputVat' },
  { box: '7', description: 'Recoverable tax for expenses', amountKey: null, vatKey: null },
  { box: '8', description: 'Reverse charge expenses', amountKey: null, vatKey: null },
  { box: '9', description: 'Total expenses and all inputs', amountKey: 'grossPurchases', vatKey: 'inputVat' },
  { box: '10', description: 'Payable tax for the period', amountKey: null, vatKey: 'netVat' },
];

const VatReturnPdfLayout = ({ profile, vat, result }) => {
  const monthlyRows = vat.months.map((m, idx) => ({
    month: m.month || `Month ${idx + 1}`,
    sales: number(m.sales),
    purchases: number(m.purchases),
    expenses: number(m.expenses),
  }));
  const grossSales = result.sales + number(vat.zeroRated) + number(vat.exemptSales);
  const grossPurchases = result.purchases + result.expenses;
  const mapValue = (key) => {
    if (!key) return 'AED 0.00';
    if (key === 'zeroRated') return money(vat.zeroRated);
    if (key === 'exemptSales') return money(vat.exemptSales);
    if (key === 'grossSales') return money(grossSales);
    if (key === 'grossPurchases') return money(grossPurchases);
    return money(result[key]);
  };

  return <section className="card vat201-sheet">
    <div className="vat201-topline"><strong>UAE VAT201 Return Summary</strong><span>{profile.businessName || 'Business Name'}</span></div>
    <div className="vat201-company-grid">
      <div><label>Company</label><p>{profile.businessName || '-'}</p></div>
      <div><label>TRN</label><p>{profile.trn || '-'}</p></div>
      <div><label>Tax Period</label><p>{profile.period || '-'}</p></div>
      <div><label>Prepared By</label><p>{profile.preparedBy || '-'}</p></div>
    </div>

    <h3>VAT Summary</h3>
    <div className="vat201-kpis">
      <Kpi label="Total Sales" value={money(grossSales)} />
      <Kpi label="Output VAT" value={money(result.outputVat)} />
      <Kpi label="Recoverable VAT" value={money(result.inputVat)} />
      <Kpi label={result.isPayable ? 'Net VAT Payable' : 'Net VAT Refundable'} value={money(result.netVat)} tone={result.isPayable ? 'danger' : 'success'} />
    </div>

    <h3>VAT201 Box Summary</h3>
    <table>
      <thead><tr><th>Box</th><th>Description</th><th>Amount (AED)</th><th>VAT (AED)</th></tr></thead>
      <tbody>{vatBoxRows.map((row) => <tr key={row.box}><td>{row.box}</td><td>{row.description}</td><td>{mapValue(row.amountKey)}</td><td>{mapValue(row.vatKey)}</td></tr>)}</tbody>
    </table>

    <h3>Monthly Input Summary</h3>
    <table>
      <thead><tr><th>Month</th><th>Sales</th><th>Purchases</th><th>Expenses</th></tr></thead>
      <tbody>
        {monthlyRows.map((m) => <tr key={m.month}><td>{m.month}</td><td>{money(m.sales)}</td><td>{money(m.purchases)}</td><td>{money(m.expenses)}</td></tr>)}
      </tbody>
    </table>
  </section>;
};

const ReviewSummary = ({ type, result }) => <section className="card"><h2>{type === 'vat' ? 'VAT Totals' : 'Corporate Tax Summary'}</h2><div className="grid-section">{type === 'vat' ? <><Kpi label="Output VAT" value={money(result.outputVat)} /><Kpi label="Input VAT" value={money(result.inputVat)} /><Kpi label="Adjustments" value={money(number(result.salesAdjustmentVat) + number(result.expenseAdjustmentVat))} /><Kpi label="VAT payable/refundable" value={money(result.netVat)} tone={result.isPayable ? 'danger' : 'success'} /></> : <><Kpi label="Taxable Income" value={money(result.taxableIncome)} /><Kpi label="Corporate Tax Due" value={money(result.taxDue)} tone="success" /></>}</div></section>;
const ExportActions = ({ type, canExport }) => <section className="card no-print"><h2>Export</h2>{canExport ? <div className="wizard-export"><button onClick={() => window.print()}><FileText size={16} />Save PDF</button><button onClick={() => window.print()}><Printer size={16} />Print</button><button><Save size={16} />Save Draft</button><button onClick={() => window.location.reload()}><RotateCcw size={16} />Reset {type === 'vat' ? 'VAT' : 'Corporate Tax'} Form</button></div> : <p>Complete required fields and review step to enable export actions.</p>}</section>;

const LiveSummary = ({ activeTab, vatResult, ctResult, completion, missingRequired }) => {
  const vatView = activeTab === 'vat';
  const ctView = activeTab === 'ct';
  return <aside className="summary-rail"><section className="card"><h2>Live Summary</h2><div className="stack">{!ctView && <Kpi label="VAT Position" value={money(vatResult.netVat)} tone={vatResult.isPayable ? 'danger' : 'success'} />}{!vatView && <Kpi label="Corporate Tax Due" value={money(ctResult.taxDue)} tone="success" />}{(ctView || activeTab === 'home') && <Kpi label="Taxable Income" value={money(ctResult.taxableIncome)} />}{(vatView || activeTab === 'home') && <Kpi label="Output VAT" value={money(vatResult.outputVat)} />}<Kpi label="Overall Completion" value={`${Math.round((completion.profile + completion.vat + completion.ct) / 3)}%`} /><Kpi label="Missing Required" value={String(missingRequired)} note="Business profile fields" /></div></section></aside>;
};


const WizardProgressBar = ({ label, percent, statusText }) => <div className="wizard-progress-wrap"><div className="wizard-progress">{label} · {percent}% · {statusText}</div><div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div></div>;

const PrintMeta = ({ activeTab, profile }) => {
  if (activeTab === 'home') return null;
  const title = activeTab === 'vat' ? 'VAT Return Report' : 'Corporate Tax Report';
  const generatedAt = new Date().toLocaleString();
  return <div className="print-only print-block"><div className="print-header"><img src={FTA_LOGO} alt="FTA UAE" /><div><h1>{title}</h1><p>{profile.businessName || 'Business Name'} {profile.trn ? `· TRN: ${profile.trn}` : ''}</p><small>Generated: {generatedAt}</small></div></div><div className="print-footer"><span>Prepared with UAE Tax Suite</span><a href="https://ftapro.vercel.app">ftapro.vercel.app</a></div></div>;
};

createRoot(document.getElementById('root')).render(<App />);
