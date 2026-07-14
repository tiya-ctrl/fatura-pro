// Fatura Pro - Recurring invoices (Business plan)
import { supabase } from "../supabase";

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
export function nextDate(from, frequency) {
  const d = new Date(from);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "biweekly") d.setDate(d.getDate() + 14);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}
