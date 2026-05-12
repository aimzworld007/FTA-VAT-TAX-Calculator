const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_MARGIN_MM = 8;

const getPdfLibs = () => ({
  html2canvas: window.html2canvas,
  JsPdfCtor: window.jspdf?.jsPDF || window.jsPDF
});

async function renderReportCanvas(report) {
  const { html2canvas } = getPdfLibs();
  if (!html2canvas) throw new Error('html2canvas is not available');

  report.classList.add('pdf-safe-a4');
  try {
    return await html2canvas(report, {
      scale: Math.max(2, window.devicePixelRatio || 1),
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false
    });
  } finally {
    report.classList.remove('pdf-safe-a4');
  }
}

export async function createPdfBlobFromReport(reportId) {
  const report = document.getElementById(reportId);
  if (!report) throw new Error(`Report element not found: ${reportId}`);
  const { JsPdfCtor } = getPdfLibs();
  if (!JsPdfCtor) throw new Error('jsPDF is not available');

  const canvas = await renderReportCanvas(report);
  const pdf = new JsPdfCtor({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const usableWidth = A4_WIDTH_MM - (A4_MARGIN_MM * 2);
  const usableHeight = A4_HEIGHT_MM - (A4_MARGIN_MM * 2);
  const imageRatio = canvas.width / canvas.height;
  const boxRatio = usableWidth / usableHeight;

  const renderWidth = imageRatio > boxRatio ? usableWidth : usableHeight * imageRatio;
  const renderHeight = imageRatio > boxRatio ? usableWidth / imageRatio : usableHeight;
  const offsetX = (A4_WIDTH_MM - renderWidth) / 2;
  const offsetY = A4_MARGIN_MM;

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');

  return pdf.output('blob');
}

export async function downloadPdfReport(data = {}) {
  const reportId = data.reportId || 'vat201-report';
  try {
    const blob = await createPdfBlobFromReport(reportId);
    const safe = (v) => (v || 'report').toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
    const businessName = safe(data.businessName || data.companyName || 'business');
    const taxPeriod = safe(data.taxPeriod || (data.taxPeriodStart && data.taxPeriodEnd ? `${data.taxPeriodStart}_to_${data.taxPeriodEnd}` : (data.financialYearStart && data.financialYearEnd ? `${data.financialYearStart}_to_${data.financialYearEnd}` : 'period')));
    const reportType = safe(data.reportType || 'tax');
    const filename = `${businessName}-${taxPeriod}-${reportType}-report.pdf`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return filename;
  } catch (error) {
    window.print();
    return 'vat-report.pdf';
  }
}
