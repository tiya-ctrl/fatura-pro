// Fatura Pro - Create Checkout session for an invoice (Business plan)
// ينادى من صفحة الدفع العامة: ينشئ جلسة دفع لفاتورة محددة على حساب صاحبها
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// عملات بدون كسور عند Stripe (المبلغ يرسل كما هو، مش ×100)
const ZERO_DECIMAL = ["jpy", "krw", "vnd"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { invoiceId } = req.body || {};
    if (!invoiceId) return res.status(400).json({ error: "Missing invoice id" });

    // نجيب الفاتورة من السيرفر (مصدر الحقيقة للمبلغ - لا نثق بأي مبلغ من المتصفح)
    const { data: inv, error } = await supabaseAdmin
      .from("invoices").select("*").eq("id", invoiceId).maybeSingle();
    if (error || !inv) return res.status(404).json({ error: "Invoice not found" });
    if (inv.status === "paid") return res.status(400).json({ error: "Invoice already paid" });

    // حساب Stripe حق صاحب الفاتورة (لازم يكون مكمل الربط)
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
    }, {
      stripeAccount: acct.stripe_account_id, // الفلوس تروح لحساب صاحب الفاتورة مباشرة
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("create-payment:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
