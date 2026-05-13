import React from 'react';
import { Box, Chip, Container, LinearProgress, Stack, Typography } from '@mui/material';
import { RouteLink } from '../../components/Router';
import { STEP_ORDER } from './moduleConfig';

export function TaxModuleLayout({ moduleTitle, basePath, currentStep, summary, children }) {
  const stepIndex = STEP_ORDER.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;
  return <Container maxWidth={false} sx={{ py: 1.5, px: { xs: 1.5, md: 2.5 }, width: '100%' }}><Stack spacing={1.25}><Typography variant='h5' sx={{ fontWeight: 800 }}>{moduleTitle}</Typography><LinearProgress variant='determinate' value={progress} sx={{ height: 6, borderRadius: 999 }} />
    <Box sx={{ overflowX: 'auto' }}><Stack direction='row' spacing={1}>{STEP_ORDER.map((step, idx) => <Chip key={step} component={RouteLink} to={`${basePath}/${step}`} clickable label={step.replace('-', ' ')} color={step===currentStep?'primary':'default'} sx={idx < stepIndex ? { bgcolor: '#dbeafe', color: '#1d4ed8' } : idx > stepIndex ? { bgcolor: '#f3f4f6', color: '#6b7280' } : undefined} />)}</Stack></Box>
    {summary}
    {children}
  </Stack></Container>;
}
