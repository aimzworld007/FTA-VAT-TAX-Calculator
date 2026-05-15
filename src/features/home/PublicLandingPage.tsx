import React from 'react';
import { AppBar, Box, Button, Card, CardContent, Container, Grid, Stack, Toolbar, Typography } from '@mui/material';

const kpis = ['VAT Return Calculator', 'Corporate Tax Estimator', 'Saved Filing Records', 'Filing Reminders'];

const features = [
  {
    title: 'VAT Return Wizard',
    description: 'Capture sales, purchases, and expenses with a clear payable or refundable summary.',
  },
  {
    title: 'Corporate Tax Wizard',
    description: 'Enter revenue and expenses to calculate taxable profit and estimate 9% corporate tax.',
  },
  {
    title: 'Secure Account',
    description: 'Use your email and password to access your saved business profile securely.',
  },
  {
    title: 'Filing Records',
    description: 'Store VAT and Corporate Tax reports by filing period for quick access.',
  },
  {
    title: 'Reminder System',
    description: 'Track upcoming VAT and Corporate Tax filing dates in one dashboard.',
  },
  {
    title: 'PDF & Print Export',
    description: 'Generate professional reports ready for review, printing, and record keeping.',
  },
];

const steps = [
  'Register account',
  'Add business profile',
  'Prepare VAT or Corporate Tax',
  'Save record and export PDF',
  'Track next filing reminder',
];

function isLoggedIn() {
  return Boolean(localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('accessToken'));
}

export function PublicLandingPage() {
  const [startedLink, setStartedLink] = React.useState('/register');

  React.useEffect(() => {
    document.title = 'UAE VAT & Corporate Tax Filing Assistant | VAT & Corporate Tax Dashboard';

    const metaName = 'description';
    const content = 'Calculate UAE VAT, estimate Corporate Tax, save filing records, and track upcoming tax deadlines in one secure assistant.';
    let tag = document.querySelector(`meta[name="${metaName}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute('name', metaName);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);

    setStartedLink(isLoggedIn() ? '/dashboard' : '/register');
  }, []);

  const navLinkStyle = { color: '#334155', textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem' } as const;

  return (
    <Box sx={{ bgcolor: '#f8fbff', minHeight: '100vh' }}>
      <AppBar elevation={0} position='sticky' sx={{ bgcolor: 'rgba(248,251,255,0.95)', borderBottom: '1px solid #e2e8f0', backdropFilter: 'blur(8px)' }}>
        <Container maxWidth='lg'>
          <Toolbar disableGutters sx={{ minHeight: 70, gap: 2 }}>
            <Typography variant='h6' sx={{ color: '#0f172a', fontWeight: 800, fontSize: '1.03rem', flexGrow: 1 }}>
              UAE VAT & Tax Filing Assistant
            </Typography>
            <Stack direction='row' spacing={2.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <a href='#features' style={navLinkStyle}>Features</a>
              <a href='/vat/business-details' style={navLinkStyle}>VAT Calculator</a>
              <a href='/tax/business-details' style={navLinkStyle}>Corporate Tax</a>
              <a href='/dashboard' style={navLinkStyle}>Records</a>
              <a href='/login' style={navLinkStyle}>Login</a>
            </Stack>
            <Button href={startedLink} variant='contained' sx={{ textTransform: 'none', borderRadius: 2, px: 2.2, bgcolor: '#2563eb' }}>Get Started</Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth='lg' sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={5}>
          <Box>
            <Stack spacing={2} sx={{ maxWidth: 820 }}>
              <Typography variant='h2' sx={{ color: '#0f172a', fontSize: { xs: '2rem', md: '2.9rem' }, fontWeight: 800, lineHeight: 1.12 }}>
                UAE VAT & Corporate Tax Filing Made Simple
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: { xs: '1rem', md: '1.08rem' } }}>
                Calculate VAT, estimate Corporate Tax, save filing records, and track upcoming tax deadlines from one secure dashboard.
              </Typography>
              <Stack direction='row' spacing={1.3}>
                <Button href='/register' variant='contained' sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}>Get Started</Button>
                <Button href='/login' variant='outlined' sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#bfdbfe', color: '#1e40af' }}>Login</Button>
              </Stack>
            </Stack>
          </Box>

          <Grid container spacing={1.5}>
            {kpis.map((kpi) => (
              <Grid key={kpi} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card elevation={0} sx={{ border: '1px solid #dbeafe', borderRadius: 2.5, bgcolor: '#ffffff' }}>
                  <CardContent sx={{ p: 2 }}><Typography sx={{ color: '#1e3a8a', fontWeight: 700, fontSize: '0.96rem' }}>{kpi}</Typography></CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box id='features'>
            <Typography variant='h4' sx={{ fontWeight: 800, color: '#0f172a', mb: 2.2, fontSize: { xs: '1.55rem', md: '2rem' } }}>Features</Typography>
            <Grid container spacing={1.6}>
              {features.map((feature) => (
                <Grid key={feature.title} size={{ xs: 12, md: 6 }}>
                  <Card elevation={0} sx={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: 2.5, bgcolor: '#fff' }}>
                    <CardContent sx={{ p: 2.2 }}>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a', mb: 0.8 }}>{feature.title}</Typography>
                      <Typography sx={{ color: '#475569', fontSize: '0.95rem' }}>{feature.description}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box>
            <Typography variant='h4' sx={{ fontWeight: 800, color: '#0f172a', mb: 1.8, fontSize: { xs: '1.55rem', md: '2rem' } }}>How it works</Typography>
            <Grid container spacing={1.4}>
              {steps.map((step, index) => (
                <Grid key={step} size={{ xs: 12, md: 6 }}>
                  <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography sx={{ fontWeight: 700, color: '#1d4ed8', mb: 0.6 }}>Step {index + 1}</Typography>
                      <Typography sx={{ color: '#334155' }}>{step}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Card elevation={0} sx={{ border: '1px solid #bfdbfe', borderRadius: 2.5, bgcolor: '#eff6ff' }}>
            <CardContent sx={{ p: { xs: 2.2, md: 3 }, textAlign: 'center' }}>
              <Typography variant='h5' sx={{ color: '#0f172a', fontWeight: 800, mb: 1.5 }}>Start preparing your UAE tax records today</Typography>
              <Stack direction='row' justifyContent='center' spacing={1.3}>
                <Button href='/register' variant='contained' sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}>Create Free Account</Button>
                <Button href='/login' variant='outlined' sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#93c5fd', color: '#1e40af' }}>Login</Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>

      <Box component='footer' sx={{ borderTop: '1px solid #e2e8f0', py: 2.2, bgcolor: '#fff' }}>
        <Container maxWidth='lg'>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.2}>
            <Typography sx={{ color: '#64748b', fontSize: '0.88rem' }}>© 2026 UAE VAT & Tax Filing Assistant</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '0.88rem' }}>Powered by eCashbiz ERP</Typography>
            <Stack direction='row' spacing={2.2}>
              <a href='/privacy-policy' style={navLinkStyle}>Privacy Policy</a>
              <a href='/terms-and-conditions' style={navLinkStyle}>Terms</a>
              <a href='/documentation' style={navLinkStyle}>Documentation</a>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
