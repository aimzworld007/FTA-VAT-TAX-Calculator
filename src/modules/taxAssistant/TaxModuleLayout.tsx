import React from 'react';
import { Box, Chip, Container, LinearProgress, Stack, Typography } from '@mui/material';
import { RouteLink } from '../../components/Router';
import { STEP_ORDER } from './moduleConfig';

export function TaxModuleLayout({ moduleTitle, basePath, currentStep, summary, children }) {
  const progress = ((STEP_ORDER.indexOf(currentStep) + 1) / STEP_ORDER.length) * 100;
  return <Container maxWidth='md' sx={{ py: 2 }}><Stack spacing={2}><Typography variant='h5' sx={{ fontWeight: 800 }}>{moduleTitle}</Typography><LinearProgress variant='determinate' value={progress} sx={{ height: 8, borderRadius: 999 }} />
    <Box sx={{ overflowX: 'auto' }}><Stack direction='row' spacing={1}>{STEP_ORDER.map((step) => <Chip key={step} component={RouteLink} to={`${basePath}/${step}`} clickable label={step.replace('-', ' ')} color={step===currentStep?'primary':'default'} />)}</Stack></Box>
    {summary}
    {children}
  </Stack></Container>;
}
