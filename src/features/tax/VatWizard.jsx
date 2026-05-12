import React from 'react';
import { Box, Button, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography, Card, CardContent } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { buildMonthlyEntries, calculateVat } from './lib/vatCalculator';
import { validateRequired, validateVatPeriodSelection } from './lib/taxValidation';
import { TAX_CONFIG } from './lib/taxConfig';
import { ExportActions, FormSection, TaxSummaryCard, money } from './components/common.jsx';
import { Vat201Report } from './components/Vat201Report.jsx';
import { MONTHS, formatVatPeriodLabel, getPeriodFromSelection } from './lib/vatPeriod';
import { VAT_PRICING_MODES, splitVatFromAmount } from './lib/vatPricing';
import { downloadVatPdf } from './services/vatPdfApi';

const steps = ['Business Details', 'VAT Input', 'Adjustments', 'Review', 'Export'];
const n = (v) => Number(v) || 0;
const clampInput = (v) => Math.max(0, n(v));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

const EMIRATE_OPTIONS = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
const EMIRATE_BOX_MAP = {
  'Abu Dhabi': '1a',
  Dubai: '1b',
  Sharjah: '1c',
  Ajman: '1d',
  'Umm Al Quwain': '1e',
  'Ras Al Khaimah': '1f',
  Fujairah: '1g'
};


