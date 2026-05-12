import React from 'react';
import { Box, Typography } from '@mui/material';

export function AppFooter() {
  return (
    <Box component='footer' sx={{ mt: 2, px: 2, pb: { xs: 10, md: 3 } }}>
      <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 1400, mx: 'auto', py: 2, textAlign: 'center' }}>
        © 2026 FTA Assistant • Powered by <a href='https://ecashbiz.com/landing' target='_blank' rel='noreferrer'>eCashbiz ERP</a>
      </Typography>
    </Box>
  );
}
