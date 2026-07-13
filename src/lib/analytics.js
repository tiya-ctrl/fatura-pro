// Fatura Pro - Advanced analytics (Business plan)
// كل الحسابات على فواتير التطبيق الموجودة - لا قاعدة بيانات جديدة

// إيرادات آخر 12 شهر (المدفوعة فقط = إيراد حقيقي)
export function monthlyRevenue(invoices) {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    months.push({ key, label: d.toLocaleString("en", { month: "short" }), total: 0 });
  }
  (invoices || []).forEach((inv) => {
    if (inv.status !== "paid" || !inv.date) return;
    const key = inv.date.slice(0, 7);
    const m = months.find((x) => x.key === key);
    if (m) m.total += Number(inv.total) || 0;
  });
  return months;
}

// أفضل 5 عملاء بالإيراد المدفوع
export function topClients(invoices, limit = 5) {
  const map = {};
  (invoices || []).forEach((inv) => {
    if (inv.status !== "paid" || !inv.client) return;
    map[inv.client] = (map[inv.client] || 0) + (Number(inv.total) || 0);
  });
  return Object.entries(map)
    .map(([client, total]) => ({ client, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// متوسط أيام السداد: من تاريخ الفاتورة لتاريخ الاستحقاق للفواتير المدفوعة
// (تقريب عملي: التطبيق لا يخزن تاريخ الدفع الفعلي حالياً)
export function avgPaymentDays(invoices) {
  const paid = (invoices || []).filter((i) => i.status === "paid" && i.date && i.due);
  if (!paid.length) return null;
  const days = paid.map((i) => Math.max(0, (new Date(i.due) - new Date(i.date)) / 86400000));
  return Math.round(days.reduce((a, b) => a + b, 0) / days.length);
}

// معدلات التحصيل
export function collectionStats(invoices) {
  const list = invoices || [];
  const count = (s) => list.filter((i) => i.status === s).length;
  const sum = (s) => list.filter((i) => i.status === s).reduce((a, i) => a + (Number(i.total) || 0), 0);
  return {
    paid: { count: count("paid"), total: sum("paid") },
    pending: { count: count("pending"), total: sum("pending") },
    overdue: { count: count("overdue"), total: sum("overdue") },
  };
}

// توزيع الإيراد حسب العملة
export function revenueByCurrency(invoices) {
  const map = {};
  (invoices || []).forEach((inv) => {
    if (inv.status !== "paid") return;
    const c = inv.currency || "EUR";
    map[c] = (map[c] || 0) + (Number(inv.total) || 0);
  });
  return Object.entries(map).map(([currency, total]) => ({ currency, total })).sort((a, b) => b.total - a.total);
}
