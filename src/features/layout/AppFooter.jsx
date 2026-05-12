import React from 'react';
import { Box, Typography } from '@mui/material';

export function AppFooter() {
  return (
    <Box component='footer' sx={{ mt: 1.5, px: 2, pb: { xs: 10, md: 3 } }}>
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          py: 1.5,
          px: 2,
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, opacity: 0.84, lineHeight: 1.65 }}>
          © 2026 FTA VAT & Tax Filing Assistant
        </Typography>
        <Typography sx={{ fontSize: { xs: '0.72rem', sm: '0.78rem' }, opacity: 0.72, lineHeight: 1.5 }}>Powered by eCashbiz ERP</Typography>
      </Box>
    </Box>
  );
}
