// Fatura Pro - Accountant Export (Business plan)
// يصدّر الفواتير كملف CSV يفتح بشكل صحيح في Excel (يدعم العربية عبر BOM)

export function exportInvoicesCSV(invoices, filename = "fatura-pro-invoices.csv") {
  const headers = ["Invoice #", "Date", "Due Date", "Client", "Currency", "Subtotal", "Tax", "Total", "Status"];
  const rows = (invoices || []).map((inv) => [
    inv.invoiceNumber || inv.number || inv.id || "",
    inv.date || inv.issueDate || "",
    inv.dueDate || "",
    inv.clientName || inv.client?.name || "",
    inv.currency || "",
    inv.subtotal ?? "",
    inv.tax ?? inv.taxAmount ?? "",
    inv.total ?? "",
    inv.status || "",
  ]);

  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");

  // \uFEFF = BOM حتى يقرأ Excel العربية صح
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
