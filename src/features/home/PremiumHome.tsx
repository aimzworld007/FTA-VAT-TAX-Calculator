import React from 'react';
import { AppBar, Box, Button, Card, CardActionArea, CardContent, Chip, Container, Grid, IconButton, Stack, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import LoginIcon from '@mui/icons-material/Login';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DescriptionIcon from '@mui/icons-material/Description';
import PolicyIcon from '@mui/icons-material/Policy';
import GavelIcon from '@mui/icons-material/Gavel';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { RouteLink } from '../../components/Router';

const navLinks = [
  { label: 'FTA Login', href: 'https://eservices.tax.gov.ae/#/Logon', icon: <LoginIcon fontSize='small' /> },
  { label: 'VAT Guide', href: 'https://tax.gov.ae/en/taxes/Vat/vat.topics.aspx', icon: <ReceiptLongIcon fontSize='small' /> },
  { label: 'Corporate Tax', href: 'https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx', icon: <AccountBalanceIcon fontSize='small' /> },
  { label: 'Help Center', href: 'https://www.youtube.com/@uaetax', icon: <SupportAgentIcon fontSize='small' /> },
];

const chips = ['Guided workflow', 'Live summaries', 'Export options'];

function Header() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  return <AppBar position='sticky' color='inherit' elevation={0} sx={{ borderBottom: '1px solid #E5EAF2', backgroundColor: 'rgba(255,255,255,0.98)' }}><Toolbar sx={{ minHeight: 58, px: { xs: 1, sm: 2 }, justifyContent: 'space-between' }}><Stack direction='row' spacing={1} alignItems='center'><IconButton><MenuIcon /></IconButton><Box component='img' src='/logo.png' alt='logo' sx={{ width: { xs: 138, sm: 185 }, height: 34, objectFit: 'contain' }} /></Stack><IconButton size='small'><NotificationsNoneRoundedIcon fontSize='small' /></IconButton>{isDesktop && <Stack direction='row' spacing={1} alignItems='center'>{navLinks.map((l) => <Button key={l.label} href={l.href} target='_blank' variant='outlined' startIcon={l.icon} size='small' sx={{ borderRadius: 3, textTransform: 'none' }}>{l.label}</Button>)}<Button variant='outlined' startIcon={<FolderOpenIcon fontSize='small' />} size='small' sx={{ borderRadius: 3, textTransform: 'none' }}>Workspace</Button></Stack>}</Toolbar></AppBar>;
}

