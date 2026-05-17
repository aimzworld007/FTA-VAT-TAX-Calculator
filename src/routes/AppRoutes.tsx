import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, LinearProgress, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { RouteLink, usePathname } from '../components/Router';
import { TaxAssistantProvider, useTaxAssistant } from '../modules/taxAssistant/TaxAssistantContext';
import { TaxModuleLayout } from '../modules/taxAssistant/TaxModuleLayout';
import { VatWizard } from '../features/tax/VatWizard';
import { CorporateTaxWizard } from '../features/tax/CorporateTaxWizard';
import { DashboardLayout } from '../features/layouts/DashboardLayout';
import { AuthLayout } from '../features/layouts/AuthLayout';
import { PublicLandingPage } from '../features/home/PublicLandingPage';
import { AuthProvider, useAuth } from '../modules/auth/AuthContext';
import { createTaxRecord, listTaxRecords } from '../features/tax/services/taxRecordsApi';
import { calculateVat } from '../features/tax/lib/vatCalculator';
import { calculateCorporateTax } from '../features/tax/lib/corporateTaxCalculator';

const mapStep = { 'business-details': 1, input: 2, preview: 3, export: 4 } as const;
const mapTaxStep = { 'business-details': 1, input: 3, preview: 5, export: 6 } as const;

const fetchJson = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { navigate, pathname } = usePathname();
  React.useEffect(() => {
    if (!user) {
      const next = encodeURIComponent(pathname);
      navigate(`/login?next=${next}`);
    }
  }, [user, pathname]);
  return user ? <>{children}</> : null;
};
const GuestRoute = ({ children }: { children: React.ReactNode }) => { const { user } = useAuth(); const { navigate } = usePathname(); React.useEffect(() => { if (user) navigate('/dashboard'); }, [user]); return user ? null : <>{children}</>; };

function LoginPage() { const { navigate } = usePathname(); const { login, loading } = useAuth(); const [email, setEmail] = React.useState(''); const [password, setPassword] = React.useState(''); const [error, setError] = React.useState('');
  const redirectTo = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && next.startsWith('/')) return next;
    return '/dashboard';
  }, []);
  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); const result = await login(email, password); if (result.ok) navigate(redirectTo); else setError(result.error || 'Login failed'); };
  return <AuthLayout><Card><CardContent><Stack component='form' spacing={2} onSubmit={onSubmit}><Typography variant='h5'>Login</Typography><TextField label='Email' value={email} onChange={(e) => setEmail(e.target.value)} required /><TextField label='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />{error && <Alert severity='error'>{error}</Alert>}<Button type='submit' variant='contained' disabled={loading}>Login</Button><Button onClick={() => navigate('/register')}>Create account</Button></Stack></CardContent></Card></AuthLayout>; }
function RegisterPage() { const { navigate } = usePathname(); const { register, loading } = useAuth(); const [form, setForm] = React.useState({ fullName: '', email: '', password: '', confirmPassword: '' }); const [msg, setMsg] = React.useState(''); const [error, setError] = React.useState('');
  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); const result = await register(form); if (result.ok) { setMsg('Registration successful'); navigate('/dashboard'); } else setError(result.error || 'Registration failed'); };
  return <AuthLayout><Card><CardContent><Stack component='form' spacing={2} onSubmit={onSubmit}><Typography variant='h5'>Register</Typography><TextField label='Full name' value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /><TextField label='Email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><TextField label='Password' type='password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><TextField label='Confirm Password' type='password' value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />{msg && <Alert severity='success'>{msg}</Alert>}{error && <Alert severity='error'>{error}</Alert>}<Button type='submit' variant='contained' disabled={loading}>Create account</Button></Stack></CardContent></Card></AuthLayout>; }

