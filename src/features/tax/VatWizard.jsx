import React from 'react';
import { Alert, Box, Button, Card, CardContent, FormControl, FormHelperText, Grid, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import NorthOutlinedIcon from '@mui/icons-material/NorthOutlined';
import SouthOutlinedIcon from '@mui/icons-material/SouthOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import PlaylistAddCheckCircleOutlinedIcon from '@mui/icons-material/PlaylistAddCheckCircleOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import SouthWestOutlinedIcon from '@mui/icons-material/SouthWestOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import IosShareOutlinedIcon from '@mui/icons-material/IosShareOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { buildMonthlyEntries, calculateVat } from './lib/vatCalculator';
import { validateRequired, validateVatPeriodSelection } from './lib/taxValidation';
import { TAX_CONFIG } from './lib/taxConfig';
import { FormSection, money } from './components/common.jsx';
import { Vat201Report } from './components/Vat201Report.jsx';
import { MONTHS, formatVatPeriodLabel, getPeriodFromSelection } from './lib/vatPeriod';
import { VAT_PRICING_MODES, splitVatFromAmount } from './lib/vatPricing';
import { cleanupPdfPreviewUrl, createPdfPreview, downloadPdf, generateVatPdfBlob } from './services/vatPdfApi';

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

const metricCards = [
  { key: 'sales', label: 'Total Sales (Input/Gross)', icon: <TrendingUpOutlinedIcon fontSize='small' /> },
  { key: 'purchases', label: 'Total Purchases (Input/Gross)', icon: <ShoppingCartOutlinedIcon fontSize='small' /> },
  { key: 'expenses', label: 'Total Expenses (Input/Gross)', icon: <AccountBalanceWalletOutlinedIcon fontSize='small' /> },
  { key: 'outputVat', label: 'Total Output VAT', icon: <NorthOutlinedIcon fontSize='small' /> },
  { key: 'recoverableVat', label: 'Total Recoverable VAT', icon: <SouthOutlinedIcon fontSize='small' /> }
];

export function VatWizard({ data, setData, onSave, onReset, onProgressChange }) {
  const fieldSx = { '& .MuiInputBase-root': { minHeight: { xs: 44, md: 48 }, height: { xs: 44, md: 48 }, borderRadius: '12px', color: '#071832', bgcolor: '#fff' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d7e3f0' }, '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9cb7dc' }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb', borderWidth: '1px' }, '& .Mui-focused': { boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' }, '& .MuiInputBase-input': { padding: '0 14px', fontSize: 14, lineHeight: 1.2 }, '& .MuiSelect-select': { display: 'flex', alignItems: 'center', padding: '0 38px 0 14px !important', fontSize: 14, lineHeight: 1.2 }, '& .MuiInputLabel-root': { fontSize: 12, lineHeight: 1.1 }, '@media (max-width:768px)': { '& .MuiInputBase-input': { padding: '0 12px' }, '& .MuiSelect-select': { padding: '0 36px 0 12px !important' } } };
  const [step, setStep] = React.useState(1);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [downloadLoading, setDownloadLoading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(null);
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



  const getVatPdfPayload = () => ({
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
  const buildVatPdfFileName = () => `UAE-VAT201-Return-Summary-${(data.businessName || 'business').replace(/\s+/g, '-')}-${formatVatPeriodLabel(data).replace(/\s+/g, '-')}.pdf`;
  const handlePreviewPdf = async () => {
    setPreviewLoading(true);
    try {
      const blob = await generateVatPdfBlob(getVatPdfPayload());
      setPreviewUrl((oldUrl) => {
        cleanupPdfPreviewUrl(oldUrl);
        return createPdfPreview(blob);
      });
    } finally {
      setPreviewLoading(false);
    }
  };
  const hidePreview = () => setPreviewUrl((oldUrl) => {
    cleanupPdfPreviewUrl(oldUrl);
    return null;
  });
  const handleDownloadPdf = async () => {
    setDownloadLoading(true);
    try {
      const blob = await generateVatPdfBlob(getVatPdfPayload());
      downloadPdf(blob, buildVatPdfFileName());
    } finally {
      setDownloadLoading(false);
    }
  };
  React.useEffect(() => () => cleanupPdfPreviewUrl(previewUrl), [previewUrl]);
  const continueDisabled = (step === 1 && Boolean(reqErr)) || step === 5;
  return <div className='vat-wizard'><FormSection title={`VAT Wizard: ${steps[step - 1]}`}>
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
          <Select label='VAT Pricing Mode' value={data.vatPricingMode} onChange={e => setData({ ...data, vatPricingMode: e.target.value })}>
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
    {step === 2 && <div className='vat-input-layout vat-input-premium'>
      <h2 className='vat-input-title'>VAT Wizard: VAT Input</h2>
      <p className='vat-input-subtitle'>Your selected filing frequency is {data.filingFrequency}, so enter {monthCount} {monthCount === 1 ? 'month' : 'months'} of sales, purchases, and expenses.</p>
      <div className='vat-mode-alert'><InfoOutlinedIcon fontSize='small' /><p><strong>VAT Mode: {data.vatPricingMode === VAT_PRICING_MODES.INCLUSIVE ? 'Inclusive' : 'Exclusive'}.</strong> FTA VAT Return Amount should be excluding VAT. If your sales are VAT-inclusive, the system automatically separates taxable value and VAT.</p></div>
      <section className='vat-breakdown-card'><header><h3>Quarterly Breakdown</h3><span className='currency-pill'>Currency: <strong>AED</strong></span></header><div className='vat-monthly-wrap'><table className='vat-input-table'><thead><tr><th>Month</th><th>Sales</th><th>Purchases</th><th>Expenses</th><th>Output VAT</th><th>Recoverable VAT</th><th>Net VAT</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.month}><td><span className='month-cell'><CalendarMonthOutlinedIcon fontSize='small' />{entry.month}</span></td><td><input type='number' min='0' placeholder='0.00' value={entry.sales} onChange={e => updateEntry(entry.month, 'sales', e.target.value)} /></td><td><input type='number' min='0' placeholder='0.00' value={entry.purchases} onChange={e => updateEntry(entry.month, 'purchases', e.target.value)} /></td><td><input type='number' min='0' placeholder='0.00' value={entry.expenses} onChange={e => updateEntry(entry.month, 'expenses', e.target.value)} /></td><td className='vat-readonly'>{money(getEntryOutputVat(entry, data.vatPricingMode))}</td><td className='vat-readonly'>{money(getEntryRecoverableVat(entry, data.vatPricingMode))}</td><td className='vat-readonly vat-net-cell'>{money(getEntryNetVat(entry, data.vatPricingMode))}</td></tr>)}</tbody><tfoot><tr className='vat-total-row'><td>Total</td><td>{money(totals.sales)}</td><td>{money(totals.purchases)}</td><td>{money(totals.expenses)}</td><td>{money(totals.outputVat)}</td><td>{money(totals.recoverableVat)}</td><td className='vat-net-cell'>{money(totals.netVat)}</td></tr></tfoot></table></div></section>
      <div className='vat-input-summary-grid'>{metricCards.map((item) => <article className='vat-kpi-card' key={item.key}><span className='vat-kpi-icon'>{item.icon}</span><div><p>{item.label}</p><strong>{money(totals[item.key])}</strong></div></article>)}<article className={`vat-kpi-card net-kpi ${totals.netVat > 0 ? 'net-payable' : totals.netVat < 0 ? 'net-refundable' : 'net-neutral'}`}><span className='vat-kpi-icon'><CalculateOutlinedIcon fontSize='small' /></span><div><p>Net VAT Payable</p><strong>{money(Math.abs(totals.netVat))}</strong></div></article></div>
    </div>}
    {step === 3 && <Box>
      <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2.5 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#eaf1ff', color: 'primary.main', display: 'grid', placeItems: 'center' }}>
          <PlaylistAddCheckCircleOutlinedIcon />
        </Box>
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.3 }}>VAT Wizard: Adjustments</Typography>
          <Typography variant='body2' color='text.secondary'>Enter optional VAT adjustments before generating your return summary.</Typography>
        </Box>
      </Stack>

      <Alert icon={<InfoOutlinedIcon fontSize='inherit' />} severity='info' sx={{ mb: 2.5, borderRadius: 3, border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}>
        Use this section only for VAT adjustments, corrections, or additional notes required for your VAT201 records.
      </Alert>

      <Card sx={{ borderRadius: 4, border: '1px solid #dbe6f3', boxShadow: '0 10px 24px rgba(15,23,42,.06)' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 700, mb: 1.2 }}>Adjustment Amounts</Typography>
              <Grid container spacing={{ xs: 1.5, md: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type='number' label='Previous period adjustment' value={data.previousAdjustment} onChange={e => setData({ ...data, previousAdjustment: e.target.value })} placeholder='0.00' sx={fieldSx}
                    InputProps={{ startAdornment: <InputAdornment position='start'>AED</InputAdornment> }} helperText='Output VAT-side adjustment from previous VAT period.' />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type='number' label='Bad debt relief' value={data.badDebtRelief} onChange={e => setData({ ...data, badDebtRelief: e.target.value })} placeholder='0.00' sx={fieldSx}
                    InputProps={{ startAdornment: <InputAdornment position='start'>AED</InputAdornment> }} helperText='Recoverable VAT-side correction based on bad debt relief.' />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type='number' label='Zero-rated sales' value={data.zeroRatedSales} onChange={e => setData({ ...data, zeroRatedSales: e.target.value })} placeholder='0.00' sx={fieldSx}
                    InputProps={{ startAdornment: <InputAdornment position='start'>AED</InputAdornment> }} helperText='Used in VAT201 report Box 4 (0% supplies).' />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type='number' label='Exempt sales' value={data.exemptSales} onChange={e => setData({ ...data, exemptSales: e.target.value })} placeholder='0.00' sx={fieldSx}
                    InputProps={{ startAdornment: <InputAdornment position='start'>AED</InputAdornment> }} helperText='Used in VAT201 report Box 5 (exempt supplies).' />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type='number' label='Non-recoverable VAT' value={data.nonRecoverableVat} onChange={e => setData({ ...data, nonRecoverableVat: e.target.value })} placeholder='0.00' sx={fieldSx}
                    InputProps={{ startAdornment: <InputAdornment position='start'>AED</InputAdornment> }} helperText='Reference value for records and export.' />
                </Grid>
              </Grid>

              <Typography variant='subtitle1' sx={{ fontWeight: 700, mt: 2.2, mb: 1.2, display: 'flex', alignItems: 'center', gap: 0.8 }}><NotesOutlinedIcon fontSize='small' />Adjustment Notes</Typography>
              <TextField fullWidth multiline minRows={4} maxRows={7} label='Other adjustment notes' placeholder='Add optional notes for records, corrections, or audit references.' value={data.adjustmentNotes} onChange={e => setData({ ...data, adjustmentNotes: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d7e3f0' }, '& .MuiInputBase-inputMultiline': { fontSize: 14, lineHeight: 1.4 } }} helperText='These notes are stored with your VAT wizard data and export records.' />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 3, border: '1px solid #dbe6f3', bgcolor: '#f8fbff', height: '100%' }}>
                <CardContent>
                  <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.4 }}>Adjustment Impact Summary</Typography>
                  <Stack spacing={1.2}>
                    <Stack direction='row' justifyContent='space-between'><Typography variant='body2' color='text.secondary'>Output adjustment</Typography><Typography variant='body2' sx={{ fontWeight: 600 }}>{money(n(data.previousAdjustment))}</Typography></Stack>
                    <Stack direction='row' justifyContent='space-between'><Typography variant='body2' color='text.secondary'>Recoverable adjustment</Typography><Typography variant='body2' sx={{ fontWeight: 600 }}>{money(n(data.badDebtRelief))}</Typography></Stack>
                    <Box sx={{ borderTop: '1px dashed #d7e3f0', pt: 1 }}>
                      <Stack direction='row' justifyContent='space-between' alignItems='center'>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>Net adjustment impact</Typography>
                        {(() => {
                          const netAdjustmentImpact = n(data.previousAdjustment) - n(data.badDebtRelief);
                          const colorSx = netAdjustmentImpact > 0 ? { color: '#b91c1c', bgcolor: '#fef2f2' } : netAdjustmentImpact < 0 ? { color: '#166534', bgcolor: '#f0fdf4' } : { color: '#1d4ed8', bgcolor: '#eff6ff' };
                          return <Box sx={{ px: 1.2, py: 0.5, borderRadius: 2, fontWeight: 700, fontSize: 13, ...colorSx }}>{money(netAdjustmentImpact)}</Box>;
                        })()}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>}
    {step === 4 && <Box sx={{ bgcolor: '#f5f8fc', borderRadius: 5, p: { xs: 1.5, md: 2 } }}>
      <Card sx={{ borderRadius: 5, border: '1px solid #dbe5f2', boxShadow: '0 8px 20px rgba(15,23,42,.06)' }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant='h5' sx={{ fontWeight: 800, color: '#0f2251' }}>VAT Return Review</Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mt: 0.6, mb: 2.2 }}>Review your VAT return values before generating PDF or printing.</Typography>
          <Alert icon={<InfoOutlinedIcon fontSize='inherit' />} severity='info' sx={{ mb: 2.4, borderRadius: 3, border: '1px solid #bfdbfe', bgcolor: '#eff6ff', color: '#1e40af' }}>This summary is generated from your entered VAT sales, purchases, expenses, and adjustments.</Alert>
          <Grid container spacing={1.6} sx={{ mb: 2.3 }}>
            {[
              { label: 'Taxable Sales', value: result.salesBreakdown.net, helper: 'Total taxable sales', icon: <AssessmentOutlinedIcon fontSize='small' />, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Output VAT (5%)', value: result.outputVat, helper: 'VAT on sales', icon: <TrendingUpOutlinedIcon fontSize='small' />, color: '#16a34a', bg: '#ecfdf3' },
              { label: 'Recoverable VAT', value: result.inputVat, helper: 'Input VAT claims', icon: <SouthWestOutlinedIcon fontSize='small' />, color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Adjustments', value: result.adjustments, helper: 'VAT adjustments', icon: <TuneOutlinedIcon fontSize='small' />, color: '#ea580c', bg: '#fff7ed' },
              { label: 'Net VAT Result', value: Math.abs(result.netVat), helper: 'Payable / (Refundable)', icon: <BalanceOutlinedIcon fontSize='small' />, color: result.netVat > 0 ? '#dc2626' : result.netVat < 0 ? '#16a34a' : '#2563eb', bg: result.netVat > 0 ? '#fef2f2' : result.netVat < 0 ? '#f0fdf4' : '#eff6ff' },
              { label: 'VAT Status', value: result.netVat > 0 ? 'PAYABLE' : result.netVat < 0 ? 'REFUNDABLE' : 'NEUTRAL', helper: result.netVat > 0 ? 'Payment due' : result.netVat < 0 ? 'Refund expected' : 'No payment due', icon: <GppGoodOutlinedIcon fontSize='small' />, color: '#2563eb', bg: '#eff6ff', badge: true }
            ].map((item) => <Grid key={item.label} size={{ xs: 12, sm: 4, lg: 2 }}><Card sx={{ height: '100%', borderRadius: 4, border: '1px solid #dbe5f2', boxShadow: '0 6px 16px rgba(15,23,42,.05)' }}><CardContent sx={{ p: 2 }}><Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: item.bg, color: item.color, display: 'grid', placeItems: 'center', mb: 1.8 }}>{item.icon}</Box><Typography variant='body2' sx={{ color: '#334155', mb: 0.8 }}>{item.label}</Typography>{item.badge ? <Box sx={{ display: 'inline-block', px: 1.25, py: 0.45, borderRadius: 99, bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 800, fontSize: 12, mb: 1 }}>{item.value}</Box> : <Typography variant='h5' sx={{ fontWeight: 800, color: item.color, mb: 1 }}>{money(item.value)}</Typography>}<Typography variant='body2' color='text.secondary'>{item.helper}</Typography></CardContent></Card></Grid>)}
          </Grid>
          <Card sx={{ borderRadius: 4, border: '1px solid #dbe5f2', boxShadow: '0 4px 14px rgba(15,23,42,.05)', overflow: 'hidden' }}>
            <Typography variant='h6' sx={{ fontWeight: 700, px: 2, py: 1.5 }}>VAT Breakdown</Typography>
            <Box sx={{ overflowX: 'auto' }}><Box component='table' sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}><Box component='thead' sx={{ bgcolor: '#f1f5f9' }}><Box component='tr'><Box component='th' sx={{ textAlign: 'left', p: 1.5 }}>Description</Box><Box component='th' sx={{ textAlign: 'right', p: 1.5 }}>Amount (AED)</Box><Box component='th' sx={{ textAlign: 'center', p: 1.5 }}>Status</Box></Box></Box><Box component='tbody'>{[
              { label: 'Total Sales (Input/Gross)', helper: 'Total value of taxable sales', amount: result.salesBreakdown.total, icon: <AssessmentOutlinedIcon fontSize='small' />, status: '—' },
              { label: 'VAT 5% (Output VAT)', helper: 'VAT calculated on taxable sales', amount: result.outputVat, icon: <PercentOutlinedIcon fontSize='small' />, status: '—' },
              { label: 'Input VAT (Recoverable VAT)', helper: 'VAT paid on purchases & expenses', amount: result.inputVat, icon: <SouthOutlinedIcon fontSize='small' />, status: '—' },
              { label: 'Adjustments', helper: 'Adjustments and corrections', amount: result.adjustments, icon: <TuneOutlinedIcon fontSize='small' />, status: '—' },
              { label: 'Final VAT Payable', helper: 'Amount payable to FTA or refundable', amount: result.netVat, icon: <BalanceOutlinedIcon fontSize='small' />, status: result.netVat > 0 ? 'PAYABLE' : result.netVat < 0 ? 'REFUNDABLE' : 'NEUTRAL', final: true }
            ].map((row) => <Box component='tr' key={row.label} sx={{ borderTop: '1px solid #e2e8f0', bgcolor: row.final ? '#eff6ff' : '#fff' }}><Box component='td' sx={{ p: 1.5 }}><Stack direction='row' spacing={1.2} alignItems='center'><Box sx={{ width: 30, height: 30, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: '#eff6ff', color: '#2563eb' }}>{row.icon}</Box><Box><Typography sx={{ fontWeight: 700 }}>{row.label}</Typography><Typography variant='body2' color='text.secondary'>{row.helper}</Typography></Box></Stack></Box><Box component='td' sx={{ p: 1.5, textAlign: 'right', fontWeight: 700, color: row.final ? '#2563eb' : '#0f172a' }}>{money(row.amount)}</Box><Box component='td' sx={{ p: 1.5, textAlign: 'center' }}><Box sx={{ display: 'inline-block', px: 1.1, py: 0.35, borderRadius: 99, bgcolor: row.status === 'PAYABLE' ? '#fee2e2' : row.status === 'REFUNDABLE' ? '#dcfce7' : '#e2e8f0', color: row.status === 'PAYABLE' ? '#b91c1c' : row.status === 'REFUNDABLE' ? '#166534' : '#475569', fontSize: 12, fontWeight: 800 }}>{row.status}</Box></Box></Box>)}</Box></Box></Box>
          </Card>
          <Alert icon={<InfoOutlinedIcon fontSize='inherit' />} severity='info' sx={{ mt: 2.3, borderRadius: 3, border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}><Typography sx={{ fontWeight: 700 }}>Important Notice</Typography>For preparation assistance only. Please verify all values before official UAE FTA submission.</Alert>
        </CardContent>
      </Card>
    </Box>}
    {step === 5 && <Vat201Report data={{ ...data, monthlyEntries: buildMonthlyEntries(data) }} result={result} />}
  </FormSection>
    <Card sx={{ mt: 2, borderRadius: 4, border: '1px solid #dbe6f3', boxShadow: '0 10px 24px rgba(15,23,42,.06)' }}>
      <CardContent sx={{ py: 1.5, px: { xs: 1.3, md: 2.2 }, '&:last-child': { pb: 1.5 } }}>
    <div className='wizard-action-bar'>
      <Stack direction={{xs:'column',sm:'row'}} spacing={1.5} className='wizard-action-group wizard-action-group-left'>
        <Button variant='outlined' startIcon={<ArrowBackOutlinedIcon />} onClick={back} disabled={step===1}>Back</Button>
        <Button className='primary-gradient-btn' endIcon={<ArrowForwardOutlinedIcon />} onClick={next} disabled={continueDisabled}>Continue</Button>
      </Stack>
      {step >= 4 && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className='wizard-action-group wizard-action-group-right'>
        <Button variant='outlined' startIcon={<PrintOutlinedIcon />} onClick={() => window.print()}>Print</Button>
        {onSave && <Button variant='outlined' startIcon={<IosShareOutlinedIcon />} onClick={onSave}>Save Draft</Button>}
        <Button className='danger-soft-btn' variant='outlined' onClick={onReset}>Reset</Button>
        <Button variant='outlined' color='primary' startIcon={<VisibilityOutlinedIcon />} onClick={handlePreviewPdf} disabled={previewLoading || downloadLoading}>{previewLoading ? 'Generating Preview…' : 'Preview PDF'}</Button>
        <Button className='primary-gradient-btn' variant='contained' startIcon={<DownloadOutlinedIcon />} onClick={handleDownloadPdf} disabled={downloadLoading || previewLoading}>{downloadLoading ? 'Downloading PDF…' : 'Download PDF'}</Button>
      </Stack>}
    </div>
    {step === 5 && (previewLoading || previewUrl) && <Card sx={{ mt: 2, borderRadius: 4, border: '1px solid #dbe6f3' }}>
      <CardContent>
        <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1.5 }}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>PDF Preview</Typography>
          <Button variant='text' color='inherit' startIcon={<CloseOutlinedIcon />} onClick={hidePreview} disabled={previewLoading}>Close Preview</Button>
        </Stack>
        {previewLoading ? <Typography color='text.secondary'>Generating PDF preview…</Typography> : <Box sx={{ border: '1px solid #dbe6f3', borderRadius: 2, overflow: 'hidden', height: { xs: 460, md: 720 } }}><iframe title='VAT PDF Preview' src={previewUrl || ''} style={{ width: '100%', height: '100%', border: 0 }} /></Box>}
      </CardContent>
    </Card>}
    </CardContent>
    </Card>
  </div>;
}
