// Fatura Pro - Recurring invoices generator (Business plan)
// يشتغل يومياً عبر Vercel Cron: يولد الفواتير المستحقة ويحدث المواعيد
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function nextDate(from, frequency) {
  const d = new Date(from);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

export default async function handler(req, res) {
  const today = new Date().toISOString().split("T")[0];

  // الاشتراكات النشطة المستحقة اليوم أو قبله (لو فات يوم لأي سبب، يتدارك)
  const { data: due, error } = await supabase
    .from("recurring_invoices")
    .select("*")
    .eq("active", true)
    .lte("next_run", today);

  if (error) return res.status(500).json({ error: error.message });
  if (!due || due.length === 0) return res.status(200).json({ generated: 0 });

  let generated = 0;
  for (const rec of due) {
    const t = rec.template || {};
    const invoiceId = "INV-R-" + Date.now().toString().slice(-6) + "-" + Math.random().toString(36).slice(2, 5).toUpperCase();

    const row = {
      id: invoiceId,
      user_id: rec.user_id,
      client: t.client, email: t.email,
      seller_name: t.sellerName, seller_email: t.sellerEmail, seller_phone: t.sellerPhone, seller_address: t.sellerAddress,
      buyer_phone: t.buyerPhone, buyer_address: t.buyerAddress,
      date: today,
      due: null,
      status: "pending",
      amount: t.amount, subtotal: t.subtotal, discount_amt: t.discountAmt, tax_amt: t.taxAmt, total: t.total,
      tax: t.tax, discount: t.discount, notes: t.notes, bank_info: t.bankInfo,
      currency: t.currency, items: t.items || [],
    };

    const { error: insErr } = await supabase.from("invoices").insert(row);
    if (insErr) { console.error("insert failed for", rec.id, insErr.message); continue; }

    await supabase.from("recurring_invoices").update({
      next_run: nextDate(rec.next_run, rec.frequency).toISOString().split("T")[0],
      last_generated_at: new Date().toISOString(),
    }).eq("id", rec.id);

    generated++;
  }

  return res.status(200).json({ generated });
}
