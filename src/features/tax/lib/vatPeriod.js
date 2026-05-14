export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const QUARTERS = [
  { value: 'Q1', label: 'Q1 (Jan - Mar)', months: [0, 1, 2], range: 'January - March' },
  { value: 'Q2', label: 'Q2 (Apr - Jun)', months: [3, 4, 5], range: 'April - June' },
  { value: 'Q3', label: 'Q3 (Jul - Sep)', months: [6, 7, 8], range: 'July - September' },
  { value: 'Q4', label: 'Q4 (Oct - Dec)', months: [9, 10, 11], range: 'October - December' }
];

export const QUARTER_START_MONTHS = MONTHS;

const pad = (m) => String(m).padStart(2, '0');
const parseYear = (value) => Number(value) || new Date().getFullYear();

export function inferSelectionFromDates(data) {
  const nowYear = new Date().getFullYear();
  const start = data?.taxPeriodStart ? new Date(data.taxPeriodStart) : null;
  const startMonth = start && Number.isFinite(start.getTime()) ? start.getMonth() : 0;
  const startYear = start && Number.isFinite(start.getTime()) ? start.getFullYear() : nowYear;

  const filingFrequency = data?.filingFrequency || 'Quarterly';
  const filingYear = Number(data?.filingYear) || startYear;
  const filingMonth = data?.filingMonth || MONTHS[startMonth] || 'January';
  const filingQuarter = data?.filingQuarter || `Q${Math.floor(startMonth / 3) + 1}`;
  const filingStartMonth = data?.filingStartMonth || MONTHS[startMonth] || 'January';

  return { filingFrequency, filingYear, filingMonth, filingQuarter, filingStartMonth };
}

export function getPeriodFromSelection({ filingFrequency, filingYear, filingMonth, filingQuarter, filingStartMonth }) {
  const year = parseYear(filingYear);

  if (filingFrequency === 'Monthly') {
    const monthIndex = Math.max(0, MONTHS.indexOf(filingMonth));
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    return {
      taxPeriodStart: `${year}-${pad(monthIndex + 1)}-01`,
      taxPeriodEnd: `${year}-${pad(monthIndex + 1)}-${pad(lastDay)}`,
      monthLabels: [MONTHS[monthIndex]]
    };
  }

  if (filingFrequency === 'Yearly') {
    return {
      taxPeriodStart: `${year}-01-01`,
      taxPeriodEnd: `${year}-12-31`,
      monthLabels: [...MONTHS]
    };
  }

  const startMonthIndex = Math.max(0, MONTHS.indexOf(filingStartMonth || 'January'));
  const endMonthIndex = (startMonthIndex + 2) % 12;
  const endYear = year + (startMonthIndex + 2 >= 12 ? 1 : 0);
  const lastDay = new Date(endYear, endMonthIndex + 1, 0).getDate();
  const monthLabels = [
    MONTHS[startMonthIndex],
    MONTHS[(startMonthIndex + 1) % 12],
    MONTHS[endMonthIndex]
  ];

  return {
    taxPeriodStart: `${year}-${pad(startMonthIndex + 1)}-01`,
    taxPeriodEnd: `${endYear}-${pad(endMonthIndex + 1)}-${pad(lastDay)}`,
    monthLabels
  };
}

export function buildMonthlyEntriesFromPeriod(data, existingEntries = []) {
  const { monthLabels } = getPeriodFromSelection(data);
  const existing = Array.isArray(existingEntries) ? existingEntries : [];
  const byMonth = new Map(existing.map((entry) => [entry?.month, entry]));
  const n = (v) => Math.max(0, Number(v) || 0);
  const parseAdjustment = (v) => Number(v) || 0;

  return monthLabels.map((month) => {
    const prev = byMonth.get(month) || {};
    return {
      month,
      sales: n(prev.sales),
      purchases: n(prev.purchases),
      expenses: n(prev.expenses),
      adjustment: parseAdjustment(prev.adjustment)
    };
  });
}

export function formatVatPeriodLabel(data) {
  const year = Number(data?.filingYear) || new Date().getFullYear();
  if (data?.filingFrequency === 'Monthly') return `${data.filingMonth || 'January'} ${year}`;
  if (data?.filingFrequency === 'Yearly') return `Year ${year}`;
  const period = getPeriodFromSelection(data);
  const start = data?.filingStartMonth || 'January';
  const end = period.monthLabels?.[2] || 'March';
  return `${start} - ${end} ${year} (Quarterly)`;
}
