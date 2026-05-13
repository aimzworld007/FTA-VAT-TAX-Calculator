import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { usePathname } from '../components/Router';
import { TaxAssistantProvider, useTaxAssistant } from '../modules/taxAssistant/TaxAssistantContext';
import { TaxModuleLayout } from '../modules/taxAssistant/TaxModuleLayout';
import { VatWizard } from '../features/tax/VatWizard';
import { CorporateTaxWizard } from '../features/tax/CorporateTaxWizard';
import { AppFooter } from '../features/layout/AppFooter';
import { PremiumHome } from '../features/home/PremiumHome';

const mapStep = { 'business-details': 1, input: 2, preview: 4, export: 5 };
const mapTaxStep = { 'business-details': 1, input: 3, preview: 5, export: 6 };

function Home() { return <PremiumHome />; }

function RoutedModules(){ const {pathname, navigate}=usePathname(); const {vat,setVat,ct,setCt}=useTaxAssistant(); const [msg,setMsg]=React.useState(''); const parts=pathname.split('/').filter(Boolean); const module=parts[0]; const step=parts[1]||'';
const guardVat = !vat.businessName || !vat.trn;
const guardTax = !ct.companyName || !ct.taxRegistrationNumber || !ct.businessActivity;
React.useEffect(()=>{ if(module==='vat' && ['preview','export'].includes(step) && guardVat){ setMsg('Complete VAT business details first.'); navigate('/vat/business-details'); }
if(module==='tax' && ['preview','export'].includes(step) && guardTax){ setMsg('Complete Corporate Tax business details first.'); navigate('/tax/business-details'); }
},[module,step,guardVat,guardTax,navigate]);
if(pathname==='/' ) return <Home/>;
if(module==='vat') return <TaxModuleLayout moduleTitle='VAT Module' basePath='/vat' currentStep={step||'business-details'}><VatWizard data={vat} setData={setVat} forcedStep={mapStep[step] || 1} /></TaxModuleLayout>;
if(module==='tax') return <TaxModuleLayout moduleTitle='Corporate Tax Module' basePath='/tax' currentStep={step||'business-details'}><CorporateTaxWizard data={ct} setData={setCt} forcedStep={mapTaxStep[step] || 1} /></TaxModuleLayout>;
return <Alert severity='warning'>Page not found.</Alert>;
}

export default function AppRoutes(){ return <TaxAssistantProvider><RoutedModules/><Snackbar open={false}/><AppFooter/></TaxAssistantProvider>; }
