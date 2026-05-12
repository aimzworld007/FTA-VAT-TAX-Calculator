import React from 'react';
import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export const money=(v)=>new Intl.NumberFormat('en-AE',{style:'currency',currency:'AED'}).format(Number(v)||0);
export function TaxSummaryCard({label,value}){return <Card><CardContent><Typography variant='body2' color='text.secondary'>{label}</Typography><Typography variant='h6'>{value}</Typography></CardContent></Card>;}
export function WorkspaceHeader({ title, progress = 0, onBack, centerContent }) {
  return <Card sx={{ mb: 2, borderRadius: 3, border: '1px solid #dbe3ef', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)' }}><CardContent sx={{ py: { xs: 1.5, md: 1.75 } }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(220px, 300px) minmax(0, 1fr) minmax(220px, 280px)' }, alignItems: 'center', gap: { xs: 1.25, sm: 1.5, lg: 2 } }}>
      <Box>
        <Button
          variant='outlined'
          size='small'
          startIcon={<HomeRoundedIcon fontSize='small' />}
          onClick={onBack}
          sx={{ alignSelf: 'flex-start', minHeight: 34, borderRadius: 2, textTransform: 'none', mb: 0.75 }}
        >
          Back to Home
        </Button>
        <Typography variant='h5' sx={{ fontSize: { xs: '1.2rem', md: '1.38rem' }, fontWeight: 700 }}>{title}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'center' }, width: '100%' }}>
        {centerContent}
      </Box>
      <Box sx={{ minWidth: { md: 220 }, width: '100%', justifySelf: { lg: 'end' } }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 0.75, textAlign: { xs: 'left', lg: 'right' }, fontWeight: 600 }}>Progress {progress}%</Typography>
        <LinearProgress variant='determinate' value={progress} sx={{ height: 8, borderRadius: 999, backgroundColor: '#e8eef7' }} />
      </Box>
    </Box>
  </CardContent></Card>;
}
export function FormSection({title,children}){return <Card><CardContent><Typography variant='h6' sx={{mb:2}}>{title}</Typography>{children}</CardContent></Card>;}
export function ExportActions({onSave,onReset,onPrint,onPdf,pdfLoading}){return <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}><Button variant='outlined' onClick={onSave}>Save Draft</Button><Button color='warning' variant='outlined' onClick={onReset}>Reset</Button><Button variant='outlined' onClick={onPrint}>Print</Button><Button onClick={onPdf} disabled={pdfLoading}>{pdfLoading?'Generating PDF…':'Download PDF'}</Button></Stack>;}
