import React from 'react';
import { formatAED, KpiCard } from '../reportShared';

export function VatSummaryCards({ result, zeroRatedSales, exemptSales }: any) {
  const netClass = result.netVat > 0 ? 'payable' : result.netVat < 0 ? 'refundable' : 'neutral';
  return <section className='vat201-kpi-grid'>
    <KpiCard label='Taxable Sales' value={formatAED(result.salesBreakdown.net)} />
    <KpiCard label='Output VAT' value={formatAED(result.outputVat)} />
    <KpiCard label='Recoverable VAT' value={formatAED(result.inputVat)} />
    <KpiCard label='Zero Rated' value={formatAED(zeroRatedSales)} />
    <KpiCard label='Exempt' value={formatAED(exemptSales)} />
    <KpiCard label='Net VAT Result' value={result.netVat >= 0 ? `Payable ${formatAED(result.netVat)}` : `Refundable ${formatAED(Math.abs(result.netVat))}`} tone={netClass} />
  </section>;
}
