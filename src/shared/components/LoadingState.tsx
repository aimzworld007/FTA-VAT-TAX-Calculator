import { Alert } from '@mui/material';
export const LoadingState = ({ message = 'Loading…' }: { message?: string }) => <Alert severity='info'>{message}</Alert>;
