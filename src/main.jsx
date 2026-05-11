import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Building2, Calculator, FileText, RotateCcw, Printer, Landmark, BadgeCheck, WandSparkles } from 'lucide-react';
import './styles.css';
import { money } from './domain/shared/money';
import { toNumber as number } from './domain/shared/number';
import { VAT_RULES_2026 } from './domain/vat/rules';
import { calculateVat } from './domain/vat/calculator';
import { CORPORATE_TAX_RULES_2026 } from './domain/corporateTax/rules';
import { calculateCorporateTax } from './domain/corporateTax/calculator';
import { usePersistentState } from './infrastructure/storage/usePersistentState';

const FTA_LOGO = 'https://eservices.tax.gov.ae/sap/public/bc/ui2/zmcf_fmca_public/user_management/img/FTA_logo_new.png';

function Field({ label, help, children }) {
  return <label className="field"><span>{label}</span>{children}{help && <small className="field-help">{help}</small>}</label>;
}
function Kpi({ label, value, note, tone = '' }) {
  return <div className={`kpi ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardType, setWizardType] = useState(null);
  const [profile, setProfile] = usePersistentState('uaeTaxSuiteProfile', { businessName: '', trn: '', preparedBy: '', period: '' });
  const [vat, setVat] = usePersistentState('uaeTaxSuiteVat', {
    emirate: '1c', mode: VAT_RULES_2026.defaultMode, zeroRated: 0, exemptSales: 0, salesAdjustmentVat: 0, expenseAdjustmentVat: 0, notes: '',
    months: [{ month: '', sales: 0, purchases: 0, expenses: 0 }, { month: '', sales: 0, purchases: 0, expenses: 0 }, { month: '', sales: 0, purchases: 0, expenses: 0 }],
  });
  const [ct, setCt] = usePersistentState('uaeTaxSuiteCorporateTax', {
    fyStart: '2026-01-01', fyEnd: '2026-12-31', entityType: 'Mainland / Normal UAE Business', smallBusinessRelief: 'no',
    revenue: 0, cost: 0, deductible: 0, nonDeductible: 0, exemptIncome: 0, loss: 0, notes: '',
  });
  const [priorPeriod, setPriorPeriod] = usePersistentState('uaeTaxSuitePriorPeriod', { netVat: 0, taxDue: 0, taxableIncome: 0, periodLabel: 'Prior period' });
  const [meta, setMeta] = usePersistentState('uaeTaxSuiteMeta', { vatEditedAt: '', ctEditedAt: '', lastCalculationAt: '' });

  const vatResult = useMemo(() => calculateVat(vat, VAT_RULES_2026), [vat]);
  const ctResult = useMemo(() => calculateCorporateTax(ct, CORPORATE_TAX_RULES_2026), [ct]);

  const impact = useMemo(() => {
    const baselineVat = calculateVat({ ...vat, zeroRated: 0, exemptSales: 0, salesAdjustmentVat: 0, expenseAdjustmentVat: 0 }, VAT_RULES_2026);
    const baselineCt = calculateCorporateTax({ ...ct, nonDeductible: 0, exemptIncome: 0, loss: 0 }, CORPORATE_TAX_RULES_2026);
    return { vatDelta: vatResult.netVat - baselineVat.netVat, ctDelta: ctResult.taxDue - baselineCt.taxDue };
  }, [vat, ct, vatResult.netVat, ctResult.taxDue]);

  function resetAll() {
    if (!confirm('Reset all saved values in this browser?')) return;
    ['uaeTaxSuiteProfile', 'uaeTaxSuiteVat', 'uaeTaxSuiteCorporateTax', 'uaeTaxSuitePriorPeriod'].forEach(k => localStorage.removeItem(k));
    location.reload();
  }

  const wizardSteps = ['Profile', 'Inputs', 'Review', 'Submit'];

  function startWizard(type) {
    setWizardType(type);
    setWizardStep(0);
    setActiveTab('wizard');
  }
  function touch(key) {
    const now = new Date().toISOString();
    setMeta((m) => ({ ...m, [key]: now, lastCalculationAt: now }));
  }
  const setVatTracked = (next) => { setVat(next); touch('vatEditedAt'); };
  const setCtTracked = (next) => { setCt(next); touch('ctEditedAt'); };
  const setProfileTracked = (next) => setProfile(next);
  useEffect(() => { touch('lastCalculationAt'); }, [vatResult.netVat, ctResult.taxDue]);

  const completion = useMemo(() => {
    const profileDone = ['businessName', 'trn', 'preparedBy', 'period'].filter((k) => String(profile[k] || '').trim()).length;
    const vatDone = [vat.emirate, vat.mode, vat.zeroRated, vat.exemptSales].filter((v) => String(v ?? '').trim() !== '').length;
    const ctDone = [ct.fyStart, ct.fyEnd, ct.revenue, ct.cost, ct.deductible].filter((v) => String(v ?? '').trim() !== '').length;
    return {
      profile: Math.round((profileDone / 4) * 100),
      vat: Math.round((vatDone / 4) * 100),
      ct: Math.round((ctDone / 5) * 100),
    };
  }, [profile, vat, ct]);

  return <div className="app-shell">
    <aside className="sidebar no-print">
      <div className="brand"><img src={FTA_LOGO} alt="FTA UAE" /><div><strong>UAE Tax Suite</strong><span>VAT + Corporate Tax</span></div></div>
      <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}><Landmark size={18}/> Home</button>
      <button className={activeTab === 'wizard' ? 'active' : ''} onClick={() => setActiveTab('wizard')}><WandSparkles size={18}/> Tax Wizard</button>
      <button className={activeTab === 'vat' ? 'active' : ''} onClick={() => setActiveTab('vat')}><FileText size={18}/> VAT Return</button>
      <button className={activeTab === 'ct' ? 'active' : ''} onClick={() => setActiveTab('ct')}><Calculator size={18}/> Corporate Tax</button>
      <button onClick={() => window.print()}><Printer size={18}/> Print / Save PDF</button>
      <button onClick={resetAll} className="danger"><RotateCcw size={18}/> Reset</button>
    </aside>

    <main className="content">
      <header className="hero"><div><p className="eyebrow">🇦🇪 Internal UAE tax worksheet</p><h1>VAT Return & Corporate Tax Calculator</h1></div><div className="hero-card"><BadgeCheck/><span>Auto saved locally</span><strong>{money(Math.max(0, vatResult.netVat))}</strong><small>{vatResult.isPayable ? 'Estimated VAT payable' : 'Estimated VAT refund / credit'}</small></div></header>
      <ProfileCard profile={profile} setProfile={setProfileTracked} />
      <div className="content-grid">
        <div>
          {activeTab === 'home' && <HomeSelector onSelect={startWizard} completion={completion} wizardType={wizardType} meta={meta} vatResult={vatResult} ctResult={ctResult} setVat={setVatTracked} setCt={setCtTracked} />}
          {activeTab === 'wizard' && <WizardFlow wizardType={wizardType} wizardStep={wizardStep} setWizardStep={setWizardStep} steps={wizardSteps} profile={profile} setProfile={setProfileTracked} vat={vat} setVat={setVatTracked} ct={ct} setCt={setCtTracked} vatResult={vatResult} ctResult={ctResult} impact={impact} completion={completion} />}
          {activeTab === 'vat' && <VatModule vat={vat} setVat={setVatTracked} result={vatResult} profile={profile} />}
          {activeTab === 'ct' && <CorporateTaxModule ct={ct} setCt={setCtTracked} result={ctResult} />}
        </div>
        <SummaryRail vatResult={vatResult} ctResult={ctResult} ct={ct} completion={completion} meta={meta} />
      </div>
    </main>
  </div>;
}

function HomeSelector({ onSelect, completion, wizardType, meta, vatResult, ctResult, setVat, setCt }) {
  const status = (pct) => (pct === 0 ? 'Not started' : pct < 100 ? 'In progress' : 'Ready to print');
  const upcoming = [{ name: 'VAT Return', due: '2026-05-28' }, { name: 'Corporate Tax', due: '2026-12-31' }];
  return <section className="card">
    <div className="card-title"><h2>Task-first Dashboard</h2><span className="badge">Saved progress available</span></div>
    <section className="grid-section">
      <Kpi label="Profile Completion" value={`${completion.profile}%`} />
      <Kpi label="VAT Draft" value={`${completion.vat}%`} note="Input completion" />
      <Kpi label="CT Draft" value={`${completion.ct}%`} note="Input completion" />
      <Kpi label="Last Wizard" value={wizardType ? wizardType.toUpperCase() : 'N/A'} />
    </section>
    <div className="dashboard-list">
      <p><strong>Continue last draft:</strong> {wizardType ? wizardType.toUpperCase() : 'VAT'} · Last edited {meta.vatEditedAt || meta.ctEditedAt ? new Date(meta.vatEditedAt || meta.ctEditedAt).toLocaleString() : 'Not available'}</p>
      <p><strong>VAT Status:</strong> {status(completion.vat)} | <strong>CT Status:</strong> {status(completion.ct)}</p>
      <p><strong>Upcoming deadlines:</strong> {upcoming.map((u) => `${u.name} (${u.due})`).join(' · ')}</p>
    </div>
    <div className="selector-grid">
      <button className="selector-card primary" onClick={() => onSelect('vat')}>
        <FileText size={24} />
        <strong>VAT Return</strong>
        <span>Start guided VAT return setup</span>
      </button>
      <button className="selector-card" onClick={() => onSelect('ct')}>
        <Calculator size={24} />
        <strong>Corporate Tax Calculator</strong>
        <span>Start guided corporate tax setup</span>
      </button>
      <button className="selector-card secondary" onClick={() => { setVat({ emirate: '1c', mode: VAT_RULES_2026.defaultMode, zeroRated: 0, exemptSales: 0, salesAdjustmentVat: 0, expenseAdjustmentVat: 0, notes: '', months: [{ month: '', sales: 0, purchases: 0, expenses: 0 }, { month: '', sales: 0, purchases: 0, expenses: 0 }, { month: '', sales: 0, purchases: 0, expenses: 0 }] }); setCt({ ...{ fyStart: '2026-01-01', fyEnd: '2026-12-31', entityType: 'Mainland / Normal UAE Business', smallBusinessRelief: 'no', revenue: 0, cost: 0, deductible: 0, nonDeductible: 0, exemptIncome: 0, loss: 0, notes: '' } }); onSelect('vat'); }}>
        <RotateCcw size={24} />
        <strong>New period</strong>
        <span>Reset VAT/CT inputs and start fresh</span>
      </button>
    </div>
  </section>;
}

const ProfileCard = ({ profile, setProfile, requiredErrors = [] }) => <section className="card no-print"><div className="card-title"><h2><Building2 size={20}/> Shared Business Profile</h2><span className="badge">Data is local-only</span></div><div className="form-grid four">{['businessName','trn','preparedBy','period'].map(k => <Field key={k} label={k} help={requiredErrors.includes(k) ? 'This field is required to continue.' : ''}><input className={requiredErrors.includes(k) ? 'invalid' : ''} value={profile[k]} onChange={e => setProfile({ ...profile, [k]: e.target.value })} /></Field>)}</div></section>;

function Dashboard({ vatResult, ctResult, ct, priorPeriod, setPriorPeriod }) {
  return <section className="stack"><section className="grid-section">
    <Kpi label="VAT Payable / Credit" value={money(Math.abs(vatResult.netVat))} tone={vatResult.isPayable ? 'danger' : 'success'} />
    <Kpi label="Corporate Tax" value={money(ctResult.taxDue)} tone="success" />
    <Kpi label="Annual Revenue" value={money(ct.revenue)} />
    <Kpi label="Taxable Income" value={money(ctResult.taxableIncome)} />
  </section>
  <section className="card"><div className="card-title"><h2>Side-by-side prior period comparison</h2></div>
    <div className="form-grid four">
      <Field label="Prior Period Label"><input value={priorPeriod.periodLabel} onChange={e => setPriorPeriod({ ...priorPeriod, periodLabel: e.target.value })} /></Field>
      <Field label="Prior Net VAT"><input type="number" value={priorPeriod.netVat} onChange={e => setPriorPeriod({ ...priorPeriod, netVat: e.target.value })} /></Field>
      <Field label="Prior CT Due"><input type="number" value={priorPeriod.taxDue} onChange={e => setPriorPeriod({ ...priorPeriod, taxDue: e.target.value })} /></Field>
      <Field label="Prior Taxable Income"><input type="number" value={priorPeriod.taxableIncome} onChange={e => setPriorPeriod({ ...priorPeriod, taxableIncome: e.target.value })} /></Field>
    </div>
    <table><thead><tr><th>Metric</th><th>{priorPeriod.periodLabel}</th><th>Current</th><th>Δ Change</th></tr></thead><tbody>
      <tr><td>Net VAT</td><td>{money(priorPeriod.netVat)}</td><td>{money(vatResult.netVat)}</td><td>{money(vatResult.netVat - number(priorPeriod.netVat))}</td></tr>
      <tr><td>Corporate Tax</td><td>{money(priorPeriod.taxDue)}</td><td>{money(ctResult.taxDue)}</td><td>{money(ctResult.taxDue - number(priorPeriod.taxDue))}</td></tr>
      <tr><td>Taxable Income</td><td>{money(priorPeriod.taxableIncome)}</td><td>{money(ctResult.taxableIncome)}</td><td>{money(ctResult.taxableIncome - number(priorPeriod.taxableIncome))}</td></tr>
    </tbody></table>
  </section></section>;
}

function WizardFlow(props) { const { wizardType, wizardStep, setWizardStep, steps, profile, setProfile, vat, setVat, ct, setCt, vatResult, ctResult, impact } = props;
  const { completion } = props;
  if (!wizardType) return <section className="card"><p>Please go to Home and choose VAT Return or Corporate Tax Calculator first.</p></section>;
  const canContinue = wizardStep !== 0 || ['businessName', 'trn', 'preparedBy', 'period'].every((k) => String(profile[k] || '').trim());
  const progress = Math.round(((wizardStep + 1) / steps.length) * 100);
  return <section className="card"><div className="wizard-steps">{steps.map((s,i)=><button key={s} className={i===wizardStep?'active':''} onClick={()=>setWizardStep(i)}>{i+1}. {s}</button>)}</div>
  <div className="wizard-progress"><strong>Progress:</strong> {progress}% complete · Profile {completion.profile}% · {wizardType.toUpperCase()} {wizardType === 'vat' ? completion.vat : completion.ct}%</div>
  {wizardStep===0 && <ProfileCard profile={profile} setProfile={setProfile} requiredErrors={!canContinue ? ['businessName', 'trn', 'preparedBy', 'period'].filter((k) => !String(profile[k] || '').trim()) : []} />}
  {wizardStep===1 && <div className="stack">{wizardType === 'vat' ? <VatModule vat={vat} setVat={setVat} result={vatResult} profile={profile} compact /> : <CorporateTaxModule ct={ct} setCt={setCt} result={ctResult} compact />}</div>}
  {wizardStep===2 && <section className="grid-section four">{wizardType === 'vat'
    ? <><Kpi label="VAT Change Impact" value={money(impact.vatDelta)} note="vs baseline assumptions" tone={impact.vatDelta > 0 ? 'danger' : 'success'} /><Kpi label="Final Net VAT" value={money(vatResult.netVat)} /><Kpi label="Payable / Credit" value={money(Math.abs(vatResult.netVat))} tone={vatResult.isPayable ? 'danger' : 'success'} /><Kpi label="Type" value={vatResult.isPayable ? 'Payable' : 'Refund/Credit'} /></>
    : <><Kpi label="CT Change Impact" value={money(impact.ctDelta)} note="vs baseline assumptions" tone={impact.ctDelta > 0 ? 'danger' : 'success'} /><Kpi label="Taxable Income" value={money(ctResult.taxableIncome)} /><Kpi label="Final CT" value={money(ctResult.taxDue)} /><Kpi label="Rate Applied" value={`${CORPORATE_TAX_RULES_2026.mainRate * 100}%`} /></>}</section>}
  {wizardStep===3 && <section><p>Information submitted successfully. Choose one option below.</p><div className="wizard-export"><button onClick={() => window.print()}><Printer size={18}/> Print</button><button onClick={() => window.print()}><FileText size={18}/> Download PDF</button></div><PrintHeader profile={profile} title={wizardType === 'vat' ? 'UAE VAT Wizard Summary' : 'UAE Corporate Tax Wizard Summary'} /></section>}
  {wizardStep === 0 && !canContinue && <p className="notice">Please complete all shared profile fields before moving to Inputs.</p>}
  <div className="wizard-nav"><button disabled={wizardStep===0} onClick={()=>setWizardStep(wizardStep-1)}>Back</button><button disabled={wizardStep===steps.length-1 || !canContinue} onClick={()=>setWizardStep(wizardStep+1)}>Next</button></div>
  </section>;
}

function SummaryRail({ vatResult, ctResult, ct, completion, meta }) {
  const warnings = [];
  if (ct.fyEnd < ct.fyStart) warnings.push('Financial year end date is earlier than start date.');
  if (Number(ct.revenue) < Number(ct.cost)) warnings.push('Revenue is lower than cost of sales. Verify data.');
  return <aside className="summary-rail no-print">
    <section className="card">
      <h2>Live Summary</h2>
      <div className="stack">
        <Kpi label="VAT Position" value={money(vatResult.netVat)} tone={vatResult.isPayable ? 'danger' : 'success'} />
        <Kpi label="Corporate Tax Due" value={money(ctResult.taxDue)} tone="success" />
        <Kpi label="Taxable Income" value={money(ctResult.taxableIncome)} />
        <Kpi label="Overall Completion" value={`${Math.round((completion.profile + completion.vat + completion.ct) / 3)}%`} />
      </div>
      {warnings.length > 0 && <div className="notice">{warnings.map((w) => <div key={w}>• {w}</div>)}</div>}
      <small className="field-help">Last calculation: {meta.lastCalculationAt ? new Date(meta.lastCalculationAt).toLocaleString() : 'Not yet calculated'}</small>
    </section>
  </aside>;
}

function VatModule({ vat, setVat, result, profile }) {
  const update = (key, value) => setVat({ ...vat, [key]: value });
  const updateMonth = (index, key, value) => { const months = [...vat.months]; months[index] = { ...months[index], [key]: value }; setVat({ ...vat, months }); };
  const rows = [{ box: '14', label: result.isPayable ? 'Payable tax for period' : 'Refundable tax for period', amount: 0, vat: result.netVat, adjustment: 0 }];
  const autoFillMonths = () => setVat({ ...vat, months: vat.months.map((m, i) => ({ ...m, month: m.month || `Month ${i + 1}` })) });
  return <section className="stack"><section className="card"><div className="card-title"><h2>VAT Return Inputs <span className="badge">VAT Rules 2026</span></h2><button className="ghost" onClick={autoFillMonths}>Auto-fill month labels</button></div><div className="form-grid three">
    <Field label="Main Emirate" help="Select where the standard-rated supplies are primarily reported."><select value={vat.emirate} onChange={e => update('emirate', e.target.value)}>{Object.entries(VAT_RULES_2026.emirates).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
    <Field label="Amount Type" help="Inclusive means inputs include VAT; exclusive means VAT is added on top."><select value={vat.mode} onChange={e => update('mode', e.target.value)}><option value="inclusive">VAT Inclusive</option><option value="exclusive">VAT Exclusive</option></select></Field>
    <Field label="Sales Adjustment VAT" help="Manual output VAT corrections for debit/credit note adjustments."><input type="number" value={vat.salesAdjustmentVat} onChange={e => update('salesAdjustmentVat', e.target.value)} /></Field>
    <Field label="Zero Rated Sales" help="Supplies taxed at 0% (e.g., qualifying exports)."><input type="number" value={vat.zeroRated} onChange={e => update('zeroRated', e.target.value)} /></Field>
    <Field label="Exempt Sales" help="Supplies exempt from VAT and excluded from output VAT."><input type="number" value={vat.exemptSales} onChange={e => update('exemptSales', e.target.value)} /></Field>
    <Field label="Expense Adjustment VAT" help="Manual input VAT corrections for blocked or corrected claims."><input type="number" value={vat.expenseAdjustmentVat} onChange={e => update('expenseAdjustmentVat', e.target.value)} /></Field>
  </div><div className="month-grid">{vat.months.map((row, i) => <div className="month-card" key={i}><Field label={`Month ${i + 1}`}><input value={row.month} onChange={e => updateMonth(i, 'month', e.target.value)} /></Field><Field label="Sales"><input type="number" value={row.sales} onChange={e => updateMonth(i, 'sales', e.target.value)} /></Field><Field label="Purchases"><input type="number" value={row.purchases} onChange={e => updateMonth(i, 'purchases', e.target.value)} /></Field><Field label="Expenses"><input type="number" value={row.expenses} onChange={e => updateMonth(i, 'expenses', e.target.value)} /></Field></div>)}</div>
  <Field label="Notes"><textarea value={vat.notes} onChange={e => update('notes', e.target.value)} /></Field>
  <details className="assumption"><summary>Calculation assumptions</summary><p>Standard VAT = 5%, zero-rated and exempt supplies are handled separately, and manual adjustments are applied directly.</p></details>
  </section><ReportTable title="VAT Summary" rows={rows} /><PrintHeader profile={profile} title="UAE VAT Return Summary" /></section>;
}

function CorporateTaxModule({ ct, setCt, result }) {
  const update = (key, value) => setCt({ ...ct, [key]: value });
  return <section className="stack"><section className="card"><div className="card-title"><h2>Corporate Tax Inputs <span className="badge">CT Rules 2026</span></h2></div><div className="form-grid three">
    <Field label="Financial Year Start"><input type="date" value={ct.fyStart} onChange={e => update('fyStart', e.target.value)} /></Field>
    <Field label="Financial Year End"><input type="date" value={ct.fyEnd} onChange={e => update('fyEnd', e.target.value)} /></Field>
    <Field label="Small Business Relief" help="If validly elected and eligible, estimated CT becomes AED 0."><select value={ct.smallBusinessRelief} onChange={e => update('smallBusinessRelief', e.target.value)}><option value="no">No / Not selected</option><option value="yes">Yes, eligible and selected</option></select></Field>
    <Field label="Entity Type"><input value={ct.entityType} onChange={e => update('entityType', e.target.value)} /></Field>
    <Field label="Total Revenue / Sales" help="Top-line accounting revenue for the tax period."><input type="number" value={ct.revenue} onChange={e => update('revenue', e.target.value)} /></Field>
    <Field label="Cost of Sales / Direct Costs"><input type="number" value={ct.cost} onChange={e => update('cost', e.target.value)} /></Field>
    <Field label="Deductible Expenses" help="Allowable expenses that reduce taxable income."><input type="number" value={ct.deductible} onChange={e => update('deductible', e.target.value)} /></Field>
    <Field label="Non-Deductible Expenses" help="Add-back expenses not allowed for tax deduction."><input type="number" value={ct.nonDeductible} onChange={e => update('nonDeductible', e.target.value)} /></Field>
    <Field label="Exempt / Non-Taxable Income"><input type="number" value={ct.exemptIncome} onChange={e => update('exemptIncome', e.target.value)} /></Field>
    <Field label="Tax Loss Carried Forward"><input type="number" value={ct.loss} onChange={e => update('loss', e.target.value)} /></Field>
  </div><details className="assumption"><summary>Calculation assumptions</summary><p>Tax is estimated using AED 375,000 threshold and configured rate with SBR toggle applied when selected.</p></details></section>
  <section className="card"><h2>Corporate Tax Calculation Summary</h2><table><tbody><tr><th>Item</th><th>Amount</th></tr><tr><td>Taxable Income</td><td>{money(result.taxableIncome)}</td></tr><tr><td>Estimated Corporate Tax</td><td>{money(result.taxDue)}</td></tr></tbody></table></section></section>;
}

function ReportTable({ title, rows }) { return <section className="card"><h2>{title}</h2><table><thead><tr><th>Box</th><th>Description</th><th>Amount</th><th>VAT</th><th>Adjustment</th></tr></thead><tbody>{rows.map(row => <tr key={`${row.box}-${row.label}`}><td><strong>{row.box}</strong></td><td>{row.label}</td><td>{money(row.amount)}</td><td>{money(row.vat)}</td><td>{money(row.adjustment)}</td></tr>)}</tbody></table></section>; }
function PrintHeader({ profile, title }) { return <section className="print-only print-header"><img src={FTA_LOGO} alt="FTA"/><div><h1>{title}</h1><p>{profile.businessName || 'Company Name'} · {profile.trn || 'TRN / CT No.'} · {profile.period || 'Period'}</p><p>Prepared by: {profile.preparedBy || 'N/A'} · Generated: {new Date().toLocaleDateString()}</p><p>Signature: __________________</p></div></section>; }

createRoot(document.getElementById('root')).render(<App />);
