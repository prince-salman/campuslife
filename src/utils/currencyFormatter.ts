/**
 * Formats a number into Indonesian Rupiah (IDR) currency format.
 * Examples:
 *   formatRupiah(1000000) => "Rp 1.000.000"
 *   formatRupiah(1000000, false) => "1.000.000"
 */
export function formatRupiah(amount: number, withPrefix: boolean = true): string {
  if (amount === null || amount === undefined || Number.isNaN(amount) || !Number.isFinite(amount)) {
    return withPrefix ? 'Rp 0' : '0';
  }

  const isNegative = amount < 0;
  const absoluteVal = Math.round(Math.abs(amount));
  const formatted = absoluteVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (withPrefix) {
    return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Validates whether a given value is a safe, positive numerical currency amount.
 */
export function isValidCurrencyAmount(val: unknown): val is number {
  if (typeof val !== 'number') {
    return false;
  }
  return !Number.isNaN(val) && Number.isFinite(val) && val > 0 && val <= 1_000_000_000;
}
