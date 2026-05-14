export function validateDateRange(start, end){
  if(!start || !end) return 'Start and end dates are required.';
  if(new Date(start) > new Date(end)) return 'Start date must be before end date.';
  return '';
}

export function validateRequired(value, name){
  return String(value || '').trim() ? '' : `${name} is required.`;
}

export function validateVatPeriodSelection(data) {
  const required = validateRequired(data?.filingFrequency, 'Filing frequency')
    || validateRequired(data?.filingYear, 'Filing year');
  if (required) return required;
  if (data?.filingFrequency === 'Monthly') return validateRequired(data?.filingMonth, 'Filing month');
  if (data?.filingFrequency === 'Quarterly') return validateRequired(data?.filingStartMonth, 'Quarter start month');
  return '';
}

export function validateBusinessName(value) {
  const input = String(value || '').trim();
  if (!input) return 'Business name is required.';
  return /^\d+$/.test(input) ? 'Business name cannot be only numbers.' : '';
}

export function validateTrn(value) {
  const input = String(value || '').trim();
  if (!input) return 'TRN is required.';
  return /^\d+$/.test(input) ? '' : 'TRN must contain numbers only.';
}
