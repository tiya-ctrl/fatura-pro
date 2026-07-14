// Fatura Pro - Public invoice summary for payment page
// يرجع الحد الأدنى الآمن لعرض صفحة الدفع - بدون بيانات حساسة
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: "Missing id" });

  const { data: inv, error } = await supabaseAdmin
    .from("invoices")
    .select("id, seller_name, client, total, currency, status, date, due")
    .eq("id", id).maybeSingle();
  if (error || !inv) return res.status(404).json({ error: "Invoice not found" });

  // هل صاحبها فعّل الدفع؟
  const { data: fullInv } = await supabaseAdmin
    .from("invoices").select("user_id").eq("id", id).maybeSingle();
  const { data: acct } = await supabaseAdmin
    .from("stripe_accounts").select("onboarded").eq("user_id", fullInv.user_id).maybeSingle();

  return res.status(200).json({ ...inv, payments_enabled: !!acct?.onboarded });
}
