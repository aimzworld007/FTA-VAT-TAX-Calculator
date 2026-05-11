export function downloadPdfReport(filename='tax-report'){
  window.print();
  return `${filename}.pdf`;
}
