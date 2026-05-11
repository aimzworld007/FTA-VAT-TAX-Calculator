export async function downloadVatPdf(payload: any) {
  const response = await fetch('/api/vat/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Unable to generate PDF');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const fileMatch = disposition.match(/filename="?([^\"]+)"?/i);
  const filename = fileMatch?.[1] || 'vat201-return-summary.pdf';
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
