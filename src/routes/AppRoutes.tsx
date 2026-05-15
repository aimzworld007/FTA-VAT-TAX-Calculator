import React from 'react';
import { Alert, Box, Button, Card, CardContent, Snackbar, Stack, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { RouteLink, usePathname } from '../components/Router';
import { TaxAssistantProvider, useTaxAssistant } from '../modules/taxAssistant/TaxAssistantContext';
import { TaxModuleLayout } from '../modules/taxAssistant/TaxModuleLayout';
import { VatWizard } from '../features/tax/VatWizard';
import { CorporateTaxWizard } from '../features/tax/CorporateTaxWizard';
import { DashboardLayout } from '../features/layouts/DashboardLayout';
import { AuthLayout } from '../features/layouts/AuthLayout';
import { PublicLandingPage } from '../features/home/PublicLandingPage';
import { AuthProvider, useAuth } from '../modules/auth/AuthContext';

const mapStep = { 'business-details': 1, input: 2, preview: 3, export: 4 };
const mapTaxStep = { 'business-details': 1, input: 3, preview: 5, export: 6 };

const resourcePages = {
  '/documentation': {
    title: 'Documentation',
    intro: 'Access practical guidance for using VAT and Corporate Tax workflows effectively.',
    sections: [
      { heading: 'Getting Started', items: ['Open a module from the dashboard cards.', 'Complete Business Details before moving to preview/export.', 'Use progress chips at the top to navigate safely between steps.'] },
      { heading: 'VAT Return Module', items: ['Capture sales and purchase details in the input step.', 'Review box-wise summaries before export.', 'Export reports after validation for record-keeping.'] },
      { heading: 'Corporate Tax Module', items: ['Enter company profile and financial details.', 'Review tax summary and adjustments.', 'Export final outputs for compliance documentation.'] },
    ],
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    intro: 'We are committed to protecting business data used within this workspace.',
    sections: [
      { heading: 'Data Usage', paragraphs: ['Information entered in forms is used only to prepare tax computations and reports inside the assistant interface.'] },
      { heading: 'Security', paragraphs: ['The app is designed with secure workflow patterns and controlled export behavior for compliance operations.'] },
      { heading: 'User Responsibility', paragraphs: ['Users should verify the accuracy of submitted figures before filing and maintain confidential access to their devices.'] },
    ],
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions',
    intro: 'Please review these terms before relying on generated outputs for filing or advisory use.',
    sections: [
      { heading: 'Scope of Service', paragraphs: ['This assistant provides workflow tools for VAT and Corporate Tax preparation and export support.'] },
      { heading: 'Accuracy & Validation', paragraphs: ['Users are responsible for validating all entries and final submissions to the FTA.'] },
      { heading: 'Acceptable Use', items: ['Use the tool for lawful compliance activities only.', 'Do not misuse generated reports.', 'Retain your own filing records as required by law.'] },
    ],
  },
};

function ResourcePage({ page, onBack }: { page: (typeof resourcePages)['/documentation']; onBack: () => void }) {
  return (
    <DashboardLayout>
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)' }}>
        <CardContent sx={{ p: { xs: 2, md: 3.5 } }}>
          <Stack spacing={2}>
            <Box>
              <Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack} sx={{ textTransform: 'none', mb: 1.5 }}>
                Back to Dashboard
              </Button>
              <Typography variant='h4' sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.6rem', md: '2.1rem' } }}>{page.title}</Typography>
              <Typography sx={{ mt: 1, color: '#475569' }}>{page.intro}</Typography>
            </Box>
            <Stack spacing={1.5}>
              {page.sections.map((section) => (
                <Card key={section.heading} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>{section.heading}</Typography>
                    {section.paragraphs?.map((paragraph) => <Typography key={paragraph} sx={{ color: '#475569', mb: 0.8 }}>{paragraph}</Typography>)}
                    {section.items?.length ? (
                      <Box component='ul' sx={{ mb: 0, mt: 0.5, pl: 2.5, color: '#334155' }}>
                        {section.items.map((item) => <li key={item}><Typography component='span'>{item}</Typography></li>)}
                      </Box>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}


function LoginPage() {
  const { navigate } = usePathname();
  const { login, loading } = useAuth();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await login(email, password);
    if (result.ok) navigate('/');
    else setError(result.error || 'Login failed');
  };

  return <AuthLayout><Card sx={{ maxWidth: 420, mx: 'auto', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)' }}><CardContent sx={{ p: { xs: 2.3, sm: 2.8 } }}><Stack component='form' spacing={2} onSubmit={onSubmit}>
    <Typography variant='h5' sx={{ fontWeight: 800 }}>Login</Typography>
    <TextField label='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
    <TextField label='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
    {error ? <Alert severity='error'>{error}</Alert> : null}
    <Button type='submit' variant='contained' disabled={loading}>{loading ? 'Please wait...' : 'Login'}</Button>
    <Button onClick={() => navigate('/register')} variant='text'>Create account</Button>
  </Stack></CardContent></Card></AuthLayout>;
}

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = React.useState(user?.fullName || '');
  const [phone, setPhone] = React.useState(user?.phone || '');

  return <DashboardLayout><Card sx={{ maxWidth: 560 }}><CardContent><Stack spacing={2}>
    <Typography variant='h5' sx={{ fontWeight: 800 }}>Profile Management</Typography>
    <TextField label='Full Name' value={name} onChange={(e) => setName(e.target.value)} />
    <TextField label='Phone' value={phone} onChange={(e) => setPhone(e.target.value)} />
    <Button variant='contained' onClick={() => updateProfile({ fullName: name, phone })}>Save Profile</Button>
  </Stack></CardContent></Card></DashboardLayout>;
}


function RegisterPage() {
  const { navigate } = usePathname();
  const { register, loading } = useAuth();
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await register({ fullName, email, password, confirmPassword });
    if (result.ok) navigate('/');
    else setError(result.error || 'Registration failed');
  };

  return <AuthLayout><Card sx={{ maxWidth: 420, mx: 'auto', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)' }}><CardContent sx={{ p: { xs: 2.3, sm: 2.8 } }}><Stack component='form' spacing={2} onSubmit={onSubmit}>
    <Typography variant='h5' sx={{ fontWeight: 800 }}>Register</Typography>
    <TextField label='Full Name' value={fullName} onChange={(e) => setFullName(e.target.value)} required />
    <TextField label='Email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
    <TextField label='Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} helperText='Minimum 8 characters' required />
    <TextField label='Confirm Password' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
    {error ? <Alert severity='error'>{error}</Alert> : null}
    <Button type='submit' variant='contained' disabled={loading}>{loading ? 'Please wait...' : 'Create account'}</Button>
  </Stack></CardContent></Card></AuthLayout>;
}

function UserDashboardPage() {
  const { user } = useAuth();
  return <DashboardLayout><Stack spacing={2}><Typography variant='h4' sx={{ fontWeight: 800 }}>User Dashboard</Typography>
    <Typography sx={{ color: '#475569' }}>Welcome, {user?.fullName || user?.email}. Manage VAT, Corporate Tax and your profile from one place.</Typography>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
      <Button component={RouteLink} to='/vat/business-details' variant='contained'>Start VAT Return</Button>
      <Button component={RouteLink} to='/tax/business-details' variant='contained' color='secondary'>Start Corporate Tax</Button>
      <Button component={RouteLink} to='/profile' variant='outlined'>Manage Profile</Button>
    </Stack>
  </Stack></DashboardLayout>;
}

function RoutedModules() {
  const { pathname, navigate } = usePathname();
  const { vat, setVat, ct, setCt } = useTaxAssistant();
  const { user } = useAuth();
  const [msg, setMsg] = React.useState('');
  const parts = pathname.split('/').filter(Boolean);
  const module = parts[0];
  const step = parts[1] || '';

  const guardVat = !vat.businessName || !vat.trn;
  const guardTax = !ct.companyName || !ct.taxRegistrationNumber || !ct.businessActivity;

  React.useEffect(() => {
    if (pathname === '/terms') navigate('/terms-and-conditions');
    if (module === 'vat' && !step) navigate('/vat/business-details');
    if (module === 'tax' && !step) navigate('/tax/business-details');
    if (module === 'vat' && ['preview', 'export'].includes(step) && guardVat) {
      setMsg('Complete VAT business details first.');
      navigate('/vat/business-details');
    }
    if (module === 'tax' && ['preview', 'export'].includes(step) && guardTax) {
      setMsg('Complete Corporate Tax business details first.');
      navigate('/tax/business-details');
    }
  }, [pathname, module, step, guardVat, guardTax, navigate]);

  if (pathname === '/') return <PublicLandingPage />;
  if (pathname === '/login') return <LoginPage />;
  if (pathname === '/register') return <RegisterPage />;
  if (pathname === '/profile') return user ? <ProfilePage /> : <LoginPage />;
  if (pathname === '/admin') return ['SUPERADMIN'].includes(user?.role || '') ? <DashboardLayout><Typography variant='h4'>Admin Dashboard</Typography></DashboardLayout> : <DashboardLayout><Alert severity='error'>Admin access required.</Alert></DashboardLayout>;
  if (pathname === '/dashboard') return user ? <UserDashboardPage /> : <LoginPage />;
  if (pathname in resourcePages) return <ResourcePage page={resourcePages[pathname as keyof typeof resourcePages]} onBack={() => navigate('/')} />;
  if (module === 'vat') {
    return <DashboardLayout><VatWizard data={vat} setData={setVat} forcedStep={mapStep[step] || 1} navigateToStep={navigate} /></DashboardLayout>;
  }
  if (module === 'tax') {
    return <DashboardLayout><TaxModuleLayout moduleTitle='Corporate Tax Module' basePath='/tax' currentStep={step || 'business-details'} showModuleHeader={false}><CorporateTaxWizard data={ct} setData={setCt} forcedStep={mapTaxStep[step] || 1} /></TaxModuleLayout></DashboardLayout>;
  }
  return <DashboardLayout><Alert severity='warning'>Page not found.</Alert></DashboardLayout>;
}

export default function AppRoutes() {
  return <AuthProvider><TaxAssistantProvider><RoutedModules /><Snackbar open={false} /></TaxAssistantProvider></AuthProvider>;
}
