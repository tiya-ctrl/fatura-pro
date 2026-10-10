// Default tax rate for a new account. 21% is the Dutch standard VAT rate; accounts known
// to be outside the Netherlands start at 0% and set their own rate once in Settings.
// An unknown country keeps 21%, as before.
export function defaultTaxForCountry(country) {
  const c = String(country || "").trim().toLowerCase();
  if (!c) return 21;
  return ["nl", "nld", "netherlands", "the netherlands", "nederland"].includes(c) ? 21 : 0;
}