export function VatWizard({ data, setData, onSave, onReset, onProgressChange }) {
  const fieldSx = { '& .MuiInputBase-root': { minHeight: 52, borderRadius: 3, color: '#071832', bgcolor: '#fff' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d7e3f0' }, '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9cb7dc' }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb', borderWidth: '1px' }, '& .Mui-focused': { boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' } };
  const [step, setStep] = React.useState(1);
  const [pdfLoading, setPdfLoading] = React.useState(false);
  const result = calculateVat(data);
  const reqErr = validateRequired(data.businessName, 'Business name') || validateRequired(data.trn, 'TRN') || validateRequired(data.businessLocationEmirate, 'Business location emirate') || validateVatPeriodSelection(data);

  React.useEffect(() => {
    const period = getPeriodFromSelection(data);
    const nextEntries = buildMonthlyEntries({ ...data, ...period });
    if (JSON.stringify(nextEntries) !== JSON.stringify(data.monthlyEntries || []) || period.taxPeriodStart !== data.taxPeriodStart || period.taxPeriodEnd !== data.taxPeriodEnd) {
      setData({ ...data, ...period, monthlyEntries: nextEntries });
    }
  }, [data.filingFrequency, data.filingYear, data.filingMonth, data.filingQuarter, data.filingStartMonth]);

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  React.useEffect(() => {
    onProgressChange?.(Math.round((step / 5) * 100));
  }, [step, onProgressChange]);

  const updateEntry = (month, key, value) => {
    const updated = buildMonthlyEntries(data).map((entry) => (entry.month === month ? { ...entry, [key]: clampInput(value) } : entry));
    setData({ ...data, monthlyEntries: updated });
  };

  const monthCount = buildMonthlyEntries(data).length;
  const entries = buildMonthlyEntries(data);

  const getEntryOutputVat = (entry, vatMode) => splitVatFromAmount(n(entry.sales), vatMode).vat;

  const getEntryRecoverableVat = (entry, vatMode) => {
    const base = n(entry.purchases) + n(entry.expenses);
    return splitVatFromAmount(base, vatMode).vat;
  };

  const getEntryNetVat = (entry, vatMode) => getEntryOutputVat(entry, vatMode) - getEntryRecoverableVat(entry, vatMode);

  const totals = entries.reduce((acc, entry) => ({
    sales: acc.sales + n(entry.sales),
    purchases: acc.purchases + n(entry.purchases),
    expenses: acc.expenses + n(entry.expenses),
    outputVat: acc.outputVat + getEntryOutputVat(entry, data.vatPricingMode),
    recoverableVat: acc.recoverableVat + getEntryRecoverableVat(entry, data.vatPricingMode),
    netVat: acc.netVat + getEntryNetVat(entry, data.vatPricingMode)
  }), { sales: 0, purchases: 0, expenses: 0, outputVat: 0, recoverableVat: 0, netVat: 0 });



  const downloadProfessionalPdf = async () => {
    setPdfLoading(true);
    try {
      await downloadVatPdf({
        businessName: data.businessName,
        trn: data.trn,
        businessLocationEmirate: data.businessLocationEmirate,
        vatPeriod: formatVatPeriodLabel(data),
        preparedBy: 'UAE VAT & Tax Filing Assistant',
        preparedDate: new Date().toISOString().slice(0, 10),
        vatMode: data.vatPricingMode === VAT_PRICING_MODES.INCLUSIVE ? 'Inclusive' : 'Exclusive',
        summary: { taxableSales: result.salesBreakdown.net, outputVat: result.outputVat, recoverableVat: result.inputVat, zeroRated: Number(data.zeroRatedSales) || 0, exempt: Number(data.exemptSales) || 0, netVat: result.netVat },
        monthly: buildMonthlyEntries(data)
      });
    } finally {
      setPdfLoading(false);
    }
  };
  const continueDisabled = (step === 1 && Boolean(reqErr)) || step === 5;
  return <div><FormSection title={`VAT Wizard: ${steps[step - 1]}`}>
    {step === 1 && <Box>
      <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2.5 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#eaf1ff', color: 'primary.main', display: 'grid', placeItems: 'center' }}>
          <BusinessOutlinedIcon />
        </Box>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.3 }}>VAT Wizard: Business Details</Typography>
          <Typography variant='body2' color='text.secondary'>Provide your business information to get started</Typography>
        </Box>
      </Stack>
      <Grid container spacing={{ xs: 1.5, md: 2 }}>
      <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required label='Business name' value={data.businessName} onChange={e => setData({ ...data, businessName: e.target.value })} sx={fieldSx} /></Grid>
      <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth required label='TRN' value={data.trn} onChange={e => setData({ ...data, trn: e.target.value })} sx={fieldSx} /></Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth required sx={fieldSx}>
          <InputLabel>Business Location Emirate *</InputLabel>
          <Select label='Business Location Emirate *' value={data.businessLocationEmirate || ''} onChange={e => setData({ ...data, businessLocationEmirate: e.target.value })}>
            {EMIRATE_OPTIONS.map((emirate) => <MenuItem key={emirate} value={emirate}>{emirate}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}><FormControl fullWidth sx={fieldSx}><InputLabel>Filing frequency</InputLabel><Select label='Filing frequency' value={data.filingFrequency} onChange={e => setData({ ...data, filingFrequency: e.target.value })}>{TAX_CONFIG.filingFrequencies.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}</Select></FormControl></Grid>
      <Grid size={{ xs: 12, md: 6 }}><FormControl fullWidth sx={fieldSx}><InputLabel>Filing year</InputLabel><Select label='Filing year' value={data.filingYear} onChange={e => setData({ ...data, filingYear: Number(e.target.value) })}>{years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}</Select></FormControl></Grid>
      {data.filingFrequency === 'Monthly' && <Grid size={{ xs: 12, md: 6 }}><FormControl fullWidth sx={fieldSx}><InputLabel>Filing month</InputLabel><Select label='Filing month' value={data.filingMonth} onChange={e => setData({ ...data, filingMonth: e.target.value })}>{MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl></Grid>}
      {data.filingFrequency === 'Quarterly' && <Grid size={{ xs: 12, md: 6 }}><FormControl fullWidth sx={fieldSx}><InputLabel>Quarter start month</InputLabel><Select label='Quarter start month' value={data.filingStartMonth} onChange={e => setData({ ...data, filingStartMonth: e.target.value })}>{MONTHS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl></Grid>}
      {data.filingFrequency === 'Yearly' && <Grid size={12}><Typography variant='body2' color='text.secondary'>Full year selected.</Typography></Grid>}
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>VAT Pricing Mode</InputLabel>
          <Select label='VAT Pricing Mode' value={data.vatPricingMode} onChange={e => setData({ ...data, vatPricingMode: e.target.value })} sx={{ minHeight: 46 }}>
            {Object.values(VAT_PRICING_MODES).map(mode => <MenuItem key={mode} value={mode}>{mode === VAT_PRICING_MODES.INCLUSIVE ? 'Inclusive (amount entered includes VAT)' : 'Exclusive (amount entered excludes VAT)'}</MenuItem>)}
          </Select>
          <FormHelperText>This controls how sales and costs are converted into VAT return values.</FormHelperText>
        </FormControl>
      </Grid>
      <Grid size={12}>
        <Box sx={{ mt: 0.5, border: '1px solid #93c5fd', bgcolor: '#eaf1ff', borderRadius: 3, px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.2, width: '100%' }}>
          <CalendarMonthOutlinedIcon color='primary' fontSize='small' />
          <Typography color='primary.main' sx={{ fontWeight: 700 }}>
            Selected Tax Period: {formatVatPeriodLabel(data)}
          </Typography>
        </Box>
      </Grid>
      {(reqErr) && <Grid size={12}><FormHelperText error>{reqErr}</FormHelperText></Grid>}
    </Grid>
    </Box>}
    {step === 2 && <div className='vat-input-layout'>
      <p className='field-help vat-input-help'>Your selected filing frequency is {data.filingFrequency}, so enter {monthCount} {monthCount === 1 ? 'month' : 'months'} of sales, purchases, and expenses.</p>
      <p className='field-help'>VAT Mode: {data.vatPricingMode === VAT_PRICING_MODES.INCLUSIVE ? 'Inclusive' : 'Exclusive'}. FTA VAT Return Amount should be excluding VAT. If your sales are VAT-inclusive, the system automatically separates taxable value and VAT.</p>
      <div className='vat-input-main'>
        <div className='vat-monthly-wrap vat-monthly-wrap-desktop'><table className='vat-input-table'><thead><tr><th>Month</th><th>Sales</th><th>Purchases</th><th>Expenses</th><th>Output VAT</th><th>Recoverable VAT</th><th>Net VAT</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.month}><td>{entry.month}</td><td><input type='number' min='0' value={entry.sales} onChange={e => updateEntry(entry.month, 'sales', e.target.value)} /></td><td><input type='number' min='0' value={entry.purchases} onChange={e => updateEntry(entry.month, 'purchases', e.target.value)} /></td><td><input type='number' min='0' value={entry.expenses} onChange={e => updateEntry(entry.month, 'expenses', e.target.value)} /></td><td className='vat-readonly'>{money(getEntryOutputVat(entry, data.vatPricingMode))}</td><td className='vat-readonly'>{money(getEntryRecoverableVat(entry, data.vatPricingMode))}</td><td className='vat-readonly'>{money(getEntryNetVat(entry, data.vatPricingMode))}</td></tr>)}</tbody><tfoot><tr className='vat-total-row'><td>Total</td><td>{money(totals.sales)}</td><td>{money(totals.purchases)}</td><td>{money(totals.expenses)}</td><td>{money(totals.outputVat)}</td><td>{money(totals.recoverableVat)}</td><td>{money(totals.netVat)}</td></tr></tfoot></table></div>
        <div className='vat-mobile-cards'>{entries.map((entry) => <article className='vat-mobile-card' key={`mobile-${entry.month}`}><h3>{entry.month}</h3><label className='field'><span>Sales</span><input type='number' min='0' value={entry.sales} onChange={e => updateEntry(entry.month, 'sales', e.target.value)} /></label><label className='field'><span>Purchases</span><input type='number' min='0' value={entry.purchases} onChange={e => updateEntry(entry.month, 'purchases', e.target.value)} /></label><label className='field'><span>Expenses</span><input type='number' min='0' value={entry.expenses} onChange={e => updateEntry(entry.month, 'expenses', e.target.value)} /></label><div className='vat-mobile-amounts'><p><span>Output VAT</span><strong>{money(getEntryOutputVat(entry, data.vatPricingMode))}</strong></p><p><span>Recoverable VAT</span><strong>{money(getEntryRecoverableVat(entry, data.vatPricingMode))}</strong></p><p><span>Net VAT</span><strong>{money(getEntryNetVat(entry, data.vatPricingMode))}</strong></p></div></article>)}</div>
      </div>
      <div className='vat-input-summary-grid'>
        <TaxSummaryCard label='Total Sales (Input/Gross)' value={money(totals.sales)} />
        <TaxSummaryCard label='Total Purchases (Input/Gross)' value={money(totals.purchases)} />
        <TaxSummaryCard label='Total Expenses (Input/Gross)' value={money(totals.expenses)} />
        <TaxSummaryCard label='Total Output VAT' value={money(totals.outputVat)} />
        <TaxSummaryCard label='Total Recoverable VAT' value={money(totals.recoverableVat)} />
        <TaxSummaryCard label={totals.netVat >= 0 ? 'Net VAT Payable' : 'Net VAT Refundable'} value={money(Math.abs(totals.netVat))} />
      </div>
      <div className='form-grid three vat-extra-inputs'>
        <label className='field'><span>Zero-rated sales (AED)</span><input type='number' min='0' name='zeroRatedSales' placeholder='Enter zero-rated sales' value={data.zeroRatedSales} onChange={e => setData({ ...data, zeroRatedSales: e.target.value })} /><small className='field-help'>Used in VAT201 report Box 4 (0% supplies).</small></label>
        <label className='field'><span>Exempt sales (AED)</span><input type='number' min='0' name='exemptSales' placeholder='Enter exempt sales' value={data.exemptSales} onChange={e => setData({ ...data, exemptSales: e.target.value })} /><small className='field-help'>Used in VAT201 report Box 5 (exempt supplies).</small></label>
        <label className='field'><span>Non-recoverable VAT (AED)</span><input type='number' min='0' name='nonRecoverableVat' placeholder='Enter blocked input VAT' value={data.nonRecoverableVat} onChange={e => setData({ ...data, nonRecoverableVat: e.target.value })} /><small className='field-help'>Reference value for records and export.</small></label>
      </div>
    </div>}
    {step === 3 && <div className='form-grid three'><input type='number' placeholder='Previous period adjustment' value={data.previousAdjustment} onChange={e => setData({ ...data, previousAdjustment: e.target.value })} /><input type='number' placeholder='Bad debt relief' value={data.badDebtRelief} onChange={e => setData({ ...data, badDebtRelief: e.target.value })} /><textarea placeholder='Other adjustment notes' value={data.adjustmentNotes} onChange={e => setData({ ...data, adjustmentNotes: e.target.value })} /></div>}
    {step === 4 && <div className='grid-section'><TaxSummaryCard label={result.vatPricingMode === VAT_PRICING_MODES.INCLUSIVE ? 'Net Amount' : 'Subtotal'} value={money(result.salesBreakdown.net)} /><TaxSummaryCard label={result.vatPricingMode === VAT_PRICING_MODES.INCLUSIVE ? 'VAT Included' : 'VAT 5%'} value={money(result.salesBreakdown.vat)} /><TaxSummaryCard label='Grand Total' value={money(result.salesBreakdown.total)} /><TaxSummaryCard label='Total input VAT' value={money(result.inputVat)} /><TaxSummaryCard label='Adjustments' value={money(result.adjustments)} /><TaxSummaryCard label={result.label} value={money(result.netVat)} /><p>For preparation only. Please verify before official FTA submission.</p></div>}
    {step === 5 && <Vat201Report data={{ ...data, monthlyEntries: buildMonthlyEntries(data) }} result={result} />}
  </FormSection>
    <Card sx={{ mt: 2, borderRadius: 4, border: '1px solid #dbe6f3', boxShadow: '0 10px 24px rgba(15,23,42,.06)' }}>
      <CardContent sx={{ py: 1.5, px: { xs: 1.3, md: 2.2 }, '&:last-child': { pb: 1.5 } }}>
    <div className='wizard-action-bar'>
      <Stack direction={{xs:'column',sm:'row'}} spacing={1.5} className='wizard-action-group wizard-action-group-left'>
        <Button variant='outlined' onClick={back} disabled={step===1}>Back</Button>
        <Button className='primary-gradient-btn' onClick={next} disabled={continueDisabled}>Continue</Button>
      </Stack>
      {step === 5 && <ExportActions onSave={onSave} onReset={onReset} onPrint={() => window.print()} onPdf={downloadProfessionalPdf} pdfLoading={pdfLoading} />}
    </div>
    </CardContent>
    </Card>
  </div>;
}
