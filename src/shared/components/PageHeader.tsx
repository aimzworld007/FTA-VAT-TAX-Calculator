import { Box, Typography } from '@mui/material';
export const PageHeader = ({ title, subtitle }: { title: string; subtitle: string }) => <Box><Typography variant='h5' sx={{ fontWeight: 700 }}>{title}</Typography><Typography color='text.secondary'>{subtitle}</Typography></Box>;
