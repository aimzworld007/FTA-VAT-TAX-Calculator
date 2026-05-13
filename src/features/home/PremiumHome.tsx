import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  InputBase,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import DescriptionIcon from '@mui/icons-material/Description';
import PolicyIcon from '@mui/icons-material/Policy';
import GavelIcon from '@mui/icons-material/Gavel';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { RouteLink } from '../../components/Router';

const SHELL = {
  sidebarWidth: 260,
  radiusCard: '12px',
  radiusButton: '8px',
  colorPrimary: '#2563eb',
  colorBg: '#f6f8fb',
  colorBorder: '#e5eaf2',
};

const moduleItems = [
  { title: 'FTA VAT Return', description: 'Prepare VAT returns with guided period and transaction workflows.', image: '/FTA_VAT_RETRUN.png', to: '/vat/business-details' },
  { title: 'FTA Corporate Tax', description: 'Estimate corporate tax and organize annual filing data quickly.', image: '/FTA_CORPORATE_TAX.png', to: '/tax/business-details' },
];

const resourceItems = [
  { title: 'Documentation', description: 'User guides, manuals, and technical documentation', to: '/documentation', icon: <DescriptionIcon fontSize='small' /> },
  { title: 'Privacy Policy', description: 'Learn how we collect, use, and protect your data', to: '/privacy-policy', icon: <PolicyIcon fontSize='small' /> },
  { title: 'Terms & Conditions', description: 'Read our terms of service and legal agreements', to: '/terms', icon: <GavelIcon fontSize='small' /> },
];

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const navItem = (label: string, to: string, icon?: React.ReactNode, active?: boolean) => (
    <Button
      key={label}
      component={RouteLink}
      to={to}
      onClick={onClose}
      fullWidth
      startIcon={icon}
      endIcon={<ChevronRightRoundedIcon sx={{ fontSize: 17 }} />}
      sx={{
        justifyContent: 'space-between',
        textTransform: 'none',
        color: '#0f172a',
        py: 1.2,
        px: 1.2,
        minHeight: 44,
        borderRadius: 1.5,
        fontSize: '0.875rem',
        fontWeight: 600,
        borderLeft: active ? '3px solid #2563eb' : '3px solid transparent',
        bgcolor: active ? '#eff6ff' : 'transparent',
      }}
    >
      <span>{label}</span>
    </Button>
  );

  return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff', borderRight: `1px solid ${SHELL.colorBorder}` }}>
    <Box sx={{ p: 2.2, borderBottom: `1px solid ${SHELL.colorBorder}` }}><Box component='img' src='/logo.png' alt='FTA VAT & Tax' sx={{ width: '100%', maxWidth: 180, height: 40, objectFit: 'contain' }} /></Box>
    <Box sx={{ p: 1.8, display: 'grid', gap: 0.8 }}>
      {navItem('Dashboard', '/', <GridViewRoundedIcon fontSize='small' />, true)}
      <Typography sx={{ px: 1.2, pt: 2, pb: 0.8, color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>TAX MODULES</Typography>
      {navItem('FTA VAT Return', '/vat/business-details', <Box component='img' src='/FTA_VAT_RETRUN.png' alt='' sx={{ width: 18, height: 18, borderRadius: 0.6 }} />)}
      {navItem('FTA Corporate Tax', '/tax/business-details', <Box component='img' src='/FTA_CORPORATE_TAX.png' alt='' sx={{ width: 18, height: 18, borderRadius: 0.6 }} />)}
      <Typography sx={{ px: 1.2, pt: 1.8, pb: 0.8, color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>RESOURCES</Typography>
      {resourceItems.map((item) => navItem(item.title, item.to, item.icon))}
    </Box>
    <Box sx={{ mt: 'auto', p: 1.8 }}>
      <Box sx={{ border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.5, p: 1.6, bgcolor: '#f8fbff' }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Need Help?</Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#475569', mt: 0.8, mb: 1.4 }}>Our support team is here to help you with any questions.</Typography>
        <Button fullWidth href='https://www.youtube.com/@uaetax' target='_blank' sx={{ minHeight: 44, border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.2, textTransform: 'none' }} startIcon={<HelpOutlineRoundedIcon fontSize='small' />}>Help Center</Button>
      </Box>
    </Box>
  </Box>;
}

function TopNavbar({ onMenuClick, mobile }: { onMenuClick: () => void; mobile: boolean }) {
  return <Box sx={{ position: 'sticky', top: 0, zIndex: 20, borderBottom: `1px solid ${SHELL.colorBorder}`, bgcolor: 'rgba(255,255,255,.98)', backdropFilter: 'blur(5px)' }}>
    <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ minHeight: 72, px: { xs: 1.5, sm: 2.5 }, gap: 1.2 }}>
      <Stack direction='row' alignItems='center' gap={1.2} sx={{ minWidth: 0, flex: 1 }}>
        <IconButton onClick={onMenuClick} sx={{ width: 44, height: 44 }}><MenuIcon /></IconButton>
        {!mobile && <Stack direction='row' alignItems='center' sx={{ border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.8, px: 1.2, py: 0.8, width: 'min(460px,100%)', bgcolor: '#f8fafc' }}><SearchIcon sx={{ color: '#64748b', fontSize: 20 }} /><InputBase placeholder='Search modules, documents...' sx={{ ml: 1, fontSize: '0.95rem', flex: 1 }} /></Stack>}
      </Stack>
      {!mobile && <Stack direction='row' alignItems='center' gap={1}><Button href='https://tax.gov.ae/en/taxes/Vat/vat.topics.aspx' target='_blank' sx={{ textTransform: 'none', border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.4, minHeight: 40 }}>VAT Guide</Button><Button href='https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics.aspx' target='_blank' sx={{ textTransform: 'none', border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.4, minHeight: 40 }}>Corporate Tax Guide</Button><Button href='https://www.youtube.com/@uaetax' target='_blank' sx={{ textTransform: 'none', border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.4, minHeight: 40 }}>Help Center</Button></Stack>}
      <Stack direction='row' alignItems='center' gap={1.4}><IconButton sx={{ width: 40, height: 40 }}><NotificationsNoneRoundedIcon /></IconButton><Box sx={{ display: { xs: 'none', sm: 'block' } }}><Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>Welcome back!</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Admin User</Typography></Box><Avatar sx={{ bgcolor: SHELL.colorPrimary, width: 36, height: 36, fontSize: '0.9rem' }}>AD</Avatar></Stack>
    </Stack>
    {mobile && <Box sx={{ px: 1.8, pb: 1.4 }}><Stack direction='row' alignItems='center' sx={{ border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.6, px: 1.2, py: 0.8, bgcolor: '#f8fafc' }}><SearchIcon sx={{ color: '#64748b', fontSize: 20 }} /><InputBase placeholder='Search modules, documents...' sx={{ ml: 1, fontSize: '0.95rem', flex: 1 }} /></Stack></Box>}
  </Box>;
}

export function PremiumHome() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);

  return <Box sx={{ bgcolor: SHELL.colorBg, minHeight: '100vh', overflowX: 'hidden' }}>
    {!isMobile && <Box sx={{ width: SHELL.sidebarWidth, position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 30 }}><Sidebar /></Box>}
    <Drawer open={open} onClose={() => setOpen(false)} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280 } }}>
      <Sidebar mobile onClose={() => setOpen(false)} />
    </Drawer>

    <Box sx={{ ml: { md: `${SHELL.sidebarWidth}px` }, minWidth: 0 }}>
      <TopNavbar onMenuClick={() => setOpen(true)} mobile={isMobile} />
      <Box sx={{ maxWidth: 1320, mx: 'auto', p: { xs: 1.5, sm: 2.5, md: 3 }, display: 'grid', gap: 2.2 }}>
        <Box sx={{ bgcolor: '#fff', border: `1px solid ${SHELL.colorBorder}`, borderRadius: SHELL.radiusCard, p: { xs: 2, md: 3 }, minHeight: { md: 205 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' gap={2} sx={{ height: '100%' }}>
            <Box><Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '2rem' }}>Welcome to</Typography><Typography sx={{ color: '#0f1f49', fontWeight: 800, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.2 }}>UAE VAT & Tax Assistant</Typography><Typography sx={{ mt: 1.2, color: '#55627c', fontSize: '1.15rem' }}>Your all-in-one workspace for FTA compliance and tax management</Typography></Box>
            <Box sx={{ alignSelf: 'flex-end', width: { xs: '100%', md: 360 }, height: { xs: 90, md: 150 }, borderTop: '2px solid #d8e2f1', background: 'linear-gradient(180deg,#ffffff 0%,#f5f9ff 100%)', borderRadius: 1.5, position: 'relative', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', bottom: 0, left: 24, width: 48, height: 60, border: '2px solid #99b0d5', borderBottom: 0 }, '&::after': { content: '""', position: 'absolute', bottom: 0, left: 95, width: 24, height: 112, border: '2px solid #87a5d5', borderBottom: 0 } }} />
          </Stack>
        </Box>

        <Typography sx={{ fontWeight: 800, fontSize: '1.95rem', color: '#0f172a', px: 0.4 }}>Choose a tax module</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
          {moduleItems.map((item) => <Box key={item.title} component={RouteLink} to={item.to} sx={{ textDecoration: 'none', color: 'inherit', bgcolor: '#fff', border: `1px solid ${SHELL.colorBorder}`, borderRadius: SHELL.radiusCard, p: 2.3, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            <Stack direction='row' gap={1.6} alignItems='center'><Box sx={{ width: 64, height: 64, border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.2, p: 0.6, display: 'grid', placeItems: 'center' }}><Box component='img' src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /></Box><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 800, fontSize: '1.7rem' }}>{item.title}</Typography><Typography sx={{ color: '#58657e', mt: 0.4, fontSize: '1.02rem' }}>{item.description}</Typography></Box><Box sx={{ width: 44, height: 44, borderRadius: SHELL.radiusButton, bgcolor: SHELL.colorPrimary, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><ArrowForwardRoundedIcon fontSize='small' /></Box></Stack>
            <Stack direction='row' flexWrap='wrap' gap={1} sx={{ mt: 1.8, pt: 1.6, borderTop: `1px solid ${SHELL.colorBorder}` }}>{['Guided workflow', 'Live summaries', 'Export options'].map((chip) => <Chip key={chip} label={chip} sx={{ height: 32, borderRadius: 10, bgcolor: '#f1f5fb', '& .MuiChip-label': { px: 1.3, fontSize: '0.82rem' } }} />)}</Stack>
          </Box>)}
        </Box>

        <Typography sx={{ fontWeight: 800, fontSize: '1.95rem', color: '#0f172a', px: 0.4, mt: 0.8 }}>Support & Resources</Typography>
        <Box sx={{ bgcolor: '#fff', border: `1px solid ${SHELL.colorBorder}`, borderRadius: SHELL.radiusCard, overflow: 'hidden' }}>
          {resourceItems.map((item, index) => <Box key={item.title} component={RouteLink} to={item.to} sx={{ minHeight: 72, display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 1.4, sm: 2 }, py: 1.2, textDecoration: 'none', color: 'inherit', borderBottom: index !== resourceItems.length - 1 ? `1px solid ${SHELL.colorBorder}` : 'none', '&:hover': { bgcolor: '#f8fbff' } }}><Box sx={{ width: 34, height: 34, borderRadius: 1.2, bgcolor: '#eff6ff', color: SHELL.colorPrimary, display: 'grid', placeItems: 'center' }}>{item.icon}</Box><Box sx={{ flex: 1, minWidth: 0 }}><Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.title}</Typography><Typography sx={{ color: '#64748b', fontSize: '0.82rem' }}>{item.description}</Typography></Box><ChevronRightRoundedIcon sx={{ color: '#94a3b8' }} /></Box>)}
        </Box>
      </Box>
    </Box>
  </Box>;
}
