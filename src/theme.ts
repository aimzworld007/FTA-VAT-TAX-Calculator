import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#0f766e' },
    background: { default: '#f4f7fb', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { variant: 'contained' }, styleOverrides: { root: { borderRadius: 12, boxShadow: 'none' } } },
    MuiTextField: { defaultProps: { fullWidth: true, size: 'medium' } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16, boxShadow: '0 6px 24px rgba(15,23,42,0.06)' } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 16, boxShadow: '0 6px 24px rgba(15,23,42,0.06)' } } },
    MuiSelect: { defaultProps: { fullWidth: true } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: '0 6px 24px rgba(15,23,42,0.08)' } } },
  },
});
