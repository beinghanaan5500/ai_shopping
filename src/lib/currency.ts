/**
 * Centralized Currency Utility for Pickwise
 * Converts DummyJSON USD catalog prices into Indian Rupees (INR)
 * and provides consistent Indian numbering format (e.g. ₹39,999, ₹1,24,999).
 */

export const USD_TO_INR_RATE = 83;

/**
 * Converts a USD price to INR.
 * Produces a realistic retail price (e.g. rounded to nearest integer or clean pricing).
 */
export function usdToInr(usd: number): number {
  if (!usd || usd <= 0) return 0;
  return Math.round(usd * USD_TO_INR_RATE);
}

/**
 * Normalizes an INR amount back to USD scale (used for budget comparisons against catalog).
 */
export function inrToUsd(inr: number): number {
  if (!inr || inr <= 0) return 0;
  return inr / USD_TO_INR_RATE;
}

/**
 * Formats a numeric INR amount using Indian currency notation (e.g. ₹40,000).
 */
export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Not specified";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/**
 * Convenience helper: Takes a DummyJSON USD price and returns the formatted INR string.
 */
export function formatUSDAsINR(usdPrice: number | null | undefined): string {
  if (usdPrice === null || usdPrice === undefined || isNaN(usdPrice)) {
    return "—";
  }
  return formatINR(usdToInr(usdPrice));
}
