ALTER TABLE business_profiles
  ADD COLUMN IF NOT EXISTS emirate TEXT,
  ADD COLUMN IF NOT EXISTS vat_filing_frequency TEXT,
  ADD COLUMN IF NOT EXISTS corporate_tax_year_start DATE,
  ADD COLUMN IF NOT EXISTS corporate_tax_year_end DATE,
  ADD COLUMN IF NOT EXISTS default_vat_pricing_mode TEXT;

CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_trn ON business_profiles(trn);
