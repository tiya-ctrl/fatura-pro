// Fatura Pro - Stripe Connect (Business plan)
// POST /api/connect-stripe                 -> إنشاء/متابعة ربط الحساب (رابط onboarding)
// POST /api/connect-stripe?action=verify   -> التحقق من اكتمال الربط وتفعيله تلقائياً
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: "Invalid session" });

    const { data: existing } = await supabaseAdmin
      .from("stripe_accounts").select("*").eq("user_id", user.id).maybeSingle();

    // --- التحقق والتفعيل التلقائي ---
    if (req.query?.action === "verify") {
      if (!existing?.stripe_account_id) return res.status(200).json({ onboarded: false });
      const account = await stripe.accounts.retrieve(existing.stripe_account_id);
      const ready = !!(account.charges_enabled || account.details_submitted);
      if (ready && !existing.onboarded) {
        await supabaseAdmin.from("stripe_accounts")
          .update({ onboarded: true }).eq("user_id", user.id);
      }
      return res.status(200).json({ onboarded: ready });
    }

    // --- إنشاء/متابعة الربط (المنطق الأصلي) ---
    let accountId = existing?.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      });
      accountId = account.id;
      await supabaseAdmin.from("stripe_accounts").upsert({
        user_id: user.id,
        stripe_account_id: accountId,
        onboarded: false,
      });
    }

    const origin = req.headers.origin || "https://faturapro.app";
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: origin + "/app?stripe=refresh",
      return_url: origin + "/app?stripe=connected",
      type: "account_onboarding",
    });

    return res.status(200).json({ url: link.url });
  } catch (err) {
    console.error("connect-stripe:", err.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
