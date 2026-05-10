import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Building2, Calculator, FileText, RotateCcw, Save, Printer, Landmark, BadgeCheck } from 'lucide-react';
import './styles.css';

const FTA_LOGO = 'https://eservices.tax.gov.ae/sap/public/bc/ui2/zmcf_fmca_public/user_management/img/FTA_logo_new.png';
const VAT_RATE = 0.05;
const CT_THRESHOLD = 375000;
const CT_RATE = 0.09;
const SBR_REVENUE_LIMIT = 3000000;

const emirates = {
  '1a': 'Abu Dhabi - Box 1a',
  '1b': 'Dubai - Box 1b',
  '1c': 'Sharjah - Box 1c',
  '1d': 'Ajman - Box 1d',
  '1e': 'Umm Al Quwain - Box 1e',
  '1f': 'Ras Al Khaimah - Box 1f',
  '1g': 'Fujairah - Box 1g',
};

function money(value) {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(Number(value || 0));
}

function number(value) {
  return Number.parseFloat(value || 0) || 0;
}

function splitVat(total, mode) {
  const amount = number(total);
  if (mode === 'inclusive') {
    const vat = amount * 5 / 105;
    return { taxable: amount - vat, vat };
  }
  return { taxable: amount, vat: amount * VAT_RATE };
}

