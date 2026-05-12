import React from 'react';
import { draftStorage } from '../../features/tax/lib/localDraftStorage';
import { buildMonthlyEntries } from '../../features/tax/lib/vatCalculator';
import { VAT_PRICING_MODES, normalizeVatPricingMode } from '../../features/tax/lib/vatPricing';
import { inferSelectionFromDates, getPeriodFromSelection } from '../../features/tax/lib/vatPeriod';

const currentYear = new Date().getFullYear();
const wsDefault = { vatPricingMode: VAT_PRICING_MODES.EXCLUSIVE };
const vatDefault = { businessName: '', trn: '', businessLocationEmirate: '', filingFrequency: 'Quarterly', filingYear: currentYear, filingMonth: 'January', filingQuarter: 'Q1', filingStartMonth: 'January', taxPeriodStart: '', taxPeriodEnd: '', standardRatedSales: 0, zeroRatedSales: 0, exemptSales: 0, standardRatedPurchases: 0, recoverableInputVat: 0, nonRecoverableVat: 0, previousAdjustment: 0, badDebtRelief: 0, adjustmentNotes: '', monthlyEntries: [], vatPricingMode: wsDefault.vatPricingMode };
const ctDefault = { companyName: '', taxRegistrationNumber: '', financialYearStart: '', financialYearEnd: '', businessActivity: '', revenue: 0, otherIncome: 0, exemptIncome: 0, directExpenses: 0, adminExpenses: 0, nonDeductibleExpenses: 0, accountingProfit: 0, addBackAdjustments: 0, deductibleAdjustments: 0 };

const normalizeVatDraft = (input, ws) => { const merged = { ...vatDefault, ...input, vatPricingMode: normalizeVatPricingMode(input?.vatPricingMode || ws.vatPricingMode) }; const selection = inferSelectionFromDates(merged); const period = getPeriodFromSelection(selection); const next = { ...merged, ...selection, ...period }; next.monthlyEntries = buildMonthlyEntries(next); return next; };

const Ctx = React.createContext(null);
export const useTaxAssistant = () => React.useContext(Ctx);

export function TaxAssistantProvider({ children }) {
  const [ws] = React.useState(() => ({ ...wsDefault, ...draftStorage.load('workspaceSettings', wsDefault) }));
  const [vat, setVat] = React.useState(() => normalizeVatDraft(draftStorage.load('vatDraft', vatDefault), ws));
  const [ct, setCt] = React.useState(() => draftStorage.load('ctDraft', ctDefault));
  React.useEffect(() => { draftStorage.save('vatDraft', vat); }, [vat]);
  React.useEffect(() => { draftStorage.save('ctDraft', ct); }, [ct]);
  return <Ctx.Provider value={{ vat, setVat, ct, setCt }}>{children}</Ctx.Provider>;
}
