import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { RouteLink } from '../../components/Router';

export function AppFooter() {
  return (
    <Box component='footer' sx={{ mt: 4, px: 2, pb: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='space-between' alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ maxWidth: 1200, mx: 'auto', py: 2 }}>
        <Stack direction='row' spacing={2} flexWrap='wrap'>
          <RouteLink to='/'>Home</RouteLink>
          <RouteLink to='/privacy-policy'>Privacy Policy</RouteLink>
          <RouteLink to='/terms'>Terms & Conditions</RouteLink>
          <RouteLink to='/documentation'>Documentation</RouteLink>
        </Stack>
        <Typography variant='body2' color='text.secondary'>Built with ❤️ in 🇦🇪 UAE by <a href='https://ecashbiz.com/landing' target='_blank' rel='noreferrer'>eCashbiz ERP</a></Typography>
      </Stack>
    </Box>
  );
}
