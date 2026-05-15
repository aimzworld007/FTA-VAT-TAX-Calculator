import React from 'react';
import { Box, Fade } from '@mui/material';
import { AppFooter } from '../layout/AppFooter';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <Box
        component='header'
        sx={{
          borderBottom: '1px solid #e2e8f0',
          bgcolor: 'rgba(255,255,255,.9)',
          backdropFilter: 'blur(6px)',
          px: { xs: 2, sm: 3 },
          py: 1.25,
        }}
      >
        <Box component='img' src='/logo.png' alt='FTA VAT & Tax' sx={{ width: 'auto', height: 36, objectFit: 'contain' }} />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          px: 2,
          py: { xs: 3, sm: 4 },
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <Fade in timeout={350}>
          <Box sx={{ width: '100%', maxWidth: 420 }}>{children}</Box>
        </Fade>
      </Box>

      <AppFooter />
    </Box>
  );
}
