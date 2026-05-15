DROP TABLE IF EXISTS "TaxRecord" CASCADE;
DROP TABLE IF EXISTS "VatRecord" CASCADE;
DROP TABLE IF EXISTS "BusinessProfile" CASCADE;
DROP TABLE IF EXISTS "RefreshToken" CASCADE;
DROP TABLE IF EXISTS "Reminder" CASCADE;
DROP TABLE IF EXISTS "SmtpSetting" CASCADE;
DROP TABLE IF EXISTS "ActivityLog" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TYPE IF EXISTS "RecordStatus" CASCADE;
DROP TYPE IF EXISTS "ReminderType" CASCADE;
DROP TYPE IF EXISTS "ReminderStatus" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;

CREATE TYPE "Role" AS ENUM ('USER', 'SUPERADMIN');
CREATE TYPE "RecordStatus" AS ENUM ('draft', 'submitted', 'archived');
CREATE TYPE "ReminderType" AS ENUM ('VAT', 'CORPORATE_TAX', 'GENERAL');
CREATE TYPE "ReminderStatus" AS ENUM ('pending', 'done', 'cancelled');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "BusinessProfile" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "businessName" TEXT NOT NULL,
  "trn" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "emirate" TEXT,
  "taxPeriodType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "VatRecord" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "businessProfileId" TEXT,
  "periodLabel" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "salesAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxableSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "outputVat" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "purchasesAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "expensesAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "recoverableVat" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "zeroRatedSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "exemptSales" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "adjustmentVat" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netVatPayable" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" "RecordStatus" NOT NULL DEFAULT 'draft',
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "CorporateTaxRecord" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "businessProfileId" TEXT,
  "periodLabel" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "incomeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "expenseAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxableProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" "RecordStatus" NOT NULL DEFAULT 'draft',
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Reminder" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "ReminderType" NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "ReminderStatus" NOT NULL DEFAULT 'pending',
  "emailSent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "SmtpSetting" (
  "id" TEXT PRIMARY KEY,
  "host" TEXT NOT NULL,
  "port" INTEGER NOT NULL,
  "secure" BOOLEAN NOT NULL DEFAULT false,
  "username" TEXT NOT NULL,
  "passwordEncrypted" TEXT NOT NULL,
  "fromEmail" TEXT NOT NULL,
  "fromName" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "ActivityLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "RefreshToken" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VatRecord" ADD CONSTRAINT "VatRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VatRecord" ADD CONSTRAINT "VatRecord_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CorporateTaxRecord" ADD CONSTRAINT "CorporateTaxRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CorporateTaxRecord" ADD CONSTRAINT "CorporateTaxRecord_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
