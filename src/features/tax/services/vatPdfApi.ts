import { createPdfBlobFromReport } from '../lib/pdfGenerator';


export async function generateVatPdfBlob(_payload: any) {
  return await createPdfBlobFromReport('vat201-report');
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
