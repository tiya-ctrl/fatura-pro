// Fatura Pro - Accountant Export (Business plan)
// يصدّر الفواتير كملف CSV يفتح صح في Excel (يدعم العربية عبر BOM)

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

  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");

  const name = filename || "fatura-pro-invoices-" + new Date().toISOString().slice(0, 10) + ".csv";
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}
