import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { runAutomaticAmbassadorPayouts } from "../server/ambassador-commissions.js";
import { sendTrialEndingReminders } from "../server/subscription-emails.js";
import { runLifecycleEmails, unsubscribe, validUnsubscribe } from "../server/lifecycle-emails.js";
import { brandedEmail, emailButton } from "../server/email.js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const UNSUBSCRIBED_PAGE = (ok) => `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FaturaPro</title></head>
<body style="background:#0d0d0d;color:#e8e4dc;font-family:-apple-system,Segoe UI,Roboto,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px">
<div style="max-width:440px;text-align:center"><div style="color:#6366F1;font-size:22px;font-weight:700;margin-bottom:16px">Fatūra Pro</div>
${ok ? "<p>Je bent afgemeld. Je krijgt deze e-mails niet meer.</p><p style=\"color:#9a9690\">You are unsubscribed and won't receive these emails again.</p>"
     : "<p>Deze afmeldlink werkt niet. Mail ons op support@faturapro.app.</p><p style=\"color:#9a9690\">This unsubscribe link is not valid. Email support@faturapro.app.</p>"}
<a href="https://faturapro.app" style="color:#7C6CF2">faturapro.app</a></div></body></html>`;

export default async function handler(req, res) {

  // Unsubscribe link from lifecycle emails: signed per user, no login needed.
  if (req.query?.action === "unsubscribe") {
    const userId = String(req.query.u || "");
    let ok = false;
    if (validUnsubscribe(userId, req.query.t)) {
      try { await unsubscribe(supabase, userId); ok = true; } catch (error) { console.error("Unsubscribe:", error?.message || error); }
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(ok ? 200 : 400).send(UNSUBSCRIBED_PAGE(ok));
  }

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
    if (!user?.email || !user.email_confirmed_at) continue; // unconfirmed accounts can't use the trial

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Fatūra Pro <noreply@faturapro.app>",
        to: user.email,
        subject: "Your Essential trial ends tomorrow | Fatūra Pro",
        html: brandedEmail({
          title: "Your Essential trial ends tomorrow",
          paragraphs: [
            "Your 7-day free Essential trial on Fatūra Pro ends tomorrow. After that your account moves to the Free plan; nothing is deleted.",
            "Keep these with Essential (€9 per month):<br>• Unlimited invoices and clients<br>• Payment reminders by email and WhatsApp<br>• Deposits and partial payments<br>• UBL/XML export",
          ],
          buttons: [emailButton("https://buy.stripe.com/fZu4gzepGdT05Gx48j5ZC00?prefilled_email=" + encodeURIComponent(user.email) + "&client_reference_id=" + encodeURIComponent(u.user_id), "Continue with Essential →")],
        })
      })
    });
    sent++;
  }

  // Paid Stripe trials (card entered): remind the day before the first charge.
  let stripeTrialReminders = 0;
  try {
    if (stripe) stripeTrialReminders = await sendTrialEndingReminders(stripe);
  } catch (error) {
    console.error("Stripe trial reminders:", error?.message || error);
  }

  // Users who signed up but never invoiced, or went quiet (see server/lifecycle-emails.js).
  let lifecycle = [];
  try {
    lifecycle = await runLifecycleEmails(supabase);
  } catch (error) {
    console.error("Lifecycle emails:", error?.message || error);
  }

  let payouts = [];
  try {
    if (!stripe) throw new Error("Stripe is not configured");
    payouts = await runAutomaticAmbassadorPayouts(stripe, supabase);
  } catch (error) {
    console.error("Automatic ambassador payouts:", error?.message || error);
  }

  res.status(200).json({ sent, stripeTrialReminders, lifecycleEmails: lifecycle.length, ambassadorPayouts: payouts.filter(item => item.paid).length });
}
