// Fatura Pro - automatic invoice numbers.
// One series per user: PREFIX + next number + "-" + 4 digits, e.g. INV-010-4821.
// The number continues from the highest one already used with that prefix
// (not from the invoice count, which shifts when invoices are deleted).
// The short suffix keeps the id unique across all accounts, because the
// invoice number is also the invoice's id in the database.

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function cleanInvoicePrefix(prefix) {
  const value = String(prefix || "").trim();
  return value || "INV-";
}

export function nextInvoiceSequence(existingIds, prefix) {
  const series = new RegExp("^" + escapeRegExp(cleanInvoicePrefix(prefix)) + "(\\d+)(?:-|$)");
  let highest = 0;
  for (const id of existingIds || []) {
    const match = series.exec(String(id || ""));
    if (match) highest = Math.max(highest, Number(match[1]) || 0);
  }
  return highest + 1;
}

export function nextInvoiceId(existingIds, prefix) {
  const suffix = String(Date.now()).slice(-4);
  return cleanInvoicePrefix(prefix) + String(nextInvoiceSequence(existingIds, prefix)).padStart(3, "0") + "-" + suffix;
}
