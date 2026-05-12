import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { ExportActions, FormSection, money } from './components/common.jsx';
import { CorporateTaxReport } from './components/CorporateTaxReport';
import { calculateCorporateTax } from './lib/corporateTaxCalculator';
import { downloadPdfReport } from './lib/pdfGenerator';

const steps = ['Company Details', 'Income', 'Expenses', 'Taxable Profit', 'Tax Calculation', 'Export'];

export function CorporateTaxWizard({ data, setData, onSave, onReset, onProgressChange }) {
  const [step, setStep] = React.useState(1);
  const result = calculateCorporateTax(data);

  React.useEffect(() => {
    onProgressChange?.(Math.round((step / 6) * 100));
  }, [step, onProgressChange]);

  const fieldSx = {
    '& .MuiInputBase-root': { minHeight: { xs: 44, md: 48 }, height: { xs: 44, md: 48 }, borderRadius: '12px', color: '#071832', bgcolor: '#fff' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d7e3f0' },
    '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9cb7dc' },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb', borderWidth: '1px' },
    '& .Mui-focused': { boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' },
    '& .MuiInputBase-input': { padding: '0 14px', fontSize: 14, lineHeight: 1.2 },
    '& .MuiInputLabel-root': { fontSize: 12, lineHeight: 1.1 }
  };

  const missingRequired = !data.companyName || !data.taxRegistrationNumber || !data.businessActivity;
  const next = () => setStep((s) => Math.min(6, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const NumberField = ({ label, keyName, helperText }) => (
    <Grid size={{ xs: 12, md: 4 }}>
      <TextField
        fullWidth
        type='number'
        label={label}
        value={data[keyName]}
        onChange={(e) => setData({ ...data, [keyName]: e.target.value })}
        placeholder='0.00'
        InputProps={{ startAdornment: <InputAdornment position='start'>AED</InputAdornment> }}
        helperText={helperText}
        sx={fieldSx}
      />
    </Grid>
  );

  return <div>
    <FormSection title={`Corporate Tax Wizard: ${steps[step - 1]}`}>
      {step === 1 && <Box>
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2.5 }}>
          <Box sx={{ width: 52, height: 52, borderRadius: '50%', bgcolor: '#eaf1ff', color: 'primary.main', display: 'grid', placeItems: 'center' }}><BusinessOutlinedIcon /></Box>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.3 }}>Corporate Tax Wizard: Company Details</Typography>
            <Typography variant='body2' color='text.secondary'>Enter company profile details for your UAE Corporate Tax workspace.</Typography>
          </Box>
        </Stack>
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth required label='Company name' value={data.companyName} onChange={e => setData({ ...data, companyName: e.target.value })} sx={fieldSx} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth required label='Tax registration number' value={data.taxRegistrationNumber} onChange={e => setData({ ...data, taxRegistrationNumber: e.target.value })} sx={fieldSx} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth required label='Business activity' value={data.businessActivity} onChange={e => setData({ ...data, businessActivity: e.target.value })} sx={fieldSx} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type='date' label='Financial year start' value={data.financialYearStart} onChange={e => setData({ ...data, financialYearStart: e.target.value })} InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth type='date' label='Financial year end' value={data.financialYearEnd} onChange={e => setData({ ...data, financialYearEnd: e.target.value })} InputLabelProps={{ shrink: true }} sx={fieldSx} /></Grid>
          {missingRequired && <Grid size={12}><Typography color='error' variant='caption'>Company name, tax registration number, and business activity are required.</Typography></Grid>}
        </Grid>
      </Box>}

      {step === 2 && <Box>
        <Alert icon={<InfoOutlinedIcon fontSize='inherit' />} severity='info' sx={{ mb: 2.5, borderRadius: 3, border: '1px solid #bfdbfe', bgcolor: '#eff6ff' }}>Enter income values in AED for the selected financial period.</Alert>
        <Grid container spacing={{ xs: 1.5, md: 2 }}>
          <NumberField label='Total revenue' keyName='revenue' helperText='Gross turnover for the period.' />
          <NumberField label='Other income' keyName='otherIncome' helperText='Non-operating income and gains.' />
          <NumberField label='Exempt income' keyName='exemptIncome' helperText='Income treated as exempt from corporate tax.' />
        </Grid>
      </Box>}

      {step === 3 && <Grid container spacing={{ xs: 1.5, md: 2 }}>
        <NumberField label='Direct expenses' keyName='directExpenses' helperText='Cost of goods sold / service delivery.' />
        <NumberField label='Admin & general expenses' keyName='adminExpenses' helperText='Operating and overhead expenses.' />
        <NumberField label='Non-deductible expenses' keyName='nonDeductibleExpenses' helperText='Reference amount for disallowed expenses.' />
      </Grid>}

      {step === 4 && <Grid container spacing={{ xs: 1.5, md: 2 }}>
        <NumberField label='Accounting profit' keyName='accountingProfit' helperText='Leave zero to let calculator infer from income and expenses.' />
        <NumberField label='Add-back adjustments' keyName='addBackAdjustments' helperText='Items added back for tax computation.' />
        <NumberField label='Deductible adjustments' keyName='deductibleAdjustments' helperText='Additional deductible tax adjustments.' />
      </Grid>}

      {step >= 5 && <Box>
        <Card sx={{ borderRadius: 4, border: '1px solid #dbe6f3', boxShadow: '0 10px 24px rgba(15,23,42,.06)', mb: 2 }}>
          <CardContent>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 1.6 }}>Corporate Tax Live Snapshot</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4,minmax(0,1fr))' }, gap: 1.2 }}>
              {[{ label: 'Profit Before Tax', value: money(result.profitBeforeTax), icon: <TrendingUpOutlinedIcon fontSize='small' /> }, { label: 'Taxable Income', value: money(result.taxableIncome), icon: <ReceiptLongOutlinedIcon fontSize='small' /> }, { label: 'Tax Above 0% Threshold', value: money(result.taxableAboveThreshold), icon: <CalculateOutlinedIcon fontSize='small' /> }, { label: 'Estimated Tax Payable', value: money(result.taxPayable), icon: <CalculateOutlinedIcon fontSize='small' />, badge: true }].map((item) => <Card key={item.label} sx={{ border: '1px solid #dbe6f3', borderRadius: 3, boxShadow: 'none' }}><CardContent sx={{ py: 1.4, '&:last-child': { pb: 1.4 } }}><Stack direction='row' spacing={1} alignItems='center'><Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#eaf1ff', color: 'primary.main', display: 'grid', placeItems: 'center' }}>{item.icon}</Box><Box><Typography variant='caption' color='text.secondary'>{item.label}</Typography><Typography variant='subtitle2' sx={{ fontWeight: 800 }}>{item.value}</Typography></Box>{item.badge && <Chip label='9%' color='success' size='small' sx={{ ml: 'auto' }} />}</Stack></CardContent></Card>)}
            </Box>
          </CardContent>
        </Card>
        <CorporateTaxReport data={data} />
      </Box>}
    </FormSection>

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
      <Button variant='outlined' onClick={back} disabled={step === 1} startIcon={<ArrowBackOutlinedIcon />}>Back</Button>
      <Button className='primary-gradient-btn' onClick={next} disabled={step === 6 || (step === 1 && missingRequired)} endIcon={<ArrowForwardOutlinedIcon />}>Continue</Button>
    </Stack>

    {step === 6 && <ExportActions onSave={onSave} onReset={onReset} onPrint={() => window.print()} onPdf={() => downloadPdfReport({ reportId: 'corporate-tax-report', reportType: 'corporate-tax', companyName: data.companyName, taxPeriod: data.financialYearStart && data.financialYearEnd ? `${data.financialYearStart}_to_${data.financialYearEnd}` : 'period' })} />}
  </div>;
}
