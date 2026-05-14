import React from 'react';
import { Alert, Box, Button, Card, CardContent, Snackbar, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { usePathname } from '../components/Router';
import { TaxAssistantProvider, useTaxAssistant } from '../modules/taxAssistant/TaxAssistantContext';
import { TaxModuleLayout } from '../modules/taxAssistant/TaxModuleLayout';
import { VatWizard } from '../features/tax/VatWizard';
import { CorporateTaxWizard } from '../features/tax/CorporateTaxWizard';
import { PremiumHome, AppShell } from '../features/home/PremiumHome';

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
    <AppShell>
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
    </AppShell>
  );
}

function RoutedModules() {
  const { pathname, navigate } = usePathname();
  const { vat, setVat, ct, setCt } = useTaxAssistant();
  const [msg, setMsg] = React.useState('');
  const parts = pathname.split('/').filter(Boolean);
  const module = parts[0];
  const step = parts[1] || '';

  const guardVat = !vat.businessName || !vat.trn;
  const guardTax = !ct.companyName || !ct.taxRegistrationNumber || !ct.businessActivity;

  React.useEffect(() => {
    if (pathname === '/dashboard') navigate('/');
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

  if (pathname === '/') return <PremiumHome />;
  if (pathname in resourcePages) return <ResourcePage page={resourcePages[pathname as keyof typeof resourcePages]} onBack={() => navigate('/')} />;
  if (module === 'vat') {
    return <AppShell><VatWizard data={vat} setData={setVat} forcedStep={mapStep[step] || 1} navigateToStep={navigate} /></AppShell>;
  }
  if (module === 'tax') {
    return <AppShell><TaxModuleLayout moduleTitle='Corporate Tax Module' basePath='/tax' currentStep={step || 'business-details'} showModuleHeader={false}><CorporateTaxWizard data={ct} setData={setCt} forcedStep={mapTaxStep[step] || 1} /></TaxModuleLayout></AppShell>;
  }
  return <AppShell><Alert severity='warning'>Page not found.</Alert></AppShell>;
}

export default function AppRoutes() {
  return <TaxAssistantProvider><RoutedModules /><Snackbar open={false} /></TaxAssistantProvider>;
}
