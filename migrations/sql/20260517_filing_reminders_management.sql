ALTER TABLE filing_reminders
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS email_reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_days_before INTEGER NOT NULL DEFAULT 3;

ALTER TABLE filing_reminders
  ALTER COLUMN type SET DEFAULT 'VAT';

UPDATE filing_reminders
SET type='VAT'
WHERE type IS NULL OR type NOT IN ('VAT', 'CORPORATE_TAX');

UPDATE filing_reminders
SET status='pending'
WHERE status IS NULL OR status NOT IN ('pending', 'completed');

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='filing_reminders_type_check') THEN
    ALTER TABLE filing_reminders
      ADD CONSTRAINT filing_reminders_type_check CHECK (type IN ('VAT','CORPORATE_TAX'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='filing_reminders_status_check') THEN
    ALTER TABLE filing_reminders
      ADD CONSTRAINT filing_reminders_status_check CHECK (status IN ('pending','completed'));
  END IF;
END $$;
