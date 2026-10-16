const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format an integer rupee amount as Indian currency. */
export function formatInr(rupees: number): string {
  return inr.format(rupees);
}
