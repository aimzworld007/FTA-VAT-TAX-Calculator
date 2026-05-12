export async function downloadPdfReport(data = {}) {
  const reportId = data.reportId || 'vat201-report';
  const report = document.getElementById(reportId);
  if (!report) {
    window.print();
    return 'vat-report.pdf';
  }

  const html2canvas = window.html2canvas;
  const JsPdfCtor = window.jspdf?.jsPDF || window.jsPDF;

  if (!html2canvas || !JsPdfCtor) {
    window.print();
    return 'vat-report.pdf';
  }

  const canvas = await html2canvas(report, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
  const pdf = new JsPdfCtor({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfW = 210;
  const pdfH = 297;
  const imgW = pdfW;
  const imgH = (canvas.height * imgW) / canvas.width;
  let heightLeft = imgH;
  let position = 0;

  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
  heightLeft -= pdfH;

  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
    heightLeft -= pdfH;
  }

  const safe = (v) => (v || 'report').toString().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_]/g, '');
  const businessName = safe(data.businessName || data.companyName || 'business');
  const taxPeriod = safe(data.taxPeriod || (data.taxPeriodStart && data.taxPeriodEnd ? `${data.taxPeriodStart}_to_${data.taxPeriodEnd}` : (data.financialYearStart && data.financialYearEnd ? `${data.financialYearStart}_to_${data.financialYearEnd}` : 'period')));
  const reportType = safe(data.reportType || 'tax');
  const filename = `${businessName}-${taxPeriod}-${reportType}-report.pdf`;
  pdf.save(filename);
  return filename;
}
