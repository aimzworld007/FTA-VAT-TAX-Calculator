import React from 'react';
export const money=(v)=>new Intl.NumberFormat('en-AE',{style:'currency',currency:'AED'}).format(Number(v)||0);
export function TaxModeCard({title,desc,badge,onClick,active}){return <button className={`selector-card ${active?'active primary':''}`} onClick={onClick}>{active&&<span className='selected-badge'>Selected</span>}<strong>{title}</strong>{badge&&<small className='module-rate-badge'>{badge}</small>}<p>{desc}</p></button>;}
export function TaxSummaryCard({label,value}){return <div className='kpi summary-card'><span className='summary-label'>{label}</span><strong className='summary-value'>{value}</strong></div>;}
export function WizardProgress({step,total}){const pct=Math.round((step/total)*100);return <div className='wizard-progress-wrap'><div className='wizard-progress'>Progress {pct}%</div><div className='progress-track'><div className='progress-fill' style={{width:`${pct}%`}}/></div></div>;}
export function WorkspaceHeader({ title, progress = 0, onBack }) {
  return <section className='card workspace-header no-print'>
    <div className='workspace-header-row'>
      <div className='workspace-header-title-wrap'>
        <button className='ghost' type='button' onClick={onBack}>← Back to Tax Home</button>
        <h2>{title}</h2>
      </div>
      <div className='workspace-header-progress'>
        <div className='wizard-progress'>Progress {progress}%</div>
        <div className='progress-track'><div className='progress-fill' style={{ width: `${progress}%` }} /></div>
      </div>
    </div>
  </section>;
}
export function FormSection({title,children}){return <section className='card'><h2>{title}</h2>{children}</section>;}
export function ExportActions({onSave,onReset,onPrint,onPdf,pdfLoading}){return <div className='wizard-export sticky-export no-print'><button onClick={onSave}>Save Draft</button><button onClick={onReset}>Reset</button><button onClick={onPrint}>Print</button><button onClick={onPdf} disabled={pdfLoading}>{pdfLoading?'Generating PDF…':'Download PDF'}</button></div>;}
