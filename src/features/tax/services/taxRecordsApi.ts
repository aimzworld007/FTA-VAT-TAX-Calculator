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

export async function getTaxRecord(id: string) {
  const res = await fetch(`/api/tax-records/${id}`, { credentials: 'include' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Unable to load record');
  return data?.data?.record;
}

export async function updateTaxRecord(
  id: string,
  payload: Partial<{
    periodStart: string | null;
    periodEnd: string | null;
    inputPayload: Record<string, unknown>;
    resultPayload: Record<string, unknown>;
  }>
) {
  const res = await fetch(`/api/tax-records/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Unable to update record');
  return data?.data?.record;
}

export async function deleteTaxRecord(id: string) {
  const res = await fetch(`/api/tax-records/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || 'Unable to delete record');
  return data?.data?.id;
}
