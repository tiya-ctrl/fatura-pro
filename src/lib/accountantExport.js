// Fatura Pro - Accountant Export (Business plan)
// CSV files open correctly in Excel and keep Arabic text through a UTF-8 BOM.

const escapeCsvCell = (value) => {
  let text = value == null ? "" : String(value);
  // Prevent spreadsheet programs from executing user-entered text as a formula.
  if (typeof value === "string" && /^[=+\-@]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
};

function downloadCSV(headers, rows, filename) {
  const csv = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const href = URL.createObjectURL(blob);
  link.href = href;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 0);
}

export function exportInvoicesCSV(invoices, filename) {
  const headers = ["Invoice #", "Date", "Due Date", "Client", "Client Email", "Currency", "Subtotal", "Discount", "Tax", "Total", "Status"];
  const rows = (invoices || []).map((inv) => [
    inv.id || "",
    inv.date || "",
    inv.due || "",
    inv.client || "",
    inv.email || "",
    inv.currency || "",
    inv.subtotal ?? "",
    inv.discountAmt ?? "",
    inv.taxAmt ?? "",
    inv.total ?? inv.amount ?? "",
    inv.status || "",
  ]);

  const name = filename || "fatura-pro-invoices-" + new Date().toISOString().slice(0, 10) + ".csv";
  downloadCSV(headers, rows, name);
}

export function exportExpensesCSV(expenses, filename) {
  const headers = ["Date", "Supplier", "Description", "Category", "Reference", "Currency", "Net amount", "VAT rate (%)", "VAT amount", "Total amount", "Payment status"];
  const rows = (expenses || [])
    .slice()
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
    .map((expense) => [
      expense.date || "",
      expense.supplier || "",
      expense.description || "",
      expense.category || "",
      expense.reference || expense.invoice_reference || "",
      expense.currency || "EUR",
      Number(expense.amount_excl) || 0,
      Number(expense.vat_rate) || 0,
      Number(expense.vat_amount) || 0,
      Number(expense.amount_incl) || 0,
      expense.payment_status || "recorded",
    ]);

  const name = filename || "fatura-pro-expenses-" + new Date().toISOString().slice(0, 10) + ".csv";
  downloadCSV(headers, rows, name);
  return rows.length;
}
