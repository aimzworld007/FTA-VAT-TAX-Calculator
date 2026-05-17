ALTER TABLE vat_records ADD COLUMN IF NOT EXISTS sales_total NUMERIC(18,2) DEFAULT 0;
ALTER TABLE vat_records ADD COLUMN IF NOT EXISTS purchase_total NUMERIC(18,2) DEFAULT 0;
ALTER TABLE vat_records ADD COLUMN IF NOT EXISTS expenses_total NUMERIC(18,2) DEFAULT 0;
ALTER TABLE vat_records ADD COLUMN IF NOT EXISTS taxable_amount NUMERIC(18,2) DEFAULT 0;
ALTER TABLE vat_records ADD COLUMN IF NOT EXISTS vat_payable NUMERIC(18,2) DEFAULT 0;
ALTER TABLE vat_records ADD COLUMN IF NOT EXISTS vat_refundable NUMERIC(18,2) DEFAULT 0;
ALTER TABLE vat_records ADD COLUMN IF NOT EXISTS filing_period_start DATE;
ALTER TABLE vat_records ADD COLUMN IF NOT EXISTS filing_period_end DATE;

ALTER TABLE corporate_tax_records ADD COLUMN IF NOT EXISTS sales_total NUMERIC(18,2) DEFAULT 0;
ALTER TABLE corporate_tax_records ADD COLUMN IF NOT EXISTS purchase_total NUMERIC(18,2) DEFAULT 0;
ALTER TABLE corporate_tax_records ADD COLUMN IF NOT EXISTS expenses_total NUMERIC(18,2) DEFAULT 0;
ALTER TABLE corporate_tax_records ADD COLUMN IF NOT EXISTS taxable_amount NUMERIC(18,2) DEFAULT 0;
ALTER TABLE corporate_tax_records ADD COLUMN IF NOT EXISTS corporate_tax_estimate NUMERIC(18,2) DEFAULT 0;
ALTER TABLE corporate_tax_records ADD COLUMN IF NOT EXISTS filing_period_start DATE;
ALTER TABLE corporate_tax_records ADD COLUMN IF NOT EXISTS filing_period_end DATE;

CREATE INDEX IF NOT EXISTS idx_vat_records_user_period ON vat_records(user_id, filing_period_start DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_corp_records_user_period ON corporate_tax_records(user_id, filing_period_start DESC, updated_at DESC);
