/** Display currency for TransitOps (INR). */
export const CURRENCY_SYMBOL = "₹";

/** Format a numeric amount as Indian Rupees, e.g. ₹12,345.67 */
export function formatInr(amount: number, fractionDigits = 0): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${CURRENCY_SYMBOL}${value.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}
