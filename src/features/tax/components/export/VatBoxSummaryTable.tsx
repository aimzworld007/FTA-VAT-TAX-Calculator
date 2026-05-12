import React from 'react';
import { formatAED } from '../reportShared';

export function VatBoxSummaryTable({ rows }: any) {
  return <section className='vat201-table-wrap'>
    <h3>VAT201 Box Summary</h3>
    <table className='vat201-table fta-table'>
      <thead>
        <tr><th>Box</th><th>Description</th><th className='num'>Amount AED</th><th className='num'>VAT AED</th><th className='num'>Adjustment AED</th></tr>
      </thead>
      <tbody>
        {rows.map((row: any) => <tr key={row.box} className={row.total ? 'row-total' : ''}>
          <td>{row.box}</td><td>{row.description}</td><td className='num'>{formatAED(row.taxableAmount ?? row.amount ?? 0)}</td><td className='num'>{formatAED(row.vatAmount)}</td><td className='num'>{formatAED(row.adjustment)}</td>
        </tr>)}
      </tbody>
    </table>
  </section>;
}
