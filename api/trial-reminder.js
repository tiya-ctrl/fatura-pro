import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { runAutomaticAmbassadorPayouts } from "../server/ambassador-commissions.js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default async function handler(req, res) {

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(503).json({ error: "Scheduled task is not configured" });
  }
  if (req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const { data: users } = await supabase
    .from("user_plans")
    .select("user_id, trial_end")
    .eq("plan", "free")
    .gte("trial_end", tomorrow.toISOString())
    .lte("trial_end", dayAfter.toISOString());

  let sent = 0;
  for (const u of users || []) {
    const { data: { user } } = await supabase.auth.admin.getUserById(u.user_id);
    if (!user?.email) continue;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Fatūra Pro <noreply@faturapro.app>",
        to: user.email,
        subject: "Your Fatūra Pro trial ends tomorrow",
        html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
          <h2 style="color:#c9a84c">Your Pro trial ends tomorrow ⚡</h2>
          <p>Hi there,</p>
          <p>Your 7-day free Pro trial on <strong>Fatūra Pro</strong> expires tomorrow.</p>
          <p>Don't lose access to:</p>
          <ul>
            <li>Unlimited invoices & clients</li>
            <li>PDF export</li>
            <li>Payment reminders</li>
            <li>Multi-currency support</li>
          </ul>
          <p style="margin:24px 0">
            <a href="https://buy.stripe.com/fZu4gzepGdT05Gx48j5ZC00" style="background:#c9a84c;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
              Continue with Pro — €9/month →
            </a>
          </p>
          <p style="color:#999;font-size:12px">Fatūra Pro · faturapro.app</p>
        </div>`
      })
    });
    sent++;
  }

  let payouts = [];
  try {
    if (!stripe) throw new Error("Stripe is not configured");
    payouts = await runAutomaticAmbassadorPayouts(stripe, supabase);
  } catch (error) {
    console.error("Automatic ambassador payouts:", error?.message || error);
  }

  res.status(200).json({ sent, ambassadorPayouts: payouts.filter(item => item.paid).length });
}
