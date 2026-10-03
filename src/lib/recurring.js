// Fatura Pro - Recurring invoices (Business plan)
import { supabase } from "../supabase";
import { nextRecurringDate } from "./recurringDates";

export async function loadRecurring(userId) {
  const { data, error } = await supabase
    .from("recurring_invoices").select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("loadRecurring:", error.message); return []; }
  return data || [];
}

// إنشاء اشتراك متكرر من فاتورة موجودة
export async function createRecurring(invoice, frequency, userId) {
  // القالب: نسخة من الفاتورة بدون هويتها الفريدة
  const { id, status, ...template } = invoice;
  // The day of the month the schedule keeps (the cron reads it back).
  template.scheduleDay = new Date().getDate();
  const next = nextDate(new Date(), frequency);
  const { error } = await supabase.from("recurring_invoices").insert({
    user_id: userId,
    template,
    frequency,
    next_run: next.toISOString().split("T")[0],
    active: true,
  });
  if (error) { console.error("createRecurring:", error.message); return false; }
  return true;
}

export async function toggleRecurring(recId, active, userId) {
  const { error } = await supabase.from("recurring_invoices")
    .update({ active }).eq("id", recId).eq("user_id", userId);
  if (error) { console.error("toggleRecurring:", error.message); return false; }
  return true;
}

export async function deleteRecurring(recId, userId) {
  const { error } = await supabase.from("recurring_invoices")
    .delete().eq("id", recId).eq("user_id", userId);
  if (error) { console.error("deleteRecurring:", error.message); return false; }
  return true;
}

// حساب الموعد التالي
// from: a Date (the local calendar day is used) or "YYYY-MM-DD"
export function nextDate(from, frequency) {
  if (from instanceof Date) {
    const pad = (n) => String(n).padStart(2, "0");
    from = from.getFullYear() + "-" + pad(from.getMonth() + 1) + "-" + pad(from.getDate());
  }
  return nextRecurringDate(from, frequency);
}
