import React from 'react';
import { calculateCorporateTax } from '../lib/corporateTaxCalculator';
import { formatAED, KpiCard, ReportFooter, ReportHeader, ReportShell } from './reportShared';

export function CorporateTaxReport({ data }) {
  const result = calculateCorporateTax(data);
  const generatedAt = new Date();
  const period = data.financialYearStart && data.financialYearEnd ? `${data.financialYearStart} to ${data.financialYearEnd}` : '—';

  return <ReportShell id='corporate-tax-report' className='corporate-tax-report'>
    <ReportHeader
      title='UAE Corporate Tax Report'
      subtitle='Prepared from FTA VAT & Tax Filing Assistant'
      info={[
        { label: 'Company Name', value: data.companyName || '—' },
        { label: 'Tax Registration Number', value: data.taxRegistrationNumber || '—' },
        { label: 'Business Activity', value: data.businessActivity || '—' },
        { label: 'Financial Year', value: period },
        { label: 'Prepared Date', value: generatedAt.toLocaleDateString() }
      ]}
    />
    <section className='tax-report-kpis'>
      <KpiCard label='Total Revenue' value={formatAED(result.totalRevenue)} />
      <KpiCard label='Total Expenses' value={formatAED(result.totalExpenses)} />
      <KpiCard label='Taxable Income' value={formatAED(result.taxableIncome)} />
      <KpiCard label='Taxable Above Threshold' value={formatAED(result.taxableAboveThreshold)} />
      <KpiCard label='Corporate Tax Rate' value='9%' />
      <KpiCard label='Estimated Tax Payable' value={formatAED(result.taxPayable)} tone={result.taxPayable > 0 ? 'payable' : 'neutral'} />
    </section>
    <section className='tax-report-table-wrap'>
      <h3>Corporate Tax Computation Summary</h3>
      <table className='tax-report-table'>
        <thead><tr><th>Description</th><th className='num'>Amount AED</th></tr></thead>
        <tbody>
          <tr><td>Total Revenue + Other Income</td><td className='num'>{formatAED(result.totalRevenue)}</td></tr>
          <tr><td>Exempt Income</td><td className='num'>{formatAED(data.exemptIncome)}</td></tr>
          <tr><td>Total Expenses</td><td className='num'>{formatAED(result.totalExpenses)}</td></tr>
          <tr><td>Accounting Profit</td><td className='num'>{formatAED(result.accountingProfit)}</td></tr>
          <tr><td>Net Adjustments</td><td className='num'>{formatAED(result.adjustments)}</td></tr>
          <tr><td>Taxable Income</td><td className='num'>{formatAED(result.taxableIncome)}</td></tr>
          <tr><td>Threshold @ 0%</td><td className='num'>{formatAED(375000)}</td></tr>
          <tr className='row-total'><td>Estimated Tax Payable @ 9%</td><td className='num'>{formatAED(result.taxPayable)}</td></tr>
        </tbody>
      </table>
    </section>
    <p className='tax-report-disclaimer'>This report is a calculation assistant summary only. Verify records and FTA requirements before official submission.</p>
    <ReportFooter />
  </ReportShell>;
}
