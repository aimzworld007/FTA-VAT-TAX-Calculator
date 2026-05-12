import React from 'react';
import { ReportShell } from '../reportShared';
import { VatReportHeader } from './VatReportHeader';
import { VatSummaryCards } from './VatSummaryCards';
import { VatBoxSummaryTable } from './VatBoxSummaryTable';
import { VatReportFooter } from './VatReportFooter';

export function VatReportTemplate(props: any) {
  const { period, generatedDate, vatModeLabel, data, selectedEmirate, result, zeroRatedSales, exemptSales, rows } = props;
  return <ReportShell id='vat201-report' className='vat201-report pdf-safe-a4 report-export-a4 vat-report-print-layout'>
    <VatReportHeader period={period} generatedDate={generatedDate} vatModeLabel={vatModeLabel} businessName={data.businessName} trn={data.trn} emirate={selectedEmirate} filingFrequency={data.filingFrequency} />
    <div className='report-grid vat-report-layout'>
      <main className='report-main'>
        <VatBoxSummaryTable rows={rows} />
      </main>
      <aside className='report-sidebar'>
        <VatSummaryCards result={result} zeroRatedSales={zeroRatedSales} exemptSales={exemptSales} />
        <section className='report-card'>
          <h4>Filing Checklist</h4>
          <ul>
            <li>Reconcile taxable sales with books.</li>
            <li>Validate input VAT eligibility.</li>
            <li>Check adjustments and imports.</li>
            <li>Review before FTA submission.</li>
          </ul>
        </section>
        <section className='report-card'>
          <h4>Declaration</h4>
          <p>This VAT201 summary has been prepared from the available accounting records and reviewed for filing readiness.</p>
          <div className='declaration-line'>Prepared by: UAE VAT &amp; Tax Filing Assistant</div>
        </section>
      </aside>
    </div>
    <VatReportFooter />
  </ReportShell>;
}
