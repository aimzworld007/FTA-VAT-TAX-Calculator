import React from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material';
import { RouteLink, usePathname } from '../components/Router';
import { TaxAssistantProvider, useTaxAssistant } from '../modules/taxAssistant/TaxAssistantContext';
import { TaxModuleLayout } from '../modules/taxAssistant/TaxModuleLayout';
import { VatWizard } from '../features/tax/VatWizard';
import { CorporateTaxWizard } from '../features/tax/CorporateTaxWizard';
import { DashboardLayout } from '../features/layouts/DashboardLayout';
import { AuthLayout } from '../features/layouts/AuthLayout';
import { PublicLandingPage } from '../features/home/PublicLandingPage';
import { AuthProvider, useAuth } from '../modules/auth/AuthContext';

const mapStep = { 'business-details': 1, input: 2, preview: 3, export: 4 } as const;
const mapTaxStep = { 'business-details': 1, input: 3, preview: 5, export: 6 } as const;

const fetchJson = (url: string) => fetch(url, { credentials: 'include' }).then((r) => r.json());
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => { const { user } = useAuth(); const { navigate } = usePathname(); React.useEffect(() => { if (!user) navigate('/login'); }, [user]); return user ? <>{children}</> : null; };
const GuestRoute = ({ children }: { children: React.ReactNode }) => { const { user } = useAuth(); const { navigate } = usePathname(); React.useEffect(() => { if (user) navigate('/dashboard'); }, [user]); return user ? null : <>{children}</>; };

function LoginPage() { const { navigate } = usePathname(); const { login, loading } = useAuth(); const [email, setEmail] = React.useState(''); const [password, setPassword] = React.useState(''); const [error, setError] = React.useState('');
  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); const result = await login(email, password); if (result.ok) navigate('/dashboard'); else setError(result.error || 'Login failed'); };
  return <AuthLayout><Card><CardContent><Stack component='form' spacing={2} onSubmit={onSubmit}><Typography variant='h5'>Login</Typography><TextField label='Email' value={email} onChange={(e) => setEmail(e.target.value)} required /><TextField label='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />{error && <Alert severity='error'>{error}</Alert>}<Button type='submit' variant='contained' disabled={loading}>Login</Button><Button onClick={() => navigate('/register')}>Create account</Button></Stack></CardContent></Card></AuthLayout>; }
function RegisterPage() { const { navigate } = usePathname(); const { register, loading } = useAuth(); const [form, setForm] = React.useState({ fullName: '', email: '', password: '', confirmPassword: '' }); const [msg, setMsg] = React.useState(''); const [error, setError] = React.useState('');
  const onSubmit = async (e: React.FormEvent) => { e.preventDefault(); const result = await register(form); if (result.ok) { setMsg('Registration successful'); navigate('/dashboard'); } else setError(result.error || 'Registration failed'); };
  return <AuthLayout><Card><CardContent><Stack component='form' spacing={2} onSubmit={onSubmit}><Typography variant='h5'>Register</Typography><TextField label='Full name' value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /><TextField label='Email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /><TextField label='Password' type='password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><TextField label='Confirm Password' type='password' value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />{msg && <Alert severity='success'>{msg}</Alert>}{error && <Alert severity='error'>{error}</Alert>}<Button type='submit' variant='contained' disabled={loading}>Create account</Button></Stack></CardContent></Card></AuthLayout>; }

