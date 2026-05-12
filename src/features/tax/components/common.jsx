import React from 'react';
import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export const money=(v)=>new Intl.NumberFormat('en-AE',{style:'currency',currency:'AED'}).format(Number(v)||0);
export function TaxSummaryCard({label,value}){return <Card><CardContent><Typography variant='body2' color='text.secondary'>{label}</Typography><Typography variant='h6'>{value}</Typography></CardContent></Card>;}
export function WorkspaceHeader({ title, progress = 0, onBack }) {
  return <Card sx={{ mb: 2 }}><CardContent>
    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent='space-between' spacing={2}>
      <Box>
        <Button
          variant='outlined'
          size='small'
          startIcon={<HomeRoundedIcon fontSize='small' />}
          onClick={onBack}
          sx={{ alignSelf: 'flex-start', minHeight: 36, borderRadius: 2, textTransform: 'none', mb: 1 }}
        >
          Back to Home
        </Button>
        <Typography variant='h5'>{title}</Typography>
      </Box>
      <Box sx={{ minWidth: { md: 280 } }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>Progress {progress}%</Typography>
        <LinearProgress variant='determinate' value={progress} />
      </Box>
    </Stack>
  </CardContent></Card>;
}
export function FormSection({title,children}){return <Card><CardContent><Typography variant='h6' sx={{mb:2}}>{title}</Typography>{children}</CardContent></Card>;}
export function ExportActions({onSave,onReset,onPrint,onPdf,pdfLoading}){return <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}><Button variant='outlined' onClick={onSave}>Save Draft</Button><Button color='warning' variant='outlined' onClick={onReset}>Reset</Button><Button variant='outlined' onClick={onPrint}>Print</Button><Button onClick={onPdf} disabled={pdfLoading}>{pdfLoading?'Generating PDF…':'Download PDF'}</Button></Stack>;}
