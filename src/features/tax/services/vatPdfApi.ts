export async function generateVatPdfBlob(payload: any) {
  const response = await fetch('/api/vat/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Unable to generate PDF');
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) throw new Error('PDF endpoint returned JSON instead of a file');

  const blob = await response.blob();
  if (!blob?.size) throw new Error('Generated PDF is empty');
  return blob;
}

export function createPdfPreview(blob: Blob) {
  return window.URL.createObjectURL(blob);
}

export function cleanupPdfPreviewUrl(url?: string | null) {
  if (url) window.URL.revokeObjectURL(url);
}

export function downloadPdf(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function downloadVatPdf(payload: any) {
  const blob = await generateVatPdfBlob(payload);
  downloadPdf(blob, 'vat201-return-summary.pdf');
}