function Hero() { return <Card sx={{ borderRadius: 6, background: '#f1f5f9', border: '1px solid #E5EAF2', boxShadow: 'none' }}><CardContent sx={{ p: { xs: 2.2, md: 3 } }}><Typography variant='body2' sx={{ color: '#475569', fontWeight: 600, mb: 0.6 }}>Welcome back!</Typography><Typography component='h1' sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.8rem', sm: '2.1rem' }, mb: 2 }}>UAE VAT & Tax Assistant</Typography><Card sx={{ borderRadius: 4, border: '1px solid #dbe4ee', boxShadow: 'none' }}><CardContent sx={{ p: 1.8 }}><Stack direction='row' spacing={1.2} alignItems='center'><Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center' }}><TaskAltRoundedIcon fontSize='small' /></Box><Typography sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>Your all-in-one workspace for FTA compliance</Typography></Stack></CardContent></Card></CardContent></Card>; }

function ModuleCards() {
  const cardSx = { borderRadius: 6, border: '1px solid #E5EAF2', boxShadow: '0 8px 24px rgba(15,23,42,0.06)', transition: 'transform .2s ease, box-shadow .2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 14px 30px rgba(15,23,42,0.12)' } };
  return <Card sx={{ borderRadius: 6, border: '1px solid #E5EAF2', boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}><CardContent sx={{ p: { xs: 2, md: 2.5 } }}><Typography component='h2' sx={{ fontWeight: 800, fontSize: { xs: '1.35rem', sm: '1.6rem' }, mb: 2 }}>Choose a tax module</Typography><Grid container spacing={2}>{[{ title: 'FTA VAT Return', desc: 'Prepare VAT returns with guided period and transaction workflows.', image: '/FTA_VAT_RETRUN.png', to: '/vat/business-details' }, { title: 'FTA Corporate Tax', desc: 'Estimate corporate tax and organize annual filing data quickly.', image: '/FTA_CORPORATE_TAX.png', to: '/tax/business-details' }].map((item) => <Grid key={item.title} size={{ xs: 12, md: 6 }}><Card sx={cardSx}><CardActionArea component={RouteLink} to={item.to}><CardContent sx={{ p: 2.2 }}><Stack direction='row' spacing={1.4}><Box sx={{ width: 68, height: 68, borderRadius: 3, border: '1px solid #E5EAF2', display: 'grid', placeItems: 'center', p: 1 }}><img src={item.image} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></Box><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 800, color: '#0f172a' }}>{item.title}</Typography><Typography variant='body2' sx={{ color: '#64748b', mt: .5 }}>{item.desc}</Typography></Box><IconButton sx={{ bgcolor: '#2563eb', color: '#fff', width: 42, height: 42 }}><ArrowForwardRoundedIcon fontSize='small' /></IconButton></Stack><Stack direction='row' flexWrap='wrap' gap={0.8} sx={{ mt: 1.5 }}>{chips.map((c) => <Chip key={c} label={c} size='small' sx={{ bgcolor: '#F1F5F9', borderRadius: 2 }} />)}</Stack></CardContent></CardActionArea></Card></Grid>)}</Grid></CardContent></Card>;
}

function SupportSection() { const items = [{ label: 'Documentation', href: '/documentation', icon: <DescriptionIcon fontSize='small' /> }, { label: 'Privacy Policy', href: '/privacy-policy', icon: <PolicyIcon fontSize='small' /> }, { label: 'Terms & Conditions', href: '/terms', icon: <GavelIcon fontSize='small' /> }]; return <Card sx={{ borderRadius: 6, border: '1px solid #E5EAF2', boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}><CardContent sx={{ p: { xs: 2, md: 2.5 } }}><Typography variant='h6' sx={{ mb: 1.2 }}>Support & Resources</Typography><Stack spacing={1.1}>{items.map((item) => <Card key={item.label} component='a' href={item.href} sx={{ textDecoration: 'none', border: '1px solid #e2e8f0', borderRadius: 3, boxShadow: 'none', transition: 'all .2s ease', '&:hover': { borderColor: '#bfdbfe', bgcolor: '#f8fbff' } }}><CardContent sx={{ p: 1.4, '&:last-child': { pb: 1.4 } }}><Stack direction='row' alignItems='center'><Box sx={{ color: '#2563eb', mr: 1 }}>{item.icon}</Box><Typography sx={{ flex: 1, color: '#0f172a', fontWeight: 600 }}>{item.label}</Typography><ChevronRightRoundedIcon sx={{ color: '#64748b' }} /></Stack></CardContent></Card>)}</Stack></CardContent></Card>; }

function Footer() { return <Box sx={{ textAlign: 'center', pt: 1, pb: 1.5 }}><Typography sx={{ fontSize: '0.76rem', color: '#64748b' }}>© 2026 FTA VAT & Tax Filing Assistant</Typography><Typography sx={{ fontSize: '0.74rem', color: '#94a3b8' }}>Powered by eCashbiz ERP</Typography></Box>; }

export function PremiumHome() { return <Box sx={{ minHeight: '100vh', background: '#F6F8FB' }}><Header /><Container maxWidth={false} sx={{ maxWidth: 980, py: { xs: 2, md: 3 }, px: { xs: 2, sm: 3 } }}><Stack spacing={2}><Hero /><ModuleCards /><SupportSection /><Footer /></Stack></Container></Box>; }
