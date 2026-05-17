export const formatDate = (value?: string | Date | null) => (value ? new Date(value).toLocaleDateString() : 'N/A');
