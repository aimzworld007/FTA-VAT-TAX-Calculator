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
  const legacyNavigator = window.navigator as Navigator & { msSaveOrOpenBlob?: (fileBlob: Blob, defaultName?: string) => boolean };
  if (legacyNavigator.msSaveOrOpenBlob) {
    legacyNavigator.msSaveOrOpenBlob(blob, filename);
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

export async function downloadVatPdf(payload: any) {
  const blob = await generateVatPdfBlob(payload);
  downloadPdf(blob, 'vat201-return-summary.pdf');
}
