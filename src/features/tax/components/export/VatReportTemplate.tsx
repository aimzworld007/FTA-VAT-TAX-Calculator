import React from 'react';
import { ReportShell } from '../reportShared';
import { VatReportHeader } from './VatReportHeader';
import { VatSummaryCards } from './VatSummaryCards';
import { VatBoxSummaryTable } from './VatBoxSummaryTable';
import { VatReportFooter } from './VatReportFooter';

export function VatReportTemplate(props: any) {
  const { period, generatedDate, vatModeLabel, data, selectedEmirate, result, zeroRatedSales, exemptSales, rows } = props;
  return <ReportShell id='vat201-report' className='vat201-report'>
    <VatReportHeader period={period} generatedDate={generatedDate} vatModeLabel={vatModeLabel} businessName={data.businessName} trn={data.trn} emirate={selectedEmirate} filingFrequency={data.filingFrequency} summaryCards={<VatSummaryCards result={result} zeroRatedSales={zeroRatedSales} exemptSales={exemptSales} />} />
    <VatBoxSummaryTable rows={rows} />
    <VatReportFooter />
  </ReportShell>;
}
