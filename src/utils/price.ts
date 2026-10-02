const CURRENCY_PREFIX = 'Rs.';

/** Parses a displayed price such as `"Rs. 500"` or `"Rs. 1,000"` into its amount (`500`, `1000`). */
export function parsePrice(text: string): number {
  const match = text.replace(/,/g, '').match(/\d+(\.\d+)?/);
  if (!match) {
    throw new Error(`Cannot parse price from: "${text}"`);
  }
  return Number(match[0]);
}

/** Formats an amount the way the shop displays it: `500` -> `"Rs. 500"`. */
export function formatPrice(amount: number): string {
  return `${CURRENCY_PREFIX} ${amount}`;
}

/** Expected line total for a cart row: `"Rs. 500"` x 4 -> `"Rs. 2000"`. */
export function multiplyPrice(price: string, quantity: number): string {
  return formatPrice(parsePrice(price) * quantity);
}
