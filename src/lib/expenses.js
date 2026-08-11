// Fatura Pro - Expenses + VAT report (Business plan)
import { supabase } from "../supabase";

export async function loadExpenses(userId) {
  const { data, error } = await supabase
    .from("expenses").select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (error) { console.error("loadExpenses:", error.message); return []; }
  return data || [];
}

export async function saveExpense(expense, userId) {
  const row = { ...expense, user_id: userId };
  const { error } = await supabase.from("expenses").upsert(row);
  if (error) { console.error("saveExpense:", error.message); return false; }
  return true;
}

export async function deleteExpense(expenseId, userId) {
  const { error } = await supabase.from("expenses")
    .delete().eq("id", expenseId).eq("user_id", userId);
  if (error) { console.error("deleteExpense:", error.message); return false; }
  return true;
}

// تقرير VAT ربع سنوي: يجمع ضريبة الفواتير (المحصلة) مقابل ضريبة المصاريف (المدفوعة)
// invoices: فواتير التطبيق الحالية | expenses: المصاريف | year, quarter: الفترة
export function vatReport(invoices, expenses, year, quarter, code) {
  // Currencies are never mixed: when code is given, only documents in that
  // currency are counted. Without it, everything is counted (legacy calls).
  const sameCur = (x) => !code || (x.currency || "EUR") === code;
  const qStart = new Date(year, (quarter - 1) * 3, 1);
  const qEnd = new Date(year, quarter * 3, 0, 23, 59, 59);
  const inRange = (d) => { const x = new Date(d); return x >= qStart && x <= qEnd; };

  // الفواتير: نحسب المدفوعة + المعلقة (استحقاق)، حسب تاريخ الفاتورة
  const relevantInvoices = (invoices || []).filter(i => i.date && inRange(i.date) && i.status !== "draft" && sameCur(i));
  const vatCollected = relevantInvoices.reduce((a, i) => a + (Number(i.taxAmt) || 0), 0);
  const revenueExcl = relevantInvoices.reduce((a, i) => a + ((Number(i.total) || 0) - (Number(i.taxAmt) || 0)), 0);

  const relevantExpenses = (expenses || []).filter(e => e.date && inRange(e.date) && sameCur(e));
  const vatPaid = relevantExpenses.reduce((a, e) => a + (Number(e.vat_amount) || 0), 0);
  const expensesExcl = relevantExpenses.reduce((a, e) => a + (Number(e.amount_excl) || 0), 0);

  return {
    year, quarter,
    revenueExcl, vatCollected,
    expensesExcl, vatPaid,
    vatDue: vatCollected - vatPaid, // موجب = تدفعين للضرائب، سالب = يرجعون لك
    invoiceCount: relevantInvoices.length,
    expenseCount: relevantExpenses.length,
  };
}
