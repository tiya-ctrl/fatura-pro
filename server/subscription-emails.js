// Subscription emails: a confirmation when someone subscribes (or starts the
// Advanced trial), a notice to the FaturaPro team, and a reminder the day before
// a paid Stripe trial turns into a charge.
import { EMAIL_BRAND_HEADER, ambassadorAdminEmails, htmlEscape, sendEmail } from "./email.js";

const PORTAL_URL = "https://billing.stripe.com/p/login/fZu4gzepGdT05Gx48j5ZC00";
const PRICES = { business: { name: "Advanced", amount: "€19" }, pro: { name: "Essential", amount: "€9" } };

const day = (ts) => new Date(ts * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function layout(title, paragraphs, button) {
  return [
    '<div style="background:#0d0d0d;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">',
    '<div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">',
    EMAIL_BRAND_HEADER,
    '<div style="height:1px;background:#2a2a2a;margin:20px 0 24px;"></div>',
    '<h1 style="color:#ffffff;font-size:20px;margin:0 0 16px;font-weight:600;">' + title + "</h1>",
    ...paragraphs.map((p) => '<p style="color:#c9c9c9;font-size:15px;line-height:1.6;margin:0 0 16px;">' + p + "</p>"),
    button ? '<a href="' + button.href + '" style="display:inline-block;background:#6366F1;color:#0d0d0d;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">' + button.label + "</a>" : "",
    '<div style="height:1px;background:#2a2a2a;margin:28px 0 20px;"></div>',
    '<p style="color:#7a7a7a;font-size:13px;line-height:1.6;margin:0;">Questions? Reply to this email or write to <a href="mailto:support@faturapro.app" style="color:#6366F1;text-decoration:none;">support@faturapro.app</a>.</p>',
    "</div></div>",
  ].join("");
}

// After checkout.session.completed. sub is the Stripe subscription (after any
// repeat-trial correction), plan is "business" or "pro".
export async function sendSubscriptionStarted({ to, plan, sub }) {
  const price = PRICES[plan] || PRICES.pro;
  const trialing = sub && sub.status === "trialing" && sub.trial_end;
  const subject = trialing
    ? "Your 7-day " + price.name + " trial has started | Fatūra Pro"
    : "Welcome to " + price.name + " | Fatūra Pro";
  const html = trialing
    ? layout("Your " + price.name + " trial has started", [
        "You now have full access to <strong style=\"color:#6366F1;\">" + price.name + "</strong>, free until <strong style=\"color:#ffffff;\">" + day(sub.trial_end) + "</strong>.",
        "After that, <strong style=\"color:#ffffff;\">" + price.amount + " per month</strong> is charged automatically to the card you entered. We will email you the day before.",
        "Not for you? Cancel any time before " + day(sub.trial_end) + " and you will not be charged. <a href=\"" + PORTAL_URL + "\" style=\"color:#6366F1;\">Manage or cancel your subscription</a>.",
      ], { href: "https://faturapro.app/app", label: "Open FaturaPro" })
    : layout("Welcome to " + price.name, [
        "Your <strong style=\"color:#6366F1;\">" + price.name + "</strong> subscription is active: " + price.amount + " per month. Stripe sends the payment receipt separately.",
        "You can change or cancel your subscription any time. <a href=\"" + PORTAL_URL + "\" style=\"color:#6366F1;\">Manage your subscription</a>.",
      ], { href: "https://faturapro.app/app", label: "Open FaturaPro" });

  const results = await Promise.allSettled([
    to ? sendEmail({ to, subject, html }) : Promise.resolve({ sent: false }),
    ...ambassadorAdminEmails().map((admin) => sendEmail({
      to: admin,
      subject: (trialing ? "New " + price.name + " trial" : "New " + price.name + " subscriber") + ": " + (to || "unknown email"),
      html: layout(trialing ? "New trial" : "New subscriber", [
        "Email: <strong style=\"color:#ffffff;\">" + htmlEscape(to || "unknown") + "</strong>",
        "Plan: " + price.name + " (" + price.amount + "/month)",
        trialing ? "Trial ends " + day(sub.trial_end) + ", then charged automatically." : "Paid now.",
      ]),
    })),
  ]);
  return results.map((r) => (r.status === "fulfilled" ? "sent" : "failed: " + (r.reason?.message || r.reason)));
}

// Daily cron: remind everyone whose paid Stripe trial ends in the next 24–48 hours.
export async function sendTrialEndingReminders(stripe) {
  const now = Math.floor(Date.now() / 1000);
  const from = now + 24 * 3600;
  const until = now + 48 * 3600;
  let sent = 0;
  for await (const sub of stripe.subscriptions.list({ status: "trialing", limit: 100, expand: ["data.customer"] })) {
    if (!sub.trial_end || sub.trial_end < from || sub.trial_end >= until) continue;
    if (sub.cancel_at_period_end || sub.cancel_at) continue; // already cancelled, nothing will be charged
    const to = sub.customer && typeof sub.customer === "object" ? sub.customer.email : null;
    if (!to) continue;
    const item = sub.items && sub.items.data && sub.items.data[0];
    const plan = item && item.price && item.price.unit_amount === 1900 ? "business" : "pro";
    const price = PRICES[plan];
    await sendEmail({
      to,
      subject: "Your " + price.name + " trial ends tomorrow | Fatūra Pro",
      html: layout("Your " + price.name + " trial ends tomorrow", [
        "Your free " + price.name + " trial ends on <strong style=\"color:#ffffff;\">" + day(sub.trial_end) + "</strong>.",
        "Then <strong style=\"color:#ffffff;\">" + price.amount + " per month</strong> is charged automatically to your card, and you keep everything in " + price.name + ".",
        "Don't want to continue? Cancel before then and you will not be charged.",
      ], { href: PORTAL_URL, label: "Manage or cancel" }),
    });
    sent++;
  }
  return sent;
}
