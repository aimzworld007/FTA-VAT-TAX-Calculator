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
  if (data?.filingFrequency === 'Quarterly') return validateRequired(data?.filingQuarter, 'Filing quarter');
  return '';
}