function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? { ...initialValue, ...JSON.parse(saved) } : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Kpi({ label, value, note, tone = '' }) {
  return <div className={`kpi ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = usePersistentState('uaeTaxSuiteProfile', {
    businessName: '',
    trn: '',
    preparedBy: '',
    period: '',
  });

  const [vat, setVat] = usePersistentState('uaeTaxSuiteVat', {
    emirate: '1c',
    mode: 'inclusive',
    zeroRated: 0,
    exemptSales: 0,
    salesAdjustmentVat: 0,
    expenseAdjustmentVat: 0,
    notes: '',
    months: [
      { month: '', sales: 0, purchases: 0, expenses: 0 },
      { month: '', sales: 0, purchases: 0, expenses: 0 },
      { month: '', sales: 0, purchases: 0, expenses: 0 },
    ],
  });

  const [ct, setCt] = usePersistentState('uaeTaxSuiteCorporateTax', {
    fyStart: '2026-01-01',
    fyEnd: '2026-12-31',
    entityType: 'Mainland / Normal UAE Business',
    smallBusinessRelief: 'no',
    revenue: 0,
    cost: 0,
    deductible: 0,
    nonDeductible: 0,
    exemptIncome: 0,
    loss: 0,
    notes: '',
  });

  const vatResult = useMemo(() => {
    const totals = vat.months.reduce((acc, row) => ({
      sales: acc.sales + number(row.sales),
      purchases: acc.purchases + number(row.purchases),
      expenses: acc.expenses + number(row.expenses),
    }), { sales: 0, purchases: 0, expenses: 0 });

    const salesSplit = splitVat(totals.sales, vat.mode);
    const inputSplit = splitVat(totals.purchases + totals.expenses, vat.mode);
    const outputVat = salesSplit.vat + number(vat.salesAdjustmentVat);
    const inputVat = inputSplit.vat + number(vat.expenseAdjustmentVat);
    const netVat = outputVat - inputVat;

    return {
      ...totals,
      taxableSales: salesSplit.taxable,
      taxableInputs: inputSplit.taxable,
      outputVat,
      inputVat,
      netVat,
      isPayable: netVat >= 0,
    };
  }, [vat]);

  const ctResult = useMemo(() => {
    const revenue = number(ct.revenue);
    const accountingProfit = revenue - number(ct.cost) - number(ct.deductible) - number(ct.nonDeductible);
    const adjustments = number(ct.nonDeductible) - number(ct.exemptIncome) - number(ct.loss);
    let taxableIncome = Math.max(0, accountingProfit + adjustments);
    let aboveThreshold = Math.max(0, taxableIncome - CT_THRESHOLD);
    let taxDue = aboveThreshold * CT_RATE;
    const sbrApplied = ct.smallBusinessRelief === 'yes' && revenue <= SBR_REVENUE_LIMIT;
    if (sbrApplied) {
      taxableIncome = 0;
      aboveThreshold = 0;
      taxDue = 0;
    }
    return {
      accountingProfit,
      adjustments,
      taxableIncome,
      aboveThreshold,
      taxDue,
      effectiveRate: taxableIncome > 0 ? (taxDue / taxableIncome) * 100 : 0,
      sbrApplied,
    };
  }, [ct]);

  function resetAll() {
    if (!confirm('Reset all saved values in this browser?')) return;
    localStorage.removeItem('uaeTaxSuiteProfile');
    localStorage.removeItem('uaeTaxSuiteVat');
    localStorage.removeItem('uaeTaxSuiteCorporateTax');
    location.reload();
  }

  return <div className="app-shell">
    <aside className="sidebar no-print">
      <div className="brand"><img src={FTA_LOGO} alt="FTA UAE" /><div><strong>UAE Tax Suite</strong><span>VAT + Corporate Tax</span></div></div>
      <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}><Landmark size={18}/> Dashboard</button>
      <button className={activeTab === 'vat' ? 'active' : ''} onClick={() => setActiveTab('vat')}><FileText size={18}/> VAT Return</button>
      <button className={activeTab === 'ct' ? 'active' : ''} onClick={() => setActiveTab('ct')}><Calculator size={18}/> Corporate Tax</button>
      <button onClick={() => window.print()}><Printer size={18}/> Print / Save PDF</button>
      <button onClick={resetAll} className="danger"><RotateCcw size={18}/> Reset</button>
    </aside>

    <main className="content">
      <header className="hero">
        <div>
          <p className="eyebrow">🇦🇪 Internal UAE tax worksheet</p>
          <h1>VAT Return & Corporate Tax Calculator</h1>
          <p>One deploy-ready app for UAE VAT period calculations and annual Corporate Tax estimation.</p>
        </div>
        <div className="hero-card"><BadgeCheck/><span>Auto saved locally</span><strong>{money(Math.max(0, vatResult.netVat))}</strong><small>{vatResult.isPayable ? 'Estimated VAT payable' : 'Estimated VAT refund / credit'}</small></div>
      </header>

      <ProfileCard profile={profile} setProfile={setProfile} />

      {activeTab === 'dashboard' && <Dashboard vatResult={vatResult} ctResult={ctResult} ct={ct} />}
      {activeTab === 'vat' && <VatModule vat={vat} setVat={setVat} result={vatResult} profile={profile} />}
      {activeTab === 'ct' && <CorporateTaxModule ct={ct} setCt={setCt} result={ctResult} />}
    </main>
  </div>;
}

function ProfileCard({ profile, setProfile }) {
  const update = (key, value) => setProfile({ ...profile, [key]: value });
  return <section className="card no-print">
    <div className="card-title"><h2><Building2 size={20}/> Shared Business Profile</h2><span className="badge">Used in both reports</span></div>
    <div className="form-grid four">
      <Field label="Business Name"><input value={profile.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Your Business Name" /></Field>
      <Field label="TRN / CT Number"><input value={profile.trn} onChange={e => update('trn', e.target.value)} placeholder="1000XXXXXXXXXXX" /></Field>
      <Field label="Prepared By"><input value={profile.preparedBy} onChange={e => update('preparedBy', e.target.value)} placeholder="Accountant / owner" /></Field>
      <Field label="Report Period"><input value={profile.period} onChange={e => update('period', e.target.value)} placeholder="Q1 2026 / FY 2026" /></Field>
    </div>
  </section>;
}

function Dashboard({ vatResult, ctResult, ct }) {
  return <section className="grid-section">
    <Kpi label="VAT Payable / Credit" value={money(Math.abs(vatResult.netVat))} tone={vatResult.isPayable ? 'danger' : 'success'} note={vatResult.isPayable ? 'Estimated payable' : 'Estimated refund / credit'} />
    <Kpi label="Corporate Tax" value={money(ctResult.taxDue)} tone="success" note="Estimated annual CT" />
    <Kpi label="Annual Revenue" value={money(ct.revenue)} note="Corporate Tax input" />
    <Kpi label="Taxable Income" value={money(ctResult.taxableIncome)} note="After adjustments" />
  </section>;
}

function VatModule({ vat, setVat, result, profile }) {
  const update = (key, value) => setVat({ ...vat, [key]: value });
  const updateMonth = (index, key, value) => {
    const months = [...vat.months];
    months[index] = { ...months[index], [key]: value };
    setVat({ ...vat, months });
  };

  const rows = Object.entries(emirates).map(([box, label]) => ({
    box,
    label,
    amount: box === vat.emirate ? result.taxableSales : 0,
    vat: box === vat.emirate ? result.outputVat : 0,
    adjustment: box === vat.emirate ? number(vat.salesAdjustmentVat) : 0,
  }));
  rows.push(
    { box: '4', label: 'Zero rated supplies', amount: vat.zeroRated, vat: 0, adjustment: 0 },
    { box: '5', label: 'Exempt supplies', amount: vat.exemptSales, vat: 0, adjustment: 0 },
    { box: '8', label: 'Total output tax due', amount: result.taxableSales + number(vat.zeroRated) + number(vat.exemptSales), vat: result.outputVat, adjustment: number(vat.salesAdjustmentVat) },
    { box: '9', label: 'Standard rated expenses', amount: result.taxableInputs, vat: result.inputVat, adjustment: number(vat.expenseAdjustmentVat) },
    { box: '14', label: result.isPayable ? 'Payable tax for the period' : 'Refundable tax for the period', amount: 0, vat: result.netVat, adjustment: 0 },
  );

  return <section className="stack">
    <div className="grid-section four">
      <Kpi label="Taxable Sales" value={money(result.taxableSales)} />
      <Kpi label="Output VAT" value={money(result.outputVat)} />
      <Kpi label="Recoverable VAT" value={money(result.inputVat)} />
      <Kpi label="Net VAT" value={money(Math.abs(result.netVat))} tone={result.isPayable ? 'danger' : 'success'} />
    </div>

    <section className="card">
      <div className="card-title"><h2>VAT Return Inputs</h2><span className="badge">3-month VAT period</span></div>
      <div className="form-grid three">
        <Field label="Main Emirate"><select value={vat.emirate} onChange={e => update('emirate', e.target.value)}>{Object.entries(emirates).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <Field label="Amount Type"><select value={vat.mode} onChange={e => update('mode', e.target.value)}><option value="inclusive">VAT Inclusive</option><option value="exclusive">VAT Exclusive</option></select></Field>
        <Field label="Sales Adjustment VAT"><input type="number" value={vat.salesAdjustmentVat} onChange={e => update('salesAdjustmentVat', e.target.value)} /></Field>
        <Field label="Zero Rated Sales"><input type="number" value={vat.zeroRated} onChange={e => update('zeroRated', e.target.value)} /></Field>
        <Field label="Exempt Sales"><input type="number" value={vat.exemptSales} onChange={e => update('exemptSales', e.target.value)} /></Field>
        <Field label="Expense Adjustment VAT"><input type="number" value={vat.expenseAdjustmentVat} onChange={e => update('expenseAdjustmentVat', e.target.value)} /></Field>
      </div>
      <div className="month-grid">
        {vat.months.map((row, i) => <div className="month-card" key={i}>
          <Field label={`Month ${i + 1}`}><input value={row.month} onChange={e => updateMonth(i, 'month', e.target.value)} placeholder="Example: Jan 2026" /></Field>
          <Field label="Sales"><input type="number" value={row.sales} onChange={e => updateMonth(i, 'sales', e.target.value)} /></Field>
          <Field label="Purchases"><input type="number" value={row.purchases} onChange={e => updateMonth(i, 'purchases', e.target.value)} /></Field>
          <Field label="Expenses"><input type="number" value={row.expenses} onChange={e => updateMonth(i, 'expenses', e.target.value)} /></Field>
        </div>)}
      </div>
      <Field label="Notes"><textarea value={vat.notes} onChange={e => update('notes', e.target.value)} placeholder="Internal explanation notes" /></Field>
    </section>

    <ReportTable title="VAT201-style Box Summary" rows={rows} />
    <PrintHeader profile={profile} title="UAE VAT Return Summary" />
  </section>;
}

function CorporateTaxModule({ ct, setCt, result }) {
  const update = (key, value) => setCt({ ...ct, [key]: value });
  const status = result.sbrApplied
    ? 'Small Business Relief selected: estimated Corporate Tax is AED 0, subject to eligibility and correct election.'
    : result.taxableIncome <= CT_THRESHOLD
      ? 'Taxable income is within the AED 375,000 0% band.'
      : 'Taxable income exceeds AED 375,000. 9% applies only on the excess amount.';

  return <section className="stack">
    <div className="grid-section four">
      <Kpi label="Accounting Profit" value={money(result.accountingProfit)} />
      <Kpi label="Taxable Income" value={money(result.taxableIncome)} />
      <Kpi label="Estimated CT" value={money(result.taxDue)} tone="success" />
      <Kpi label="Effective Rate" value={`${result.effectiveRate.toFixed(2)}%`} />
    </div>

    <section className="card">
      <div className="card-title"><h2>Corporate Tax Inputs</h2><span className="badge">Annual report</span></div>
      <div className="form-grid three">
        <Field label="Financial Year Start"><input type="date" value={ct.fyStart} onChange={e => update('fyStart', e.target.value)} /></Field>
        <Field label="Financial Year End"><input type="date" value={ct.fyEnd} onChange={e => update('fyEnd', e.target.value)} /></Field>
        <Field label="Small Business Relief"><select value={ct.smallBusinessRelief} onChange={e => update('smallBusinessRelief', e.target.value)}><option value="no">No / Not selected</option><option value="yes">Yes, eligible and selected</option></select></Field>
        <Field label="Entity Type"><select value={ct.entityType} onChange={e => update('entityType', e.target.value)}><option>Mainland / Normal UAE Business</option><option>Free Zone - normal rate</option><option>Free Zone - qualifying income review needed</option><option>Natural person business</option></select></Field>
        <Field label="Total Revenue / Sales"><input type="number" value={ct.revenue} onChange={e => update('revenue', e.target.value)} /></Field>
        <Field label="Cost of Sales / Direct Costs"><input type="number" value={ct.cost} onChange={e => update('cost', e.target.value)} /></Field>
        <Field label="Deductible Expenses"><input type="number" value={ct.deductible} onChange={e => update('deductible', e.target.value)} /></Field>
        <Field label="Non-Deductible Expenses"><input type="number" value={ct.nonDeductible} onChange={e => update('nonDeductible', e.target.value)} /></Field>
        <Field label="Exempt / Non-Taxable Income"><input type="number" value={ct.exemptIncome} onChange={e => update('exemptIncome', e.target.value)} /></Field>
        <Field label="Tax Loss Carried Forward"><input type="number" value={ct.loss} onChange={e => update('loss', e.target.value)} /></Field>
      </div>
      <div className="notice">{status}</div>
      <Field label="Explanation Notes"><textarea value={ct.notes} onChange={e => update('notes', e.target.value)} /></Field>
    </section>

    <section className="card">
      <h2>Corporate Tax Calculation Summary</h2>
      <table><tbody>
        <tr><th>Item</th><th>Formula</th><th>Amount</th></tr>
        <tr><td>Total Revenue</td><td>Input</td><td>{money(ct.revenue)}</td></tr>
        <tr><td>Accounting Profit</td><td>Revenue - Cost - Deductible - Non-deductible</td><td>{money(result.accountingProfit)}</td></tr>
        <tr><td>Tax Adjustments</td><td>+ Non-deductible - Exempt income - Tax loss</td><td>{money(result.adjustments)}</td></tr>
        <tr><td>Taxable Income</td><td>Accounting Profit + Adjustments</td><td>{money(result.taxableIncome)}</td></tr>
        <tr><td>Above Threshold</td><td>Taxable Income - AED 375,000</td><td>{money(result.aboveThreshold)}</td></tr>
        <tr><td>Estimated Corporate Tax</td><td>9% of amount above threshold</td><td>{money(result.taxDue)}</td></tr>
      </tbody></table>
    </section>
  </section>;
}

function ReportTable({ title, rows }) {
  return <section className="card"><h2>{title}</h2><table><thead><tr><th>Box</th><th>Description</th><th>Amount</th><th>VAT</th><th>Adjustment</th></tr></thead><tbody>{rows.map(row => <tr key={`${row.box}-${row.label}`}><td><strong>{row.box}</strong></td><td>{row.label}</td><td>{money(row.amount)}</td><td>{money(row.vat)}</td><td>{money(row.adjustment)}</td></tr>)}</tbody></table></section>;
}

function PrintHeader({ profile, title }) {
  return <section className="print-only print-header"><img src={FTA_LOGO} alt="FTA"/><div><h1>{title}</h1><p>{profile.businessName || 'Company Name'} · {profile.trn || 'TRN / CT No.'} · {profile.period || 'Period'}</p></div></section>;
}

createRoot(document.getElementById('root')).render(<App />);
