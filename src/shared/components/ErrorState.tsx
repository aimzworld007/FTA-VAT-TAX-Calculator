import { Alert } from '@mui/material';
export const ErrorState = ({ message }: { message: string }) => <Alert severity='error'>{message}</Alert>;
