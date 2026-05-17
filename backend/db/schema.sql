CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT,
  trn TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tax_type TEXT NOT NULL,
  filing_period_start DATE,
  filing_period_end DATE,
  sales_total NUMERIC(18,2) DEFAULT 0,
  purchase_total NUMERIC(18,2) DEFAULT 0,
  expenses_total NUMERIC(18,2) DEFAULT 0,
  taxable_amount NUMERIC(18,2) DEFAULT 0,
  vat_payable NUMERIC(18,2) DEFAULT 0,
  corporate_tax_estimate NUMERIC(18,2) DEFAULT 0,
  export_metadata JSONB,
  input_payload JSONB,
  result_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vat_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL,
  period_label TEXT,
  filing_period_start DATE,
  filing_period_end DATE,
  sales_total NUMERIC(18,2) DEFAULT 0,
  purchase_total NUMERIC(18,2) DEFAULT 0,
  expenses_total NUMERIC(18,2) DEFAULT 0,
  taxable_amount NUMERIC(18,2) DEFAULT 0,
  vat_payable NUMERIC(18,2) DEFAULT 0,
  vat_refundable NUMERIC(18,2) DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  export_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS corporate_tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE SET NULL,
  period_label TEXT,
  filing_period_start DATE,
  filing_period_end DATE,
  sales_total NUMERIC(18,2) DEFAULT 0,
  purchase_total NUMERIC(18,2) DEFAULT 0,
  expenses_total NUMERIC(18,2) DEFAULT 0,
  taxable_amount NUMERIC(18,2) DEFAULT 0,
  corporate_tax_estimate NUMERIC(18,2) DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  export_metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS filing_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'GENERAL',
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT,
  port INTEGER,
  username TEXT,
  password_encrypted TEXT,
  from_email TEXT,
  from_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_vat_records_user_created ON vat_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_corp_records_user_created ON corporate_tax_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON filing_reminders(user_id, due_date ASC);
