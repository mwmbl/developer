export const FREE_ANON_REQUESTS = 1000;
export const FREE_KEY_REQUESTS = 2000;
export const CENTS_PER_1000_REQUESTS = 500; // $5 / 1,000 requests

// Echoes the old Starter/Pro price points so returning users see familiar numbers.
export const SPEND_LIMIT_PRESETS_CENTS = [1000, 2500, 5000];

export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  return dollars % 1 === 0
    ? `$${dollars.toFixed(0)}`
    : `$${dollars.toFixed(2)}`;
}

export function requestsForSpendCents(cents: number): number {
  return Math.floor(cents / CENTS_PER_1000_REQUESTS) * 1000;
}
