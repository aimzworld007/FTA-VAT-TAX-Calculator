import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeVatAmounts, VAT_PRICING_MODES } from '../src/features/tax/lib/vatPricing.js';

const round2 = (v) => Math.round(v * 100) / 100;

test('Case A VAT Exclusive keeps amount as taxable and adds 5% VAT', () => {
  const normalized = normalizeVatAmounts(451500.08, VAT_PRICING_MODES.EXCLUSIVE);
  assert.equal(round2(normalized.taxableAmount), 451500.08);
  assert.equal(round2(normalized.vatAmount), 22575.00);
  assert.equal(round2(normalized.grossAmount), 474075.08);
});

test('Case B VAT Inclusive splits gross amount into taxable + VAT', () => {
  const normalized = normalizeVatAmounts(474075.08, VAT_PRICING_MODES.INCLUSIVE);
  assert.equal(round2(normalized.taxableAmount), 451500.08);
  assert.equal(round2(normalized.vatAmount), 22575.00);
  assert.equal(round2(normalized.grossAmount), 474075.08);
});
