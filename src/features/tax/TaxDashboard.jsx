import React from 'react';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Toolbar,
  Typography,
  Button,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DescriptionIcon from '@mui/icons-material/Description';
import PolicyIcon from '@mui/icons-material/Policy';
import GavelIcon from '@mui/icons-material/Gavel';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { VatWizard } from './VatWizard';
import { CorporateTaxWizard } from './CorporateTaxWizard';
import { draftStorage } from './lib/localDraftStorage';
import { buildMonthlyEntries, calculateVat } from './lib/vatCalculator';
import { calculateCorporateTax } from './lib/corporateTaxCalculator';
import { money, TaxSummaryCard, WorkspaceHeader } from './components/common.jsx';
import { TaxModuleCard } from './components/TaxModuleCard';
import { InstallAppPrompt } from '../../components/InstallAppPrompt';
import { formatVatPeriodLabel, inferSelectionFromDates, getPeriodFromSelection } from './lib/vatPeriod';
import { VAT_PRICING_MODES, normalizeVatPricingMode } from './lib/vatPricing';

const currentYear = new Date().getFullYear();
const workspaceSettingsDefault = { vatPricingMode: VAT_PRICING_MODES.EXCLUSIVE };
const vatDefault = { businessName: '', trn: '', filingFrequency: 'Quarterly', filingYear: currentYear, filingMonth: 'January', filingQuarter: 'Q1', filingStartMonth: 'January', taxPeriodStart: '', taxPeriodEnd: '', standardRatedSales: 0, zeroRatedSales: 0, exemptSales: 0, standardRatedPurchases: 0, recoverableInputVat: 0, nonRecoverableVat: 0, previousAdjustment: 0, badDebtRelief: 0, adjustmentNotes: '', monthlyEntries: [], vatPricingMode: workspaceSettingsDefault.vatPricingMode };
const ctDefault = { companyName: '', taxRegistrationNumber: '', financialYearStart: '', financialYearEnd: '', businessActivity: '', revenue: 0, otherIncome: 0, exemptIncome: 0, directExpenses: 0, adminExpenses: 0, nonDeductibleExpenses: 0, accountingProfit: 0, addBackAdjustments: 0, deductibleAdjustments: 0 };

const navLinks = [
  { label: 'FTA Login', href: 'https://eservices.tax.gov.ae/#/Logon', icon: <LoginIcon fontSize='small' /> },
  { label: 'VAT Guide', href: 'https://tax.gov.ae/en/taxes/Vat/vat.topics.aspx', icon: <ReceiptLongIcon fontSize='small' /> },
  { label: 'Corporate Tax', href: 'https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx', icon: <AccountBalanceIcon fontSize='small' /> },
  { label: 'Help Center', href: 'https://www.youtube.com/@uaetax', icon: <PlayCircleIcon fontSize='small' /> },
];
const drawerLinks = [...navLinks, { label: 'Documentation', href: '/documentation', icon: <DescriptionIcon fontSize='small' /> }, { label: 'Privacy Policy', href: '/privacy-policy', icon: <PolicyIcon fontSize='small' /> }, { label: 'Terms & Conditions', href: '/terms', icon: <GavelIcon fontSize='small' /> }, { label: 'Support', href: 'https://ecashbiz.com/landing', icon: <SupportAgentIcon fontSize='small' /> }];

const getVatStatus = (n) => n > 0 ? ['VAT Payable', 'error', money(n)] : n < 0 ? ['VAT Refundable', 'success', money(Math.abs(n))] : ['VAT Payable / Refundable', 'primary', money(0)];
const normalizeVatDraft = (input, workspaceSettings) => { const merged = { ...vatDefault, ...input, vatPricingMode: normalizeVatPricingMode(input?.vatPricingMode || workspaceSettings.vatPricingMode) }; const selection = inferSelectionFromDates(merged); const period = getPeriodFromSelection(selection); const next = { ...merged, ...selection, ...period }; next.monthlyEntries = buildMonthlyEntries(next); return next; };

