import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Building2, Calculator, FileText, RotateCcw, Printer, Landmark, BadgeCheck, Save } from 'lucide-react';
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

const reqProfile = ['businessName', 'trn', 'preparedBy', 'period'];
const reqVatStep1 = ['emirate', 'mode'];
const reqCtStep2 = ['revenue', 'cost', 'deductible'];

function Field({ label, required, help, error, children }) {
  return <label className="field"><span>{label}{required && <em>*</em>}</span>{children}{(error || help) && <small className="field-help">{error || help}</small>}</label>;
}
const Kpi = ({ label, value, tone = '', note }) => <div className={`kpi ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [wizardType, setWizardType] = useState('vat');
  const [wizardStep, setWizardStep] = useState(0);
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
    const p = reqProfile.filter((k) => String(profile[k] || '').trim()).length;
    const vatInputs = [vat.zeroRated, vat.exemptSales, vat.salesAdjustmentVat, vat.expenseAdjustmentVat, ...vat.months.flatMap((m) => [m.sales, m.purchases, m.expenses])].filter((v) => String(v ?? '').trim() !== '').length;
    const ctInputs = [ct.revenue, ct.cost, ct.deductible, ct.nonDeductible, ct.exemptIncome, ct.loss].filter((v) => String(v ?? '').trim() !== '').length;
    return { profile: Math.round((p / 4) * 100), vat: Math.round((vatInputs / 13) * 100), ct: Math.round((ctInputs / 6) * 100) };
  }, [profile, vat, ct]);

  const missingRequired = reqProfile.filter((k) => !String(profile[k] || '').trim()).length;
  const openWizard = (type) => { setWizardType(type); setActiveTab('home'); setWizardStep(0); };
  const resetAll = () => { if (!confirm('Reset all saved values in this browser?')) return; ['uaeTaxSuiteProfile','uaeTaxSuiteVat','uaeTaxSuiteCorporateTax','uaeTaxSuitePriorPeriod'].forEach((k)=>localStorage.removeItem(k)); location.reload(); };

  return <LayoutShell sidebar={<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} resetAll={resetAll} />}>
    <HeroHeader vatResult={vatResult} />
    <div className="content-grid">
      <div>
        <HomeDashboard profile={profile} setProfile={setProfile} completion={completion} meta={meta} vatResult={vatResult} ctResult={ctResult} onSelect={openWizard} wizardType={wizardType} wizardStep={wizardStep} setWizardStep={setWizardStep} vat={vat} setVat={setVatTracked} ct={ct} setCt={setCtTracked} activeTab={activeTab} />
      </div>
      <LiveSummary vatResult={vatResult} ctResult={ctResult} completion={completion} missingRequired={missingRequired} />
    </div>
  </LayoutShell>;
}

const LayoutShell = ({ sidebar, children }) => <div className="app-shell">{sidebar}<main className="content">{children}</main></div>;
const Sidebar = ({ activeTab, setActiveTab, resetAll }) => <aside className="sidebar no-print"><div className="brand"><img src={FTA_LOGO} alt="FTA UAE"/><div><strong>UAE Tax Suite</strong><span>VAT + Corporate Tax</span></div></div><button className={activeTab==='home'?'active':''} onClick={()=>setActiveTab('home')}><Landmark size={18}/>Home</button><button className={activeTab==='vat'?'active':''} onClick={()=>setActiveTab('vat')}><FileText size={18}/>VAT Return</button><button className={activeTab==='ct'?'active':''} onClick={()=>setActiveTab('ct')}><Calculator size={18}/>Corporate Tax</button><button className="danger" onClick={resetAll}><RotateCcw size={18}/>Reset</button></aside>;
const HeroHeader = ({ vatResult }) => <header className="hero"><div><p className="eyebrow">🇦🇪 Internal UAE tax worksheet</p><h1>UAE Tax Suite Wizard</h1></div><div className="hero-card"><BadgeCheck/><span>Auto saved locally</span><strong>{money(Math.abs(vatResult.netVat))}</strong><small>{vatResult.isPayable ? 'Estimated VAT payable' : 'Estimated VAT refund / credit'}</small></div></header>;

function HomeDashboard(props){
  const { profile, setProfile, completion, meta, vatResult, ctResult, onSelect, wizardType, wizardStep, setWizardStep, activeTab } = props;
  return <>
    <SharedBusinessProfile profile={profile} setProfile={setProfile} errors={reqProfile.filter((k)=>!String(profile[k]||'').trim())} />
    <section className="card">
      <div className="card-title"><h2>Dashboard</h2></div>
      <TaxSelectionCards completion={completion} meta={meta} vatResult={vatResult} ctResult={ctResult} onSelect={onSelect} />
      {(activeTab==='home' || activeTab===wizardType) && <WizardShell {...props} wizardType={wizardType} wizardStep={wizardStep} setWizardStep={setWizardStep} />}
    </section>
  </>;
}

const SharedBusinessProfile = ({ profile, setProfile, errors=[] }) => <section className="card"><div className="card-title"><h2><Building2 size={20}/>Shared Business Profile</h2></div><div className="form-grid four">{reqProfile.map((k)=><Field key={k} label={k} required error={errors.includes(k)?'Required field.':''}><input className={errors.includes(k)?'invalid':''} value={profile[k]} onChange={(e)=>setProfile({...profile,[k]:e.target.value})}/></Field>)}</div></section>;

const TaxSelectionCards = ({ completion, meta, vatResult, ctResult, onSelect }) => <div className="selector-grid">{[
  {key:'vat',title:'VAT Return',pct:completion.vat,edited:meta.vatEditedAt,amount:money(vatResult.netVat),cta:'Start / Continue VAT'},
  {key:'ct',title:'Corporate Tax Calculator',pct:completion.ct,edited:meta.ctEditedAt,amount:money(ctResult.taxDue),cta:'Start / Continue CT'},
].map((c)=><div key={c.key} className="selector-card"><strong>{c.title}</strong><span>Completion: {c.pct}%</span><span>Status: {c.pct===100?'Ready':'Draft'}</span><span>Last edited: {c.edited?new Date(c.edited).toLocaleString():'Never'}</span><span>Key amount: {c.amount}</span><button onClick={()=>onSelect(c.key)}>{c.cta}</button></div>)}</div>;

function WizardShell({ wizardType, wizardStep, setWizardStep, profile, vat, setVat, ct, setCt, vatResult, ctResult }){
  const steps = wizardType==='vat' ? ['Profile','Inputs','Review','Export'] : ['Profile','Revenue & Expenses','Adjustments / Relief','Review & Export'];
  const requiredNow = wizardStep===0 ? reqProfile.filter((k)=>!String(profile[k]||'').trim()) : wizardType==='vat' && wizardStep===1 ? reqVatStep1.filter((k)=>!String(vat[k]||'').trim()) : wizardType==='ct' && wizardStep===1 ? reqCtStep2.filter((k)=>String(ct[k]??'').trim()==='') : [];
  const canNext = requiredNow.length===0;
  return <section className="wizard-wrap">
    <WizardStepTabs steps={steps} wizardStep={wizardStep} setWizardStep={setWizardStep} />
    <div className="wizard-progress">{steps[wizardStep]} · {Math.round(((wizardStep+1)/steps.length)*100)}% · {requiredNow.length?`${requiredNow.length} required missing`:'Ready to continue'}</div>
    {wizardType==='vat' ? <VatWizard wizardStep={wizardStep} profile={profile} vat={vat} setVat={setVat} result={vatResult}/> : <CorporateTaxWizard wizardStep={wizardStep} ct={ct} setCt={setCt} result={ctResult} profile={profile} />}
    <div className="wizard-nav"><button disabled={wizardStep===0} onClick={()=>setWizardStep(wizardStep-1)}>Back</button><button disabled={wizardStep===steps.length-1 || !canNext} onClick={()=>setWizardStep(wizardStep+1)}>Next</button></div>
  </section>;
}
const WizardStepTabs = ({ steps, wizardStep, setWizardStep }) => <div className="wizard-steps">{steps.map((s,i)=><button key={s} className={i===wizardStep?'active':''} onClick={()=>setWizardStep(i)}>{i+1}. {s}</button>)}</div>;

function VatWizard({ wizardStep, profile, vat, setVat, result }) {
  const update = (key, value) => setVat({ ...vat, [key]: value });
  const updateMonth = (i, key, value) => { const months = [...vat.months]; months[i] = { ...months[i], [key]: value }; setVat({ ...vat, months }); };
  if (wizardStep===0) return <SharedBusinessProfile profile={profile} setProfile={()=>{}} />;
  if (wizardStep===1) return <section className="card"><div className="form-grid three"><Field label="Main Emirate" required><select value={vat.emirate} onChange={e=>update('emirate',e.target.value)}>{Object.entries(VAT_RULES_2026.emirates).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></Field><Field label="Amount Type" required><select value={vat.mode} onChange={e=>update('mode',e.target.value)}><option value="inclusive">VAT Inclusive</option><option value="exclusive">VAT Exclusive</option></select></Field><Field label="Sales Adjustment VAT"><input type="number" value={vat.salesAdjustmentVat} onChange={e=>update('salesAdjustmentVat',e.target.value)} /></Field><Field label="Expense Adjustment VAT"><input type="number" value={vat.expenseAdjustmentVat} onChange={e=>update('expenseAdjustmentVat',e.target.value)} /></Field><Field label="Zero Rated Sales"><input type="number" value={vat.zeroRated} onChange={e=>update('zeroRated',e.target.value)} /></Field><Field label="Exempt Sales"><input type="number" value={vat.exemptSales} onChange={e=>update('exemptSales',e.target.value)} /></Field></div><div className="month-grid">{vat.months.map((m,i)=><div className="month-card" key={i}><Field label={`Month ${i+1}`}><input value={m.month} onChange={e=>updateMonth(i,'month',e.target.value)} /></Field><Field label="Sales"><input type="number" value={m.sales} onChange={e=>updateMonth(i,'sales',e.target.value)} /></Field><Field label="Purchases"><input type="number" value={m.purchases} onChange={e=>updateMonth(i,'purchases',e.target.value)} /></Field><Field label="Expenses"><input type="number" value={m.expenses} onChange={e=>updateMonth(i,'expenses',e.target.value)} /></Field></div>)}</div></section>;
  if (wizardStep===2) return <ReviewSummary type="vat" result={result} />;
  return <ExportActions type="vat" canExport />;
}
function CorporateTaxWizard({ wizardStep, ct, setCt, result, profile }) {
  const update=(k,v)=>setCt({...ct,[k]:v});
  if (wizardStep===0) return <SharedBusinessProfile profile={profile} setProfile={()=>{}} />;
  if (wizardStep===1) return <section className="card"><div className="form-grid three"><Field label="Financial Year Start"><input type="date" value={ct.fyStart} onChange={e=>update('fyStart',e.target.value)} /></Field><Field label="Financial Year End"><input type="date" value={ct.fyEnd} onChange={e=>update('fyEnd',e.target.value)} /></Field><Field label="Entity Type"><input value={ct.entityType} onChange={e=>update('entityType',e.target.value)} /></Field><Field label="Total Revenue / Sales" required><input type="number" value={ct.revenue} onChange={e=>update('revenue',e.target.value)} /></Field><Field label="Cost of Sales / Direct Costs" required><input type="number" value={ct.cost} onChange={e=>update('cost',e.target.value)} /></Field><Field label="Deductible Expenses" required><input type="number" value={ct.deductible} onChange={e=>update('deductible',e.target.value)} /></Field></div></section>;
  if (wizardStep===2) return <section className="card"><div className="form-grid three"><Field label="Small Business Relief"><select value={ct.smallBusinessRelief} onChange={e=>update('smallBusinessRelief',e.target.value)}><option value="no">No</option><option value="yes">Yes</option></select></Field><Field label="Non-Deductible Expenses"><input type="number" value={ct.nonDeductible} onChange={e=>update('nonDeductible',e.target.value)} /></Field><Field label="Exempt / Non-Taxable Income"><input type="number" value={ct.exemptIncome} onChange={e=>update('exemptIncome',e.target.value)} /></Field><Field label="Tax Loss Carried Forward"><input type="number" value={ct.loss} onChange={e=>update('loss',e.target.value)} /></Field></div></section>;
  return <><ReviewSummary type="ct" result={result} /><ExportActions type="ct" canExport /></>;
}

const ReviewSummary = ({ type, result }) => <section className="card"><h2>{type==='vat'?'VAT Summary':'Corporate Tax Summary'}</h2><div className="grid-section">{type==='vat'?<><Kpi label="Output VAT" value={money(result.outputVat)} /><Kpi label="Input VAT" value={money(result.inputVat)} /><Kpi label="Adjustments" value={money(number(result.salesAdjustmentVat)+number(result.expenseAdjustmentVat))}/><Kpi label="VAT payable/refundable" value={money(result.netVat)} tone={result.isPayable?'danger':'success'} /></>:<><Kpi label="Taxable Income" value={money(result.taxableIncome)} /><Kpi label="Corporate Tax Due" value={money(result.taxDue)} tone="success" /></>}</div></section>;
const ExportActions = ({ type, canExport }) => <section className="card no-print"><h2>Export</h2>{canExport?<div className="wizard-export"><button onClick={()=>window.print()}><FileText size={16}/>Save PDF</button><button onClick={()=>window.print()}><Printer size={16}/>Print</button><button><Save size={16}/>Save Draft</button><button onClick={()=>window.location.reload()}><RotateCcw size={16}/>Reset {type==='vat'?'VAT':'Corporate Tax'} Form</button></div>:<p>Complete required fields and review step to enable export actions.</p>}</section>;

const LiveSummary = ({ vatResult, ctResult, completion, missingRequired }) => <aside className="summary-rail"><section className="card"><h2>Live Summary</h2><div className="stack"><Kpi label="VAT Position" value={money(vatResult.netVat)} tone={vatResult.isPayable?'danger':'success'} /><Kpi label="Corporate Tax Due" value={money(ctResult.taxDue)} tone="success" /><Kpi label="Taxable Income" value={money(ctResult.taxableIncome)} /><Kpi label="Overall Completion" value={`${Math.round((completion.profile+completion.vat+completion.ct)/3)}%`} /><Kpi label="Missing Required" value={String(missingRequired)} note="Shared profile fields" /></div></section></aside>;

createRoot(document.getElementById('root')).render(<App />);
