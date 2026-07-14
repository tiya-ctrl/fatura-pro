// Fatura Pro - Stripe Connect onboarding (Business plan)
// ينشئ حساب Connect للمستخدم ويرجع رابط onboarding من Stripe
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
    // نتحقق من هوية المستخدم عبر توكن الجلسة المرسل من التطبيق
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) return res.status(401).json({ error: "Invalid session" });

    // موجود ربط سابق؟ نستخدمه، وإلا ننشئ حساب Connect جديد
    const { data: existing } = await supabaseAdmin
      .from("stripe_accounts").select("*").eq("user_id", user.id).maybeSingle();

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

    // رابط onboarding يكمل فيه المستخدم بياناته عند Stripe
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
