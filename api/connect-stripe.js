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

function safeOrigin(req) {
  const fallback = "https://faturapro.app";
  try {
    const url = new URL(req.headers.origin || fallback);
    const deploymentHost = String(process.env.VERCEL_URL || "").toLowerCase();
    const isLocal = process.env.NODE_ENV !== "production"
      && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    const allowed = url.hostname === "faturapro.app"
      || url.hostname === "www.faturapro.app"
      || (deploymentHost && url.hostname === deploymentHost)
      || isLocal;
    return allowed && (url.protocol === "https:" || url.protocol === "http:") ? url.origin : fallback;
  } catch {
    return fallback;
  }
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: "Invalid session" });

    if (req.query?.intent === "ambassador") {
      const { data: ambassador, error: ambassadorError } = await supabaseAdmin
        .from("ambassador_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (ambassadorError) throw ambassadorError;
      if (!ambassador || ambassador.status === "ended") return res.status(403).json({ error: "An approved ambassador account is required" });

      if (req.query?.action === "dashboard") {
        if (!ambassador.stripe_connected_account_id) return res.status(409).json({ error: "Connect your payout account first" });
        const login = await stripe.accounts.createLoginLink(ambassador.stripe_connected_account_id);
        return res.status(200).json({ url: login.url });
      }

      if (req.query?.action === "verify") {
        if (!ambassador.stripe_connected_account_id) return res.status(200).json({ connected: false });
        const account = await stripe.accounts.retrieve(ambassador.stripe_connected_account_id);
        const ready = !!(
          account.details_submitted
          && account.payouts_enabled
          && account.capabilities?.transfers === "active"
        );
        await supabaseAdmin.from("ambassador_accounts").update({
          payouts_enabled: ready,
          updated_at: new Date().toISOString(),
        }).eq("id", ambassador.id);
        return res.status(200).json({ connected: ready });
      }

      let accountId = ambassador.stripe_connected_account_id;
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          email: user.email,
          capabilities: { transfers: { requested: true } },
          business_profile: { url: "https://faturapro.app/ambassadors" },
          metadata: { fatura_ambassador_id: ambassador.id, fatura_user_id: user.id },
        });
        accountId = account.id;
        const saved = await supabaseAdmin.from("ambassador_accounts").update({
          stripe_connected_account_id: accountId,
          payouts_enabled: false,
          updated_at: new Date().toISOString(),
        }).eq("id", ambassador.id);
        if (saved.error) throw saved.error;
      }

      const origin = safeOrigin(req);
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: origin + "/ambassador?stripe=refresh",
        return_url: origin + "/ambassador?stripe=connected",
        type: "account_onboarding",
      });
      return res.status(200).json({ url: link.url });
    }

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

    const origin = safeOrigin(req);
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
