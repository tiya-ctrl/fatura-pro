// Fatura Pro - Public payment endpoints (Business plan)
// GET  /api/pay?id=INV-123        -> ملخص آمن للفاتورة
// POST /api/pay  {invoiceId}      -> إنشاء جلسة Checkout
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ZERO_DECIMAL = ["jpy", "krw", "vnd"];

export default async function handler(req, res) {
  // --- ملخص عام للفاتورة ---
  if (req.method === "GET") {
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: "Missing id" });
    const { data: inv, error } = await supabaseAdmin
      .from("invoices")
      .select("id, user_id, seller_name, client, total, currency, status, date, due")
      .eq("id", id).maybeSingle();
    if (error || !inv) return res.status(404).json({ error: "Invoice not found" });
    const { data: acct } = await supabaseAdmin
      .from("stripe_accounts").select("onboarded").eq("user_id", inv.user_id).maybeSingle();
    const { user_id, ...safe } = inv;
    return res.status(200).json({ ...safe, payments_enabled: !!acct?.onboarded });
  }

  // --- إنشاء جلسة الدفع ---
  if (req.method === "POST") {
    try {
      const { invoiceId } = req.body || {};
      if (!invoiceId) return res.status(400).json({ error: "Missing invoice id" });

      const { data: inv, error } = await supabaseAdmin
        .from("invoices").select("*").eq("id", invoiceId).maybeSingle();
      if (error || !inv) return res.status(404).json({ error: "Invoice not found" });
      if (inv.status === "paid") return res.status(400).json({ error: "Invoice already paid" });

      const { data: acct } = await supabaseAdmin
        .from("stripe_accounts").select("*").eq("user_id", inv.user_id).maybeSingle();
      if (!acct?.onboarded) return res.status(400).json({ error: "Seller has not enabled online payments" });

      const currency = (inv.currency || "EUR").toLowerCase();
      const amount = ZERO_DECIMAL.includes(currency)
        ? Math.round(Number(inv.total))
        : Math.round(Number(inv.total) * 100);
      if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

      const origin = req.headers.origin || "https://faturapro.app";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency,
            product_data: { name: "Invoice " + inv.id + (inv.seller_name ? " — " + inv.seller_name : "") },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        metadata: { invoice_id: inv.id },
        success_url: origin + "/pay/" + encodeURIComponent(inv.id) + "?paid=1",
        cancel_url: origin + "/pay/" + encodeURIComponent(inv.id) + "?canceled=1",
      }, { stripeAccount: acct.stripe_account_id });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error("pay:", err.message);
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  return res.status(405).end();
}
