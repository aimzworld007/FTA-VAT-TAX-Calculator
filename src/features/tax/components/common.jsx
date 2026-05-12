import React from 'react';
import { Box, Button, Card, CardContent, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';

export const money=(v)=>new Intl.NumberFormat('en-AE',{style:'currency',currency:'AED'}).format(Number(v)||0);
export function TaxSummaryCard({label,value}){return <Card className='premium-card'><CardContent><Typography variant='body2' color='text.secondary'>{label}</Typography><Typography variant='h6' sx={{fontWeight:700}}>{value}</Typography></CardContent></Card>;}
export function WorkspaceHeader({ title: _title, progress = 0, onBack, centerContent }) {
  return <Card sx={{ mb: 2, borderRadius: 3, border: '1px solid #dbe3ef', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)' }}><CardContent sx={{ py: { xs: 1.5, md: 1.75 } }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'auto minmax(0, 1fr) minmax(220px, 280px)' }, alignItems: 'center', gap: { xs: 1.25, sm: 1.5, lg: 1.5 } }}>
      <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'center' } }}>
        <IconButton
          size='small'
          aria-label='Back to Home'
          title='Back to Home'
          onClick={onBack}
          sx={{ border: '1px solid #dbe3ef', borderRadius: 2, backgroundColor: '#fff' }}
        >
          <HomeRoundedIcon fontSize='small' />
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'center' }, width: '100%' }}>
        {centerContent}
      </Box>
      <Card sx={{ borderRadius: 2.5, border: '1px solid #dbe3ef', background: 'linear-gradient(180deg, #fff 0%, #f8fafc 100%)', boxShadow: '0 3px 10px rgba(15, 23, 42, 0.06)', minWidth: { xs: '100%', sm: 180 }, justifySelf: { lg: 'end' } }}>
        <CardContent sx={{ py: 0.9, px: 1.1, '&:last-child': { pb: 0.9 } }}>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Box sx={{ color: 'primary.main', display: 'flex' }}><AutoGraphRoundedIcon fontSize='small' /></Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.15 }}>Progress</Typography>
              <Typography variant='body2' sx={{ fontWeight: 700, lineHeight: 1.25 }}>{progress}%</Typography>
              <LinearProgress variant='determinate' value={progress} sx={{ mt: 0.6, height: 6, borderRadius: 999, backgroundColor: '#e8eef7', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #2563eb, #60a5fa)', borderRadius: 999 } }} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  </CardContent></Card>;
}
export function FormSection({title,children}){return <Card className='premium-card'><CardContent><Typography variant='h6' sx={{mb:2}}>{title}</Typography>{children}</CardContent></Card>;}
export function ExportActions({onSave,onReset,onPrint,onPdf,pdfLoading}){return <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className='wizard-action-group wizard-action-group-right'><Button variant='outlined' onClick={onSave}>Save Draft</Button><Button className='danger-soft-btn' variant='outlined' onClick={onReset}>Reset</Button><Button variant='outlined' onClick={onPrint}>Print</Button><Button className='primary-gradient-btn' variant='contained' onClick={onPdf} disabled={pdfLoading}>{pdfLoading?'Generating PDF…':'Download PDF'}</Button></Stack>;}
