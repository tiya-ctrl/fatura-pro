// Fatura Pro - Recurring invoices generator (Business plan)
// يشتغل يومياً عبر Vercel Cron: يولد الفواتير المستحقة ويحدث المواعيد
import { createClient } from "@supabase/supabase-js";
import { advancedUserIds } from "../server/plan-access.js";
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function nextDate(from, frequency) {
  const d = new Date(from);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "biweekly") d.setDate(d.getDate() + 14);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

// A new invoice gets the same payment term as the invoice it was copied from
// (due date minus invoice date), or 30 days when that is unknown.
function dueDateFor(template, today) {
  let days = 30;
  if (template.date && template.due) {
    const diff = Math.round((new Date(template.due) - new Date(template.date)) / 86400000);
    if (Number.isFinite(diff) && diff >= 0 && diff <= 365) days = diff;
  }
  const d = new Date(today + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

export default async function handler(req, res) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" automatically when
  // CRON_SECRET is set (trial-reminder already relies on it). Outside callers are refused.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!cronSecret) console.warn("cron-recurring: CRON_SECRET is not set; endpoint is unprotected");

  const today = new Date().toISOString().split("T")[0];

  // الاشتراكات النشطة المستحقة اليوم أو قبله (لو فات يوم لأي سبب، يتدارك)
  const { data: due, error } = await supabase
    .from("recurring_invoices")
    .select("*")
    .eq("active", true)
    .lte("next_run", today);

  if (error) return res.status(500).json({ error: error.message });
  if (!due || due.length === 0) return res.status(200).json({ generated: 0 });

  // Recurring invoices are an Advanced feature. When the owner is no longer on
  // Advanced, skip creating invoices but move the schedule past today, so that
  // after they subscribe again the schedule simply continues (no catch-up burst).
  // The recurring templates themselves are kept.
  let advanced;
  try {
    advanced = await advancedUserIds(supabase, due.map((rec) => rec.user_id));
  } catch (planErr) {
    return res.status(500).json({ error: "Could not check plans" });
  }

  let generated = 0;
  let paused = 0;
  for (const rec of due) {
    if (!advanced.has(rec.user_id)) {
      let next = nextDate(rec.next_run, rec.frequency);
      for (let i = 0; i < 1000 && next.toISOString().split("T")[0] <= today; i++) next = nextDate(next, rec.frequency);
      await supabase.from("recurring_invoices").update({
        next_run: next.toISOString().split("T")[0],
      }).eq("id", rec.id);
      paused++;
      continue;
    }

    const t = rec.template || {};
    const invoiceId = "INV-R-" + Date.now().toString().slice(-6) + "-" + Math.random().toString(36).slice(2, 5).toUpperCase();

    const row = {
      id: invoiceId,
      user_id: rec.user_id,
      created_by: t.createdBy || null,
      client: t.client, email: t.email,
      seller_name: t.sellerName, seller_email: t.sellerEmail, seller_phone: t.sellerPhone, seller_address: t.sellerAddress,
      seller_vat: t.sellerVat || null, seller_country: t.sellerCountry || null,
      buyer_phone: t.buyerPhone, buyer_address: t.buyerAddress, buyer_country: t.buyerCountry || null,
      date: today,
      due: dueDateFor(t, today),
      status: "pending",
      amount: t.amount, subtotal: t.subtotal, discount_amt: t.discountAmt, tax_amt: t.taxAmt, total: t.total,
      tax: t.tax, discount: t.discount, deposit_pct: Number(t.depositPct) || null, notes: t.notes, bank_info: t.bankInfo,
      currency: t.currency, document_language: t.documentLanguage || null, items: t.items || [],
    };
    if (t.sellerLogo) { row.seller_logo = t.sellerLogo; row.seller_logo_size = Number(t.sellerLogoSize) || null; }
    if (t.buyerLogo) { row.buyer_logo = t.buyerLogo; row.buyer_logo_size = Number(t.buyerLogoSize) || null; }

    const { error: insErr } = await supabase.from("invoices").insert(row);
    if (insErr) { console.error("insert failed for", rec.id, insErr.message); continue; }

    await supabase.from("recurring_invoices").update({
      next_run: nextDate(rec.next_run, rec.frequency).toISOString().split("T")[0],
      last_generated_at: new Date().toISOString(),
    }).eq("id", rec.id);

    generated++;
  }

  return res.status(200).json({ generated, paused });
}
