import React from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, LinearProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { DashboardLayout } from '../layouts/DashboardLayout';

type BusinessProfile = {
  businessName: string;
  trn: string;
  emirate: string;
  address: string;
  phone: string;
  email: string;
  vatFilingFrequency: string;
  corporateTaxYearStart: string;
  corporateTaxYearEnd: string;
  defaultVatPricingMode: string;
};

const initialState: BusinessProfile = {
  businessName: '', trn: '', emirate: '', address: '', phone: '', email: '',
  vatFilingFrequency: 'Quarterly', corporateTaxYearStart: '', corporateTaxYearEnd: '', defaultVatPricingMode: 'Tax Exclusive',
};

const emirates = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];

export function BusinessProfilePage() {
  const [form, setForm] = React.useState<BusinessProfile>(initialState);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/api/business-profile', { credentials: 'include' })
      .then((r) => r.json())
      .then((payload) => {
        const data = payload?.data;
        if (data) setForm({ ...initialState, ...data, trn: data?.trn || '' });
      })
      .catch(() => setNotice({ type: 'error', text: 'Unable to load business profile.' }))
      .finally(() => setLoading(false));
  }, []);

  const completionFields = Object.values(form).filter((v) => String(v || '').trim().length > 0).length;
  const completion = Math.round((completionFields / Object.keys(form).length) * 100);

  const setField = (key: keyof BusinessProfile, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setNotice(null);
    try {
      const res = await fetch('/api/business-profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) {
        setNotice({ type: 'error', text: payload?.message || 'Failed to save profile.' });
      } else {
        setForm({ ...initialState, ...payload?.data });
        setNotice({ type: 'success', text: 'Business profile saved successfully.' });
      }
    } catch {
      setNotice({ type: 'error', text: 'Unable to save profile right now.' });
    } finally {
      setSaving(false);
    }
  };

  return <DashboardLayout><Stack spacing={2.5}>
    <Box>
      <Typography variant='h4' sx={{ fontWeight: 700 }}>Business Profile</Typography>
      <Typography color='text.secondary'>Maintain your UAE business identity and default tax settings for faster filings.</Typography>
    </Box>
    {notice && <Alert severity={notice.type}>{notice.text}</Alert>}
    <Card variant='outlined'><CardContent><Stack spacing={1}><Stack direction='row' justifyContent='space-between'><Typography variant='h6'>Profile Completion</Typography><Typography sx={{ fontWeight: 700 }}>{completion}%</Typography></Stack><LinearProgress variant='determinate' value={completion} sx={{ height: 8, borderRadius: 99 }} /></Stack></CardContent></Card>

    {loading ? <Alert severity='info'>Loading business profile…</Alert> : <Card variant='outlined'><CardContent><Stack component='form' onSubmit={onSave} spacing={2.2}>
      <Typography variant='h6'>Business Identity</Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}><TextField label='Business Name' required fullWidth value={form.businessName} onChange={(e) => setField('businessName', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField label='TRN' fullWidth value={form.trn} onChange={(e) => setField('trn', e.target.value)} helperText='Numbers only' /></Grid>
        <Grid item xs={12} md={6}><TextField select label='Emirate' fullWidth value={form.emirate} onChange={(e) => setField('emirate', e.target.value)}>{emirates.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}</TextField></Grid>
        <Grid item xs={12} md={6}><TextField label='Address' fullWidth value={form.address} onChange={(e) => setField('address', e.target.value)} /></Grid>
      </Grid>

      <Typography variant='h6'>Tax Settings</Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}><TextField select label='VAT Filing Frequency' fullWidth value={form.vatFilingFrequency} onChange={(e) => setField('vatFilingFrequency', e.target.value)}><MenuItem value='Monthly'>Monthly</MenuItem><MenuItem value='Quarterly'>Quarterly</MenuItem></TextField></Grid>
        <Grid item xs={12} md={4}><TextField type='date' fullWidth label='Corporate Tax Year Start' InputLabelProps={{ shrink: true }} value={form.corporateTaxYearStart} onChange={(e) => setField('corporateTaxYearStart', e.target.value)} /></Grid>
        <Grid item xs={12} md={4}><TextField type='date' fullWidth label='Corporate Tax Year End' InputLabelProps={{ shrink: true }} value={form.corporateTaxYearEnd} onChange={(e) => setField('corporateTaxYearEnd', e.target.value)} /></Grid>
        <Grid item xs={12} md={4}><TextField select fullWidth label='Default VAT Pricing Mode' value={form.defaultVatPricingMode} onChange={(e) => setField('defaultVatPricingMode', e.target.value)}><MenuItem value='Tax Inclusive'>Tax Inclusive</MenuItem><MenuItem value='Tax Exclusive'>Tax Exclusive</MenuItem></TextField></Grid>
      </Grid>

      <Typography variant='h6'>Contact</Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={6}><TextField label='Phone' fullWidth value={form.phone} onChange={(e) => setField('phone', e.target.value)} /></Grid>
        <Grid item xs={12} md={6}><TextField label='Email' type='email' fullWidth value={form.email} onChange={(e) => setField('email', e.target.value)} /></Grid>
      </Grid>

      <Box><Button type='submit' variant='contained' disabled={saving}>{saving ? 'Saving...' : 'Save / Update Profile'}</Button></Box>
    </Stack></CardContent></Card>}
  </Stack></DashboardLayout>;
}
