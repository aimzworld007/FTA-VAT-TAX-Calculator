import React from 'react';
import { formatAED, KpiCard } from '../reportShared';

export function VatSummaryCards({ result, zeroRatedSales, exemptSales }: any) {
  const netClass = result.netVat > 0 ? 'payable' : result.netVat < 0 ? 'refundable' : 'neutral';
  return <>
    <article className={`vat-result-card ${netClass}`}>
      <div className='vat-result-title'>{result.netVat >= 0 ? '🔺 Net VAT Payable' : '✅ Net VAT Refundable'}</div>
      <div className='vat-result-amount'>{formatAED(Math.abs(result.netVat))}</div>
      <p>{result.netVat >= 0 ? 'Amount due to FTA after output and recoverable VAT reconciliation.' : 'Amount available to be carried forward or claimed as per FTA process.'}</p>
    </article>
    <section className='vat201-kpi-grid vat201-kpi-grid-two-col'>
      <KpiCard label='📈 Taxable Sales' value={formatAED(result.salesBreakdown.net)} tone='accent-blue' />
      <KpiCard label='🧾 Output VAT' value={formatAED(result.outputVat)} tone='accent-navy' />
      <KpiCard label='📥 Recoverable VAT' value={formatAED(result.inputVat)} tone='accent-green' />
      <KpiCard label='🌍 Zero Rated' value={formatAED(zeroRatedSales)} tone='accent-sky' />
      <KpiCard label='🚫 Exempt' value={formatAED(exemptSales)} tone='accent-gray' />
      <KpiCard label='⚖️ Net VAT Result' value={result.netVat >= 0 ? `Payable ${formatAED(result.netVat)}` : `Refundable ${formatAED(Math.abs(result.netVat))}`} tone={netClass} />
    </section>
  </>;
}
