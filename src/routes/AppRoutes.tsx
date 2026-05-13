import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { usePathname } from '../components/Router';
import { TaxAssistantProvider, useTaxAssistant } from '../modules/taxAssistant/TaxAssistantContext';
import { TaxModuleLayout } from '../modules/taxAssistant/TaxModuleLayout';
import { VatWizard } from '../features/tax/VatWizard';
import { CorporateTaxWizard } from '../features/tax/CorporateTaxWizard';
import { PremiumHome, AppShell } from '../features/home/PremiumHome';

const mapStep = { 'business-details': 1, input: 2, preview: 3, export: 4 };
const mapTaxStep = { 'business-details': 1, input: 3, preview: 5, export: 6 };

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
  if (module === 'vat') {
    return <AppShell><VatWizard data={vat} setData={setVat} forcedStep={mapStep[step] || 1} navigateToStep={navigate} /></AppShell>;
  }
  if (module === 'tax') {
    return <AppShell><TaxModuleLayout moduleTitle='Corporate Tax Module' basePath='/tax' currentStep={step || 'business-details'}><CorporateTaxWizard data={ct} setData={setCt} forcedStep={mapTaxStep[step] || 1} /></TaxModuleLayout></AppShell>;
  }
  return <AppShell><Alert severity='warning'>Page not found.</Alert></AppShell>;
}

export default function AppRoutes() {
  return <TaxAssistantProvider><RoutedModules /><Snackbar open={false} /></TaxAssistantProvider>;
}
