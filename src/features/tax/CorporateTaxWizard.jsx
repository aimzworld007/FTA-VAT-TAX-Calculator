import React from 'react';
import { Button, Grid, Stack, TextField } from '@mui/material';
import { calculateCorporateTax } from './lib/corporateTaxCalculator';
import { ExportActions, FormSection, TaxSummaryCard, money } from './components/common.jsx';
import { TAX_CONFIG } from './lib/taxConfig';
import { downloadPdfReport } from './lib/pdfGenerator';
const steps=['Company Details','Income','Expenses','Taxable Profit','Tax Calculation','Export'];
const F=({label,v,on,n='text'})=><Grid size={{xs:12,md:4}}><TextField type={n} label={label} value={v} onChange={on} /></Grid>;
export function CorporateTaxWizard({data,setData,onSave,onReset,onProgressChange}){const [step,setStep]=React.useState(1); const r=calculateCorporateTax(data);
React.useEffect(()=>{onProgressChange?.(Math.round((step/6)*100));},[step,onProgressChange]);
const missingRequired = !data.companyName || !data.taxRegistrationNumber || !data.businessActivity;
return <div><FormSection title={`Corporate Tax Wizard: ${steps[step-1]}`}>
{step===1&&<Grid container spacing={2}><F label='Company name' v={data.companyName} on={e=>setData({...data,companyName:e.target.value})}/><F label='Tax registration number' v={data.taxRegistrationNumber} on={e=>setData({...data,taxRegistrationNumber:e.target.value})}/><F label='Business activity' v={data.businessActivity} on={e=>setData({...data,businessActivity:e.target.value})}/></Grid>}
{step===2&&<Grid container spacing={2}><F n='number' label='Total revenue' v={data.revenue} on={e=>setData({...data,revenue:e.target.value})}/><F n='number' label='Other income' v={data.otherIncome} on={e=>setData({...data,otherIncome:e.target.value})}/><F n='number' label='Exempt income' v={data.exemptIncome} on={e=>setData({...data,exemptIncome:e.target.value})}/></Grid>}
{step===3&&<Grid container spacing={2}><F n='number' label='Direct expenses' v={data.directExpenses} on={e=>setData({...data,directExpenses:e.target.value})}/><F n='number' label='Admin/general expenses' v={data.adminExpenses} on={e=>setData({...data,adminExpenses:e.target.value})}/><F n='number' label='Non-deductible expenses' v={data.nonDeductibleExpenses} on={e=>setData({...data,nonDeductibleExpenses:e.target.value})}/></Grid>}
{step===4&&<Grid container spacing={2}><F n='number' label='Accounting profit' v={data.accountingProfit} on={e=>setData({...data,accountingProfit:e.target.value})}/><F n='number' label='Add-back adjustments' v={data.addBackAdjustments} on={e=>setData({...data,addBackAdjustments:e.target.value})}/><F n='number' label='Deductible adjustments' v={data.deductibleAdjustments} on={e=>setData({...data,deductibleAdjustments:e.target.value})}/></Grid>}
{step>=5&&<div className='grid-section'><TaxSummaryCard label='Threshold (0%)' value={money(TAX_CONFIG.corporateTaxThreshold)}/><TaxSummaryCard label='Taxable above threshold' value={money(r.taxableAboveThreshold)}/><TaxSummaryCard label='Rate' value='9%'/><TaxSummaryCard label='Final estimated tax payable' value={money(r.taxPayable)}/><p>For preparation only. Please verify before official FTA submission.</p></div>}
</FormSection><Stack direction={{xs:'column',sm:'row'}} spacing={1.5} sx={{mt:2}}><Button variant='outlined' onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1}>Back</Button><Button onClick={()=>setStep(s=>Math.min(6,s+1))} disabled={step===6 || (step===1 && missingRequired)}>Continue</Button></Stack>{step===6&&<ExportActions onSave={onSave} onReset={onReset} onPrint={()=>window.print()} onPdf={()=>downloadPdfReport('corporate-tax-report')}/>}</div>}
