import React from 'react';
export const money=(v)=>new Intl.NumberFormat('en-AE',{style:'currency',currency:'AED'}).format(Number(v)||0);
export function TaxModeCard({title,desc,onClick,active}){return <button className={`selector-card ${active?'primary':''}`} onClick={onClick}><strong>{title}</strong><p>{desc}</p></button>;}
export function TaxSummaryCard({label,value}){return <div className='kpi'><span>{label}</span><strong>{value}</strong></div>;}
export function WizardProgress({step,total}){const pct=Math.round((step/total)*100);return <div className='wizard-progress-wrap'><div className='wizard-progress'>Progress {pct}%</div><div className='progress-track'><div className='progress-fill' style={{width:`${pct}%`}}/></div></div>;}
export function FormSection({title,children}){return <section className='card'><h2>{title}</h2>{children}</section>;}
export function ExportActions({onSave,onReset,onPrint,onPdf}){return <div className='wizard-export sticky-export no-print'><button onClick={onSave}>Save Draft</button><button onClick={onReset}>Reset</button><button onClick={onPrint}>Print</button><button onClick={onPdf}>Download PDF</button></div>;}
