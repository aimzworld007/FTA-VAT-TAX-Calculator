import { Alert } from '@mui/material';
export const EmptyState = ({ message }: { message: string }) => <Alert severity='info'>{message}</Alert>;