function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    fetchJson('/api/dashboard')
      .then((response) => setData(response?.data || null))
      .catch(() => setError('Unable to load dashboard details right now.'))
      .finally(() => setLoading(false));
  }, []);

  const businessProfile = data?.businessProfile;
  const profileFields = [businessProfile?.business_name, businessProfile?.address, businessProfile?.email, businessProfile?.phone].filter(Boolean).length;
  const profileCompletion = Math.round((profileFields / 4) * 100);
  const hasRecords = (data?.vatCount || 0) + (data?.corporateTaxCount || 0) > 0;
  const vatNet = Number(data?.totals?.vatNet || 0);

  const fmt = (value: number) => new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 2 }).format(value || 0);
  const kpis = [
    { label: 'Total VAT Records', value: data?.vatCount || 0 },
    { label: 'Total Corporate Tax Records', value: data?.corporateTaxCount || 0 },
    { label: 'Total Sales', value: fmt(Number(data?.totals?.sales || 0)) },
    { label: 'Total Expenses', value: fmt(Number(data?.totals?.expenses || 0)) },
    { label: 'VAT Payable / Refundable', value: vatNet >= 0 ? `Payable ${fmt(vatNet)}` : `Refundable ${fmt(Math.abs(vatNet))}` },
    { label: 'Corporate Tax Estimate', value: fmt(Number(data?.totals?.corporateTaxEstimate || 0)) },
  ];

  return <DashboardLayout><Stack spacing={2.2}>
    <Card variant='outlined'><CardContent><Stack spacing={1}><Typography variant='h4' sx={{ fontWeight: 800 }}>Welcome back, {user?.fullName || user?.email}</Typography><Typography color='text.secondary'>UAE VAT & Corporate Tax Assistant dashboard with your latest filing overview.</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button component={RouteLink} to='/vat/business-details' variant='contained'>New VAT Return</Button><Button component={RouteLink} to='/tax/business-details' variant='contained'>New Corporate Tax</Button></Stack></Stack></CardContent></Card>

    {loading && <Alert severity='info'>Loading dashboard…</Alert>}
    {error && <Alert severity='error'>{error}</Alert>}

    {!loading && !error && <>
      <Card variant='outlined'><CardContent><Stack spacing={1}><Stack direction='row' justifyContent='space-between'><Typography variant='h6'>Business Profile Completion</Typography><Typography sx={{ fontWeight: 700 }}>{profileCompletion}%</Typography></Stack><LinearProgress variant='determinate' value={profileCompletion} sx={{ height: 8, borderRadius: 99 }} />{!businessProfile && <Alert severity='warning'>Business profile is missing. Complete your profile to improve filing accuracy and reminders.</Alert>}</Stack></CardContent></Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>{kpis.map((kpi) => <Card key={kpi.label} variant='outlined'><CardContent><Typography variant='body2' color='text.secondary'>{kpi.label}</Typography><Typography variant='h5' sx={{ fontWeight: 800 }}>{kpi.value}</Typography></CardContent></Card>)}</Box>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Card variant='outlined' sx={{ flex: 1 }}><CardContent><Typography variant='h6' sx={{ mb: 1 }}>Recent VAT Records</Typography><HistoryList records={data?.recentVatRecords || []} emptyMessage='No recent VAT records found.' /></CardContent></Card>
        <Card variant='outlined' sx={{ flex: 1 }}><CardContent><Typography variant='h6' sx={{ mb: 1 }}>Recent Corporate Tax Records</Typography><HistoryList records={data?.recentCorporateTaxRecords || []} emptyMessage='No recent corporate tax records found.' /></CardContent></Card>
      </Stack>

      <Card variant='outlined'><CardContent><Typography variant='h6' sx={{ mb: 1 }}>Upcoming Filing Reminders</Typography>{(data?.upcomingReminders || []).length === 0 ? <Alert severity='info'>No upcoming reminders. Add reminders from the Reminders section.</Alert> : <Stack spacing={1}>{data.upcomingReminders.map((r: any) => <Chip key={r.id} label={`${r.title} • ${new Date(r.due_date).toLocaleDateString()}`} color={r.status === 'completed' ? 'success' : 'warning'} />)}</Stack>}</CardContent></Card>

      <Card variant='outlined'><CardContent><Typography variant='h6' sx={{ mb: 1 }}>Business Analysis</Typography><Stack spacing={1}><Typography color={!businessProfile ? 'warning.main' : 'text.primary'}>{!businessProfile ? 'Your business profile is not yet saved. Add legal and contact details to unlock stronger compliance tracking.' : 'Your business profile is available and contributes to better filing context and reminders.'}</Typography><Typography color={!businessProfile?.trn ? 'warning.main' : 'text.primary'}>{!businessProfile?.trn ? 'TRN is missing in your business profile. Add the TRN to avoid filing delays and ensure return readiness.' : 'TRN is present in your profile, which supports complete VAT filing preparation.'}</Typography><Typography>{vatNet > 0 ? `Current records indicate a net VAT payable position of ${fmt(vatNet)}. Ensure sufficient liquidity before filing.` : vatNet < 0 ? `Current records indicate a VAT refundable position of ${fmt(Math.abs(vatNet))}. Validate supporting invoices before submission.` : 'Current records show a balanced VAT position with no net payable or refundable amount.'}</Typography><Typography>{Number(data?.totals?.corporateTaxEstimate || 0) > 0 ? `Estimated corporate tax exposure is ${fmt(Number(data?.totals?.corporateTaxEstimate || 0))}. Review deductible expenses and timing before year-end.` : 'No corporate tax estimate is currently generated from saved records. Add or update corporate tax records for a clearer projection.'}</Typography><Typography>{hasRecords ? 'You have saved records, allowing trend-based insights and practical compliance planning.' : 'No tax records are saved yet. Start by creating a VAT or Corporate Tax record to activate dashboard analytics.'}</Typography><Typography>{(data?.upcomingReminders || []).length > 0 ? `You have ${(data?.upcomingReminders || []).length} upcoming filing reminder(s). Prioritize the nearest due date to stay compliant.` : 'No upcoming filings are scheduled. Add reminders to stay ahead of statutory deadlines.'}</Typography></Stack></CardContent></Card>
    </>}
  </Stack></DashboardLayout>;
}
function BusinessProfilePage(){return <DashboardLayout><Typography variant='h5'>Business Profile</Typography></DashboardLayout>}
function HistoryList({ records, emptyMessage }: { records: any[]; emptyMessage: string }) {
  if (!records.length) return <Alert severity='info'>{emptyMessage}</Alert>;
  return (
    <Stack spacing={1.2}>
      {records.map((record) => (
        <Card key={record.id} variant='outlined'>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' spacing={1}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{record.period_label || record.payload?.periodLabel || 'No filing period label'}</Typography>
                <Typography variant='body2' color='text.secondary'>Record ID: {record.id}</Typography>
              </Box>
              <Chip size='small' label={`Updated ${new Date(record.updated_at).toLocaleString()}`} />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
function HistoryHubPage({ initialTab }: { initialTab: 'vat' | 'tax' }) {
  const [tab, setTab] = React.useState<'vat' | 'tax'>(initialTab);
  const [vatRecords, setVatRecords] = React.useState<any[]>([]);
  const [taxRecords, setTaxRecords] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchJson('/api/vat-records'), fetchJson('/api/corporate-tax-records')])
      .then(([vatResponse, taxResponse]) => {
        setVatRecords(Array.isArray(vatResponse?.data) ? vatResponse.data : []);
        setTaxRecords(Array.isArray(taxResponse?.data) ? taxResponse.data : []);
      })
      .catch(() => setError('Unable to load saved history right now.'))
      .finally(() => setLoading(false));
  }, []);
  return <DashboardLayout><Stack spacing={2.2}><Box><Typography variant='h5' sx={{ fontWeight: 700 }}>Saved History</Typography><Typography color='text.secondary'>View your saved VAT and Corporate Tax records in one place.</Typography></Box><Tabs value={tab} onChange={(_, value) => setTab(value)}><Tab value='vat' label={`VAT History (${vatRecords.length})`} /><Tab value='tax' label={`Tax History (${taxRecords.length})`} /></Tabs><Divider />{loading && <Alert severity='info'>Loading history...</Alert>}{error && <Alert severity='error'>{error}</Alert>}{!loading && !error && (tab === 'vat' ? <HistoryList records={vatRecords} emptyMessage='No saved VAT history found yet.' /> : <HistoryList records={taxRecords} emptyMessage='No saved corporate tax history found yet.' />)}</Stack></DashboardLayout>;
}
function VatHistoryPage(){return <HistoryHubPage initialTab='vat' />}
function TaxHistoryPage(){return <HistoryHubPage initialTab='tax' />}
function RemindersPage(){return <DashboardLayout><Typography variant='h5'>Reminders</Typography></DashboardLayout>}
function ProfilePage(){return <DashboardLayout><Typography variant='h5'>Settings</Typography></DashboardLayout>}

function RoutedModules() { const { pathname, navigate } = usePathname(); const { user } = useAuth(); const { vat, setVat, ct, setCt } = useTaxAssistant(); const parts = pathname.split('/').filter(Boolean); const module = parts[0]; const step = parts[1] || ''; const guardVat = !vat.businessName || !vat.trn; const guardTax = !ct.companyName || !ct.taxRegistrationNumber || !ct.businessActivity;
  const [saveMsg, setSaveMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const handleSaveVatRecord = React.useCallback(async () => {
    try {
      const result = calculateVat(vat);
      await createTaxRecord({
        taxType: 'VAT',
        periodStart: vat.taxPeriodStart ? new Date(vat.taxPeriodStart).toISOString() : null,
        periodEnd: vat.taxPeriodEnd ? new Date(vat.taxPeriodEnd).toISOString() : null,
        inputPayload: vat,
        resultPayload: result,
      });
      setSaveMsg({ type: 'success', text: 'VAT record saved successfully.' });
    } catch (e: any) {
      setSaveMsg({ type: 'error', text: e.message || 'Failed to save VAT record.' });
    }
  }, [vat]);
  const handleSaveCorporateRecord = React.useCallback(async () => {
    try {
      const result = calculateCorporateTax(ct);
      await createTaxRecord({
        taxType: 'CORPORATE',
        periodStart: ct.financialYearStart ? new Date(ct.financialYearStart).toISOString() : null,
        periodEnd: ct.financialYearEnd ? new Date(ct.financialYearEnd).toISOString() : null,
        inputPayload: ct,
        resultPayload: result,
      });
      setSaveMsg({ type: 'success', text: 'Corporate tax record saved successfully.' });
    } catch (e: any) {
      setSaveMsg({ type: 'error', text: e.message || 'Failed to save corporate tax record.' });
    }
  }, [ct]);
  React.useEffect(() => { if (module === 'vat' && !step) navigate('/vat/business-details'); if (module === 'tax' && !step) navigate('/tax/business-details'); if (module === 'vat' && ['preview', 'export'].includes(step) && guardVat) navigate('/vat/business-details'); if (module === 'tax' && ['preview', 'export'].includes(step) && guardTax) navigate('/tax/business-details'); }, [pathname]);
  if (pathname === '/') return user ? <ProtectedRoute><DashboardPage /></ProtectedRoute> : <PublicLandingPage />;
  if (pathname.startsWith('/login')) return <GuestRoute><LoginPage /></GuestRoute>;
  if (pathname === '/register') return <GuestRoute><RegisterPage /></GuestRoute>;
  if (pathname === '/dashboard') return <ProtectedRoute><DashboardPage /></ProtectedRoute>;
  if (pathname === '/dashboard/profile') return <ProtectedRoute><ProfilePage /></ProtectedRoute>;
  if (pathname === '/dashboard/business-profile') return <ProtectedRoute><BusinessProfilePage /></ProtectedRoute>;
  if (pathname === '/dashboard/vat-history') return <ProtectedRoute><VatHistoryPage /></ProtectedRoute>;
  if (pathname === '/dashboard/tax-history') return <ProtectedRoute><TaxHistoryPage /></ProtectedRoute>;
  if (pathname === '/dashboard/reminders') return <ProtectedRoute><RemindersPage /></ProtectedRoute>;
  if (module === 'vat') return <ProtectedRoute><DashboardLayout><Stack spacing={2}>{saveMsg && <Alert severity={saveMsg.type}>{saveMsg.text}</Alert>}<VatWizard data={vat} setData={setVat} onSave={handleSaveVatRecord} forcedStep={mapStep[step as keyof typeof mapStep] || 1} navigateToStep={navigate} /></Stack></DashboardLayout></ProtectedRoute>;
  if (module === 'tax') return <ProtectedRoute><DashboardLayout><Stack spacing={2}>{saveMsg && <Alert severity={saveMsg.type}>{saveMsg.text}</Alert>}<TaxModuleLayout moduleTitle='Corporate Tax Module' basePath='/tax' currentStep={step || 'business-details'} showModuleHeader={false}><CorporateTaxWizard data={ct} setData={setCt} onSave={handleSaveCorporateRecord} forcedStep={mapTaxStep[step as keyof typeof mapTaxStep] || 1} /></TaxModuleLayout></Stack></DashboardLayout></ProtectedRoute>;
  return <DashboardLayout><Alert severity='warning'>Page not found.</Alert></DashboardLayout>; }

export default function AppRoutes() { return <AuthProvider><TaxAssistantProvider><RoutedModules /></TaxAssistantProvider></AuthProvider>; }
