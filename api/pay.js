// Fatura Pro - Public payment endpoints (Business plan)
// GET  /api/pay?id=INV-123        -> ملخص آمن للفاتورة
// POST /api/pay  {invoiceId}      -> إنشاء جلسة Checkout
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { safeOrigin, clientIp, createRateLimiter } from "../server/request-safety.js";
import { hasAdvancedAccess } from "../server/plan-access.js";

// A real customer opens one payment link a few times; guessing invoice ids needs many.
const invoiceLookupLimited = createRateLimiter(40, 10 * 60 * 1000);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ZERO_DECIMAL = ["jpy", "krw", "vnd"];

export default async function handler(req, res) {
  // Reuse this existing function for lightweight visitor geolocation so the
  // Hobby deployment stays within Vercel's serverless-function limit.
  if (req.method === "GET" && req.query?.action === "location") {
    const code = String(req.headers["x-vercel-ip-country"] || "").trim().toUpperCase();
    const validCode = /^[A-Z]{2}$/.test(code) ? code : null;
    let country = null;
    if (validCode) {
      try {
        country = new Intl.DisplayNames(["en"], { type: "region" }).of(validCode) || null;
      } catch {
        country = null;
      }
    }
    res.setHeader("Cache-Control", "private, no-store");
    return res.status(200).json({ countryCode: validCode, country });
  }

  if ((req.method === "GET" || req.method === "POST") && invoiceLookupLimited(clientIp(req))) {
    return res.status(429).json({ error: "Too many requests. Please try again in a few minutes." });
  }

  // --- ملخص عام للفاتورة ---
  if (req.method === "GET") {
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ error: "Missing id" });
    const { data: inv, error } = await supabaseAdmin
      .from("invoices")
      .select("id, user_id, seller_name, client, total, currency, status, date, due, document_language")
      .eq("id", id).maybeSingle();
    if (error || !inv) return res.status(404).json({ error: "Invoice not found" });
    const { data: acct } = await supabaseAdmin
      .from("stripe_accounts").select("onboarded").eq("user_id", inv.user_id).maybeSingle();
    res.setHeader("Cache-Control", "private, no-store");
    // Invoice details are only public when the seller has turned on online payments
    // (that is the only case where they share a payment link) and is on Advanced.
    // Otherwise we return just enough for the page to say online payment is not available.
    const sellerAdvanced = acct?.onboarded
      ? await hasAdvancedAccess(supabaseAdmin, inv.user_id).catch(() => false)
      : false;
    if (!acct?.onboarded || !sellerAdvanced) {
      return res.status(200).json({
        id: inv.id,
        status: inv.status,
        document_language: inv.document_language,
        payments_enabled: false,
      });
    }
    const { user_id, ...safe } = inv;
    return res.status(200).json({ ...safe, payments_enabled: true });
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
      if (!(await hasAdvancedAccess(supabaseAdmin, inv.user_id))) {
        return res.status(400).json({ error: "Seller has not enabled online payments" });
      }

      const currency = (inv.currency || "EUR").toLowerCase();
      const amount = ZERO_DECIMAL.includes(currency)
        ? Math.round(Number(inv.total))
        : Math.round(Number(inv.total) * 100);
      if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

      const origin = safeOrigin(req);
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