function Header({ onOpenDrawer }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  return <AppBar position='sticky' color='inherit' elevation={0} sx={{ borderBottom: '1px solid #dbe3ef', backgroundColor: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(8px)' }}><Toolbar sx={{ justifyContent: 'space-between', gap: 1.5, py: 1 }}><Stack direction='row' spacing={1.25} alignItems='center'><IconButton sx={{ display: { lg: 'none' } }} onClick={onOpenDrawer}><MenuIcon /></IconButton><Box component='img' src='/logo.png' alt='logo' sx={{ width: 38, height: 38, borderRadius: '50%' }} /><Typography variant='h6' sx={{ fontSize: { xs: '1rem', md: '1.16rem' }, fontWeight: 800 }}>FTA VAT & Tax Filing Assistant</Typography></Stack>
    {isDesktop && <Stack direction='row' spacing={1} alignItems='center'>{navLinks.map((l) => <Button key={l.label} href={l.href} target='_blank' variant='outlined' startIcon={l.icon} size='small' sx={{ borderRadius: 3, textTransform: 'none', minHeight: 36 }}>{l.label}</Button>)}<Button variant='outlined' startIcon={<FolderOpenIcon fontSize='small' />} size='small' sx={{ borderRadius: 3, textTransform: 'none' }}>Workspace</Button><IconButton size='small'><NotificationsNoneRoundedIcon fontSize='small' /></IconButton><IconButton size='small'><AccountCircleOutlinedIcon fontSize='small' /></IconButton></Stack>}
  </Toolbar></AppBar>;
}

function LiveSummary({ mode, vatData, vatCalc, ctCalc }) { if (mode === 'corporateTax') return <Card><CardContent><Typography variant='h6' sx={{ mb: 2 }}>Corporate Tax Live Summary</Typography><Grid container spacing={2}><Grid size={{ xs: 12, md: 3 }}><TaxSummaryCard label='Corporate Tax Estimate' value={money(ctCalc.taxPayable)} /></Grid><Grid size={{ xs: 12, md: 3 }}><TaxSummaryCard label='Taxable Income' value={money(ctCalc.taxableIncome)} /></Grid><Grid size={{ xs: 12, md: 3 }}><TaxSummaryCard label='Profit Before Tax' value={money(ctCalc.profitBeforeTax)} /></Grid><Grid size={{ xs: 12, md: 3 }}><TaxSummaryCard label='Selected Tax Period' value={formatVatPeriodLabel(vatData)} /></Grid></Grid></CardContent></Card>; const [label, color, amt] = getVatStatus(vatCalc.netVat); return <Card><CardContent><Typography variant='h6' sx={{ mb: 2 }}>VAT Live Summary</Typography><Grid container spacing={2}><Grid size={{ xs: 12, md: 4 }}><TaxSummaryCard label={label} value={amt} /><Chip label={label.includes('Refundable') ? 'REFUNDABLE' : label.includes('Payable') ? 'PAYABLE' : 'BALANCED'} color={color} sx={{ mt: 1 }} /></Grid><Grid size={{ xs: 12, md: 4 }}><TaxSummaryCard label='VAT Taxable Sales' value={money(vatCalc.salesBreakdown.net)} /></Grid><Grid size={{ xs: 12, md: 4 }}><TaxSummaryCard label='Selected VAT Period' value={formatVatPeriodLabel(vatData)} /></Grid></Grid></CardContent></Card>; }

export function TaxDashboard() {
  const [m, setM] = React.useState('home');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [ws] = React.useState(() => ({ ...workspaceSettingsDefault, ...draftStorage.load('workspaceSettings', workspaceSettingsDefault), vatPricingMode: normalizeVatPricingMode(draftStorage.load('workspaceSettings', workspaceSettingsDefault).vatPricingMode) }));
  const [vat, setVat] = React.useState(() => normalizeVatDraft(draftStorage.load('vatDraft', vatDefault), ws));
  const [ct, setCt] = React.useState(() => draftStorage.load('ctDraft', ctDefault));
  const [vp, setVp] = React.useState(20); const [cp, setCp] = React.useState(17);
  const v = calculateVat(vat), c = calculateCorporateTax(ct);
  return <Box sx={{ pb: { xs: 8, md: 0 } }}><Header onOpenDrawer={() => setDrawerOpen(true)} />
    <Drawer anchor='left' open={drawerOpen} onClose={() => setDrawerOpen(false)}><Box sx={{ width: 300, py: 1 }}><List>{drawerLinks.map((l) => <ListItemButton key={l.label} component='a' href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined}><ListItemIcon>{l.icon}</ListItemIcon><ListItemText primary={l.label} /></ListItemButton>)}</List></Box></Drawer>
    <Container maxWidth={false} sx={{ maxWidth: 1400, py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2.5, md: 3 } }}>
      {m === 'home' && <Stack spacing={2.2}><Card sx={{ borderRadius: 4, border: '1px solid #dbe3ef', boxShadow: '0 10px 28px rgba(15, 23, 42, .08)' }}><CardContent><Typography component='h1' variant='h4' sx={{ fontSize: { xs: '1.35rem', md: '1.75rem' }, fontWeight: 800, mb: 0.8 }}>Welcome</Typography><Typography variant='body1' color='text.secondary'>UAE tax workspace for VAT Return and Corporate Tax preparation. Select a module to continue.</Typography></CardContent></Card><InstallAppPrompt /><Card sx={{ borderRadius: 4, border: '1px solid #dbe3ef', boxShadow: '0 10px 28px rgba(15, 23, 42, .08)' }}><CardContent><Typography component='h2' variant='h5' sx={{ mb: 1 }}>Choose a tax module</Typography><Typography color='text.secondary' sx={{ mb: 2 }}>Launch a guided workspace with saved drafts, live summaries, and export options.</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))' }, gap: 2.2, maxWidth: '100%' }}><TaxModuleCard title='FTA VAT Return' subtitle='Prepare VAT returns with guided period and transaction workflows.' image='/FTA_VAT_RETRUN.png' route='vat' accentColor='border-sky-100 hover:border-sky-300' onSelect={setM} /><TaxModuleCard title='FTA Corporate Tax' subtitle='Estimate corporate tax and organize annual filing data quickly.' image='/FTA_CORPORATE_TAX.png' route='corporateTax' accentColor='border-emerald-100 hover:border-emerald-300' onSelect={setM} /></Box></CardContent></Card><Card sx={{ borderRadius: 4, border: '1px solid #dbe3ef', background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)' }}><CardContent><Typography component='h2' variant='h6' sx={{ mb: 1 }}>Support & Resources</Typography><Typography variant='body2' color='text.secondary'>Official links for filing support, documentation, and compliance references.</Typography><Stack direction='row' useFlexGap flexWrap='wrap' spacing={1} sx={{ mt: 1.2 }}>{drawerLinks.map((link) => <Button key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} variant='outlined' size='small' startIcon={link.icon} sx={{ borderRadius: 999, textTransform: 'none' }}>{link.label}</Button>)}</Stack></CardContent></Card></Stack>}
      {m === 'vat' && <Stack spacing={2.2}><WorkspaceHeader title='VAT Return Workspace' progress={vp} onBack={() => setM('home')} /><LiveSummary mode='vat' vatData={vat} vatCalc={v} ctCalc={c} /><VatWizard data={vat} setData={setVat} onProgressChange={setVp} onSave={() => draftStorage.save('vatDraft', vat)} onReset={() => { if (confirm('Reset VAT draft?')) { const next = normalizeVatDraft(vatDefault, ws); setVat(next); draftStorage.clear('vatDraft'); } }} /></Stack>}
      {m === 'corporateTax' && <Stack spacing={2.2}><WorkspaceHeader title='Corporate Tax Workspace' progress={cp} onBack={() => setM('home')} /><LiveSummary mode='corporateTax' vatData={vat} vatCalc={v} ctCalc={c} /><CorporateTaxWizard data={ct} setData={setCt} onProgressChange={setCp} onSave={() => draftStorage.save('ctDraft', ct)} onReset={() => { if (confirm('Reset Corporate Tax draft?')) { setCt(ctDefault); draftStorage.clear('ctDraft'); } }} /></Stack>}
    </Container>
    <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #dbe3ef', background: '#fff', zIndex: 1200 }}>
      <BottomNavigation showLabels value={m} onChange={(_, value) => { if (value === 'menu') { setDrawerOpen(true); return; } if (value === 'help') { setM('home'); window.open('https://www.youtube.com/@uaetax', '_blank'); return; } setM(value); }}>
        <BottomNavigationAction label='Home' value='home' icon={<HomeRoundedIcon />} />
        <BottomNavigationAction label='VAT' value='vat' icon={<ReceiptLongIcon />} />
        <BottomNavigationAction label='Tax' value='corporateTax' icon={<AccountBalanceIcon />} />
        <BottomNavigationAction label='Help' value='help' icon={<HelpOutlineIcon />} />
        <BottomNavigationAction label='Menu' value='menu' icon={<MoreHorizIcon />} />
      </BottomNavigation>
    </Box>
  </Box>;
}