function DashboardPage() { const { user } = useAuth(); const [stats, setStats] = React.useState<any>(null); React.useEffect(() => { fetchJson('/api/dashboard/stats').then(setStats).catch(() => {}); }, []); return <DashboardLayout><Stack spacing={2}><Typography variant='h4'>Welcome back, {user?.fullName || user?.email}</Typography><Typography>{new Date().toLocaleString()}</Typography><Stack direction='row' spacing={1}><Button component={RouteLink} to='/vat/business-details' variant='contained'>New VAT Return</Button><Button component={RouteLink} to='/tax/business-details' variant='contained'>New Corporate Tax</Button></Stack><Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Card><CardContent><Typography>Total VAT Records</Typography><Typography variant='h4'>{stats?.totalVatRecords ?? 0}</Typography></CardContent></Card><Card><CardContent><Typography>Total Corporate Tax Records</Typography><Typography variant='h4'>{stats?.totalCorporateTaxRecords ?? 0}</Typography></CardContent></Card></Stack></Stack></DashboardLayout>; }
function BusinessProfilePage(){return <DashboardLayout><Typography variant='h5'>Business Profile</Typography></DashboardLayout>}
function VatHistoryPage(){return <DashboardLayout><Typography variant='h5'>VAT History</Typography></DashboardLayout>}
function TaxHistoryPage(){return <DashboardLayout><Typography variant='h5'>Tax History</Typography></DashboardLayout>}
function RemindersPage(){return <DashboardLayout><Typography variant='h5'>Reminders</Typography></DashboardLayout>}
function ProfilePage(){return <DashboardLayout><Typography variant='h5'>Settings</Typography></DashboardLayout>}

function RoutedModules() { const { pathname, navigate } = usePathname(); const { user } = useAuth(); const { vat, setVat, ct, setCt } = useTaxAssistant(); const parts = pathname.split('/').filter(Boolean); const module = parts[0]; const step = parts[1] || ''; const guardVat = !vat.businessName || !vat.trn; const guardTax = !ct.companyName || !ct.taxRegistrationNumber || !ct.businessActivity;
  React.useEffect(() => { if (module === 'vat' && !step) navigate('/vat/business-details'); if (module === 'tax' && !step) navigate('/tax/business-details'); if (module === 'vat' && ['preview', 'export'].includes(step) && guardVat) navigate('/vat/business-details'); if (module === 'tax' && ['preview', 'export'].includes(step) && guardTax) navigate('/tax/business-details'); }, [pathname]);
  if (pathname === '/') return user ? <ProtectedRoute><DashboardPage /></ProtectedRoute> : <PublicLandingPage />;
  if (pathname === '/login') return <GuestRoute><LoginPage /></GuestRoute>;
  if (pathname === '/register') return <GuestRoute><RegisterPage /></GuestRoute>;
  if (pathname === '/dashboard') return <ProtectedRoute><DashboardPage /></ProtectedRoute>;
  if (pathname === '/dashboard/profile') return <ProtectedRoute><ProfilePage /></ProtectedRoute>;
  if (pathname === '/dashboard/business-profile') return <ProtectedRoute><BusinessProfilePage /></ProtectedRoute>;
  if (pathname === '/dashboard/vat-history') return <ProtectedRoute><VatHistoryPage /></ProtectedRoute>;
  if (pathname === '/dashboard/tax-history') return <ProtectedRoute><TaxHistoryPage /></ProtectedRoute>;
  if (pathname === '/dashboard/reminders') return <ProtectedRoute><RemindersPage /></ProtectedRoute>;
  if (module === 'vat') return <DashboardLayout><VatWizard data={vat} setData={setVat} forcedStep={mapStep[step as keyof typeof mapStep] || 1} navigateToStep={navigate} /></DashboardLayout>;
  if (module === 'tax') return <DashboardLayout><TaxModuleLayout moduleTitle='Corporate Tax Module' basePath='/tax' currentStep={step || 'business-details'} showModuleHeader={false}><CorporateTaxWizard data={ct} setData={setCt} forcedStep={mapTaxStep[step as keyof typeof mapTaxStep] || 1} /></TaxModuleLayout></DashboardLayout>;
  return <DashboardLayout><Alert severity='warning'>Page not found.</Alert></DashboardLayout>; }

export default function AppRoutes() { return <AuthProvider><TaxAssistantProvider><RoutedModules /></TaxAssistantProvider></AuthProvider>; }
