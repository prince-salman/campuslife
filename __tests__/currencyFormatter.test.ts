import { formatRupiah, isValidCurrencyAmount } from '../src/utils/currencyFormatter';

describe('Currency Formatter Utility Tests', () => {
  test('formats positive amounts with Rupiah prefix', () => {
    expect(formatRupiah(15000)).toBe('Rp 15.000');
    expect(formatRupiah(1000025)).toBe('Rp 1.000.025');
    expect(formatRupiah(680000)).toBe('Rp 680.000');
  });

  test('formats without prefix when requested', () => {
    expect(formatRupiah(15000, false)).toBe('15.000');
    expect(formatRupiah(2000, false)).toBe('2.000');
  });

  test('formats zero properly', () => {
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(0, false)).toBe('0');
  });

  test('handles negative amounts safely', () => {
    expect(formatRupiah(-50000)).toBe('-Rp 50.000');
    expect(formatRupiah(-50000, false)).toBe('-50.000');
  });

  test('safely falls back on NaN, Infinity, null, and undefined (DoS defense)', () => {
    expect(formatRupiah(NaN)).toBe('Rp 0');
    expect(formatRupiah(Infinity)).toBe('Rp 0');
    expect(formatRupiah(-Infinity)).toBe('Rp 0');
    expect(formatRupiah(null as any)).toBe('Rp 0');
    expect(formatRupiah(undefined as any)).toBe('Rp 0');
  });
});

describe('Currency Validation Security Tests', () => {
  test('accepts valid positive numbers', () => {
    expect(isValidCurrencyAmount(1000)).toBe(true);
    expect(isValidCurrencyAmount(50000)).toBe(true);
    expect(isValidCurrencyAmount(1000000000)).toBe(true);
  });

  test('rejects NaN, Infinity, zero, and negative numbers', () => {
    expect(isValidCurrencyAmount(NaN)).toBe(false);
    expect(isValidCurrencyAmount(Infinity)).toBe(false);
    expect(isValidCurrencyAmount(-Infinity)).toBe(false);
    expect(isValidCurrencyAmount(0)).toBe(false);
    expect(isValidCurrencyAmount(-5000)).toBe(false);
  });

  test('rejects unreasonable numbers (overflow protection)', () => {
    expect(isValidCurrencyAmount(1000000001)).toBe(false);
    expect(isValidCurrencyAmount(1e15)).toBe(false);
  });

  test('rejects non-number types', () => {
    expect(isValidCurrencyAmount('15000')).toBe(false);
    expect(isValidCurrencyAmount(null)).toBe(false);
    expect(isValidCurrencyAmount(undefined)).toBe(false);
    expect(isValidCurrencyAmount({})).toBe(false);
  });
});
