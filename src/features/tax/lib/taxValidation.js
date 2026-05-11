export function validateDateRange(start, end){
  if(!start || !end) return 'Start and end dates are required.';
  if(new Date(start) > new Date(end)) return 'Start date must be before end date.';
  return '';
}
export function validateRequired(value, name){
  return String(value || '').trim() ? '' : `${name} is required.`;
}
