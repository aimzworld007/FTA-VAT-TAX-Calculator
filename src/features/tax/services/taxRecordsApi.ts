export async function createTaxRecord(payload: {
  taxType: 'VAT' | 'CORPORATE';
  periodStart?: string | null;
  periodEnd?: string | null;
  inputPayload: Record<string, unknown>;
  resultPayload: Record<string, unknown>;
}) {
  const res = await fetch('/api/tax-records', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Unable to save record');
  return data;
}

export async function listTaxRecords() {
  const res = await fetch('/api/tax-records', { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Unable to load records');
  return data?.data?.records || [];
}
