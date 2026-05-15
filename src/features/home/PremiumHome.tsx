import React from 'react';
import {
  Avatar,
  Box,
  Button,
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
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { Building2, FileSpreadsheet } from 'lucide-react';
import { RouteLink, usePathname } from '../../components/Router';
import { AppFooter } from '../layout/AppFooter';
import { useAuth } from '../../modules/auth/AuthContext';

const SHELL = {
  sidebarWidth: 260,
  radiusCard: '12px',
  radiusButton: '8px',
  colorPrimary: '#2563eb',
  colorBg: '#f6f8fb',
  colorBorder: '#e5eaf2',
};

const resourceItems = [
  { title: 'Documentation', description: 'User guides, manuals, and technical documentation', to: '/documentation', icon: <DescriptionIcon fontSize='small' /> },
  { title: 'Privacy Policy', description: 'Learn how we collect, use, and protect your data', to: '/privacy-policy', icon: <PolicyIcon fontSize='small' /> },
  { title: 'Terms & Conditions', description: 'Read our terms of service and legal agreements', to: '/terms-and-conditions', icon: <GavelIcon fontSize='small' /> },
];

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { pathname } = usePathname();
  const navItem = (label: string, to: string, icon?: React.ReactNode) => {
    const active = pathname === to || pathname.startsWith(`${to}/`) || (to === '/vat' && pathname.startsWith('/vat/')) || (to === '/tax' && pathname.startsWith('/tax/'));
    return <Button key={label} component={RouteLink} to={to} onClick={onClose} fullWidth sx={{ justifyContent: 'space-between', textTransform: 'none', color: '#0f172a', py: 1.25, px: 1.3, minHeight: 48, borderRadius: 3, fontSize: '0.875rem', fontWeight: 700, borderLeft: active ? '3px solid #2563eb' : '3px solid transparent', bgcolor: active ? '#eff6ff' : 'transparent', '&:hover': { bgcolor: active ? '#eff6ff' : '#f8fafc' } }}>
      <Stack direction='row' alignItems='center' spacing={1.2} sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ width: 22, height: 22, color: active ? '#1d4ed8' : '#0f172a', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</Box>
        <Typography sx={{ fontSize: '0.98rem', fontWeight: 700, lineHeight: 1.2, textAlign: 'left', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</Typography>
      </Stack>
      <ChevronRightRoundedIcon sx={{ fontSize: 18, color: '#475569', ml: 1 }} />
    </Button>;
  };

  return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff', borderRight: `1px solid ${SHELL.colorBorder}` }}>
    <Box sx={{ p: 2.2, borderBottom: `1px solid ${SHELL.colorBorder}` }}><Box component='img' src='/logo.png' alt='FTA VAT & Tax' sx={{ width: '100%', maxWidth: 180, height: 40, objectFit: 'contain' }} /></Box>
    <Box sx={{ p: 1.8, display: 'grid', gap: 0.8 }}>
      {navItem('Dashboard', '/', <GridViewRoundedIcon fontSize='small' />)}
      <Typography sx={{ px: 1.2, pt: 2, pb: 0.8, color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>TAX MODULES</Typography>
      {navItem('VAT Return', '/vat', <FileSpreadsheet size={18} />)}
      {navItem('Corporate Tax', '/tax', <Building2 size={18} />)}
      <Typography sx={{ px: 1.2, pt: 1.8, pb: 0.8, color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>MANAGEMENT</Typography>
      {navItem('VAT History', '/dashboard/vat-history')}
      {navItem('Tax History', '/dashboard/tax-history')}
      {navItem('Business Profile', '/dashboard/business-profile')}
      {navItem('Reminders', '/dashboard/reminders')}
      {navItem('Settings', '/dashboard/profile')}
      <Typography sx={{ px: 1.2, pt: 1.8, pb: 0.8, color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>RESOURCES</Typography>
      {resourceItems.map((item) => navItem(item.title, item.to, item.icon))}
    </Box>
    <Box sx={{ mt: 'auto', p: 1.8 }}><Box sx={{ border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.5, p: 1.6, bgcolor: '#f8fbff' }}><Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Need Help?</Typography><Typography sx={{ fontSize: '0.875rem', color: '#475569', mt: 0.8, mb: 1.4 }}>Our support team is here to help you with any questions.</Typography><Button fullWidth href='https://www.youtube.com/@uaetax' target='_blank' sx={{ minHeight: 44, border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.2, textTransform: 'none' }} startIcon={<HelpOutlineRoundedIcon fontSize='small' />}>Help Center</Button></Box></Box>
  </Box>;
}

function TopNavbar({ onMenuClick, mobile }: { onMenuClick: () => void; mobile: boolean }) {
  const { user, logout } = useAuth();
  return <Box sx={{ position: 'sticky', top: 0, zIndex: 20, borderBottom: `1px solid ${SHELL.colorBorder}`, bgcolor: 'rgba(255,255,255,.98)', backdropFilter: 'blur(5px)' }}><Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ minHeight: 72, px: { xs: 1.5, sm: 2.5 }, gap: 1.2 }}><Stack direction='row' alignItems='center' gap={1.2} sx={{ minWidth: 0, flex: 1 }}><IconButton onClick={onMenuClick} sx={{ width: 44, height: 44 }}><MenuIcon /></IconButton>{!mobile && <Stack direction='row' alignItems='center' sx={{ border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.8, px: 1.2, py: 0.8, width: 'min(460px,100%)', bgcolor: '#f8fafc' }}><SearchIcon sx={{ color: '#64748b', fontSize: 20 }} /><InputBase placeholder='Search modules, documents...' sx={{ ml: 1, fontSize: '0.95rem', flex: 1 }} /></Stack>}</Stack><Stack direction='row' alignItems='center' gap={1.4}><IconButton sx={{ width: 40, height: 40 }}><NotificationsNoneRoundedIcon /></IconButton><Box sx={{ display: { xs: 'none', sm: 'block' } }}><Typography sx={{ color: '#64748b', fontSize: '0.75rem' }}>Welcome back!</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.fullName || user?.email || 'Guest User'}</Typography></Box><Stack direction='row' spacing={1} alignItems='center'><Button component={RouteLink} to='/profile' variant='text' sx={{ textTransform: 'none' }}>Profile</Button><Button onClick={async()=>{await logout(); window.history.pushState({},'', '/login'); window.dispatchEvent(new PopStateEvent('popstate'));}} variant='outlined' size='small' sx={{ textTransform: 'none' }}>Logout</Button><Avatar sx={{ bgcolor: SHELL.colorPrimary, width: 36, height: 36, fontSize: '0.9rem' }}>{(user?.fullName?.[0] || user?.email?.[0] || 'G').toUpperCase()}</Avatar></Stack></Stack></Stack>{mobile && <Box sx={{ px: 1.8, pb: 1.4 }}><Stack direction='row' alignItems='center' sx={{ border: `1px solid ${SHELL.colorBorder}`, borderRadius: 1.6, px: 1.2, py: 0.8, bgcolor: '#f8fafc' }}><SearchIcon sx={{ color: '#64748b', fontSize: 20 }} /><InputBase placeholder='Search modules, documents...' sx={{ ml: 1, fontSize: '0.95rem', flex: 1 }} /></Stack></Box>}</Box>; }


function HomeContent() {
  return (
    <Box sx={{ bgcolor: '#fff', border: `1px solid ${SHELL.colorBorder}`, borderRadius: SHELL.radiusCard, p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.2rem' }, color: '#0f172a' }}>
          UAE VAT & Tax Assistant
        </Typography>
        <Typography sx={{ color: '#475569', maxWidth: 760 }}>
          A simple app to prepare VAT returns and estimate Corporate Tax with guided workflows.
        </Typography>

        <Box>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Features</Typography>
          <Box component='ul' sx={{ m: 0, pl: 2.5, color: '#334155' }}>
            <li>Guided VAT return workflow with summaries.</li>
            <li>Corporate Tax calculation and report preview.</li>
            <li>Export-ready reports for filing records.</li>
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
          <Button component={RouteLink} to='/vat/business-details' variant='contained' sx={{ textTransform: 'none', borderRadius: SHELL.radiusButton }}>
            Get Started
          </Button>
          <Button component={RouteLink} to='/login' variant='outlined' sx={{ textTransform: 'none', borderRadius: SHELL.radiusButton }}>
            Login
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export function AppShell({ children }: { children?: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);

  return <Box sx={{ bgcolor: SHELL.colorBg, minHeight: '100vh', overflowX: 'hidden' }}>
    {!isMobile && <Box sx={{ width: SHELL.sidebarWidth, position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 30 }}><Sidebar /></Box>}
    <Drawer open={open} onClose={() => setOpen(false)} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280 } }}><Sidebar mobile onClose={() => setOpen(false)} /></Drawer>
    <Box sx={{ ml: { md: `${SHELL.sidebarWidth}px` }, minWidth: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopNavbar onMenuClick={() => setOpen(true)} mobile={isMobile} />
      <Box sx={{ flex: 1, maxWidth: 1320, width: '100%', mx: 'auto', p: { xs: 1.5, sm: 2.5, md: 3 }, display: 'grid', gap: 2.2 }}>{children}</Box>
      <AppFooter />
    </Box>
  </Box>;
}

export function PremiumHome() { return <AppShell><HomeContent /></AppShell>; }
