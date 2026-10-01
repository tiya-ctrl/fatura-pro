// Lifecycle emails for signed-up users who never got going or went quiet.
// Run once a day from /api/trial-reminder. Each email goes to a person at most
// once (timestamps on user_onboarding), and every email has an unsubscribe link.
import crypto from "node:crypto";
import { EMAIL_BRAND_HEADER, ambassadorAdminEmails, htmlEscape, sendEmail } from "./email.js";

const DAY = 86400000;
const SITE = "https://faturapro.app";
const MAX_PER_RUN = 50;

// Accounts that never receive lifecycle emails (owner and test accounts), comma separated.
const excluded = () => new Set(String(process.env.LIFECYCLE_EXCLUDE || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));

export function unsubscribeToken(userId) {
  return crypto.createHmac("sha256", process.env.CRON_SECRET || "").update("unsubscribe:" + userId).digest("hex").slice(0, 32);
}
export function unsubscribeUrl(userId) {
  return SITE + "/api/trial-reminder?action=unsubscribe&u=" + encodeURIComponent(userId) + "&t=" + unsubscribeToken(userId);
}
export function validUnsubscribe(userId, token) {
  if (!userId || !token || !process.env.CRON_SECRET) return false;
  const expected = Buffer.from(unsubscribeToken(userId));
  const given = Buffer.from(String(token));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

// Dutch only for people who write their invoices in Dutch; a Dutch address says little
// (many users are expats who work in English). Everyone else gets English.
const langFor = (invoiceLang) => (invoiceLang === "nl" ? "nl" : "en");

// Pure selection, so it can be tested without a database.
// users: [{ id, email, created_at, last_sign_in_at, email_confirmed_at }]
// invoiceCount: Map userId -> number; onboarding: Map userId -> row; teamMembers: Set userId; invoiceLangs: Map userId -> most used invoice language
export function selectLifecycleEmails({ users, invoiceCount, onboarding, teamMembers, invoiceLangs = new Map(), now = Date.now(), skip = excluded() }) {
  const picks = [];
  for (const u of users) {
    if (!u.email || !u.email_confirmed_at) continue;
    if (skip.has(u.email.toLowerCase())) continue;
    if (teamMembers.has(u.id)) continue; // team members work in the owner's account
    const row = onboarding.get(u.id) || {};
    if (row.emails_unsubscribed_at) continue;
    const invoices = invoiceCount.get(u.id) || 0;
    const age = now - new Date(u.created_at).getTime();
    const lastIn = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : new Date(u.created_at).getTime();
    const lang = langFor(invoiceLangs.get(u.id));
    let key = null;
    if (invoices === 0) {
      if (!row.email_1_sent_at && age >= 2 * DAY) key = "email_1";
      else if (row.email_1_sent_at && !row.email_2_sent_at && now - new Date(row.email_1_sent_at).getTime() >= 5 * DAY) key = "email_2";
    } else if (!row.winback_sent_at && now - lastIn >= 30 * DAY) {
      key = "winback";
    }
    if (key) picks.push({ user: u, key, lang });
  }
  return picks.slice(0, MAX_PER_RUN);
}

function layout(lang, title, paragraphs, button, userId) {
  const foot = lang === "nl"
    ? "Je krijgt deze e-mail omdat je een FaturaPro-account hebt. <a href=\"" + unsubscribeUrl(userId) + "\" style=\"color:#7a7a7a;\">Afmelden voor deze e-mails</a>."
    : "You get this email because you have a FaturaPro account. <a href=\"" + unsubscribeUrl(userId) + "\" style=\"color:#7a7a7a;\">Unsubscribe from these emails</a>.";
  return [
    '<div style="background:#0d0d0d;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">',
    '<div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">',
    EMAIL_BRAND_HEADER,
    '<div style="height:1px;background:#2a2a2a;margin:20px 0 24px;"></div>',
    '<h1 style="color:#ffffff;font-size:21px;margin:0 0 16px;font-weight:600;">' + title + "</h1>",
    ...paragraphs.map((p) => '<p style="color:#c9c9c9;font-size:15px;line-height:1.65;margin:0 0 16px;">' + p + "</p>"),
    '<a href="' + button.href + '" style="display:inline-block;margin-top:6px;background:#6366F1;color:#0d0d0d;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">' + button.label + "</a>",
    '<div style="height:1px;background:#2a2a2a;margin:28px 0 18px;"></div>',
    '<p style="color:#7a7a7a;font-size:12.5px;line-height:1.6;margin:0;">' + foot + "</p>",
    "</div></div>",
  ].join("");
}

const APP = (campaign) => SITE + "/app?utm_source=email&utm_medium=lifecycle&utm_campaign=" + campaign;

export function lifecycleEmail({ key, lang, user }) {
  const nl = lang === "nl";
  if (key === "email_1") {
    return {
      subject: nl ? "Je eerste factuur staat binnen 1 minuut klaar" : "Your first invoice is one minute away",
      html: layout(lang, nl ? "Je eerste factuur in 1 minuut" : "Your first invoice in one minute", nl ? [
        "Je hebt een FaturaPro-account, maar nog geen factuur gemaakt. Zo doe je dat in een minuut:",
        "1. Vul één keer je bedrijfsgegevens en je logo in.<br>2. Voeg een klant toe.<br>3. Vul bedrag en omschrijving in: de btw rekent FaturaPro uit en je krijgt een strakke PDF.",
        "Ergens vastgelopen? Beantwoord deze e-mail, we helpen je graag.",
      ] : [
        "You have a FaturaPro account but haven't created an invoice yet. Here's how to do it in a minute:",
        "1. Add your business details and logo once.<br>2. Add a client.<br>3. Enter the amount and description: FaturaPro calculates the VAT and gives you a clean PDF.",
        "Stuck somewhere? Just reply to this email and we'll help.",
      ], { href: APP("first_invoice"), label: nl ? "Maak je eerste factuur" : "Create your first invoice" }, user.id),
    };
  }
  if (key === "email_2") {
    return {
      subject: nl ? "Kunnen we je ergens mee helpen?" : "Can we help you get started?",
      html: layout(lang, nl ? "Kunnen we je ergens mee helpen?" : "Can we help you get started?", nl ? [
        "We zagen dat je nog geen factuur hebt gemaakt in FaturaPro. Misschien had je geen tijd, of liep je ergens tegenaan. Laat het ons weten: beantwoord deze e-mail met één zin en we denken met je mee.",
        "Handig om te weten: je kunt klanten een herinnering sturen via WhatsApp of mail, factureren in 18 valuta en een creditnota maken, allemaal ook in het gratis plan.",
      ] : [
        "We noticed you haven't created an invoice in FaturaPro yet. Maybe there was no time, or something got in the way. Let us know: reply to this email with one sentence and we'll help.",
        "Good to know: you can send payment reminders by WhatsApp or email, invoice in 18 currencies and make credit notes, all included in the free plan.",
      ], { href: APP("help_start"), label: nl ? "Open FaturaPro" : "Open FaturaPro" }, user.id),
    };
  }
  return {
    subject: nl ? "Nieuw in FaturaPro: bonnetjes scannen en meer" : "New in FaturaPro: receipt scanning and more",
    html: layout(lang, nl ? "Er is veel nieuw sinds je laatste bezoek" : "A lot is new since your last visit", nl ? [
      "📸 <strong style=\"color:#fff;\">Bonnetjes scannen</strong>: maak een foto van je bon en datum, leverancier, bedrag en btw worden automatisch ingevuld (Advanced).",
      "💬 <strong style=\"color:#fff;\">Herinneringen via WhatsApp of mail</strong>, met factuurnummer en bedrag al ingevuld, in 5 talen.",
      "📊 <strong style=\"color:#fff;\">Btw-overzicht per kwartaal</strong>, handig voor je aangifte vóór 31 oktober (Advanced).",
      "Je facturen en klanten staan nog precies waar je ze hebt achtergelaten.",
    ] : [
      "📸 <strong style=\"color:#fff;\">Receipt scanning</strong>: photograph a receipt and the date, supplier, amount and VAT fill themselves in (Advanced).",
      "💬 <strong style=\"color:#fff;\">Payment reminders by WhatsApp or email</strong>, with the invoice number and amount filled in, in 5 languages.",
      "📊 <strong style=\"color:#fff;\">Quarterly VAT summary</strong> for your VAT return (Advanced).",
      "Your invoices and clients are exactly where you left them.",
    ], { href: APP("winback"), label: nl ? "Bekijk wat er nieuw is" : "See what's new" }, user.id),
  };
}

const COLUMN = { email_1: "email_1_sent_at", email_2: "email_2_sent_at", winback: "winback_sent_at" };

export async function runLifecycleEmails(supabaseAdmin) {
  const users = [];
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  const [inv, onb, team] = await Promise.all([
    supabaseAdmin.from("invoices").select("user_id, document_language"),
    supabaseAdmin.from("user_onboarding").select("user_id, email_1_sent_at, email_2_sent_at, winback_sent_at, emails_unsubscribed_at"),
    supabaseAdmin.from("team_members").select("member_user_id").eq("status", "active"),
  ]);
  const firstError = inv.error || onb.error || team.error;
  if (firstError) throw firstError;

  const invoiceCount = new Map();
  const langCounts = new Map();
  for (const row of inv.data || []) {
    invoiceCount.set(row.user_id, (invoiceCount.get(row.user_id) || 0) + 1);
    const counts = langCounts.get(row.user_id) || {};
    const lang = row.document_language || "en";
    counts[lang] = (counts[lang] || 0) + 1;
    langCounts.set(row.user_id, counts);
  }
  const invoiceLangs = new Map([...langCounts].map(([id, counts]) => [id, Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]]));
  const picks = selectLifecycleEmails({
    users,
    invoiceCount,
    onboarding: new Map((onb.data || []).map((r) => [r.user_id, r])),
    teamMembers: new Set((team.data || []).map((r) => r.member_user_id).filter(Boolean)),
    invoiceLangs,
  });

  const sent = [];
  for (const pick of picks) {
    const mail = lifecycleEmail(pick);
    try {
      await sendEmail({ to: pick.user.email, subject: mail.subject, html: mail.html });
      const now = new Date().toISOString();
      const { error } = await supabaseAdmin.from("user_onboarding")
        .upsert({ user_id: pick.user.id, [COLUMN[pick.key]]: now, updated_at: now }, { onConflict: "user_id" });
      if (error) throw error;
      sent.push(pick.key + " → " + pick.user.email);
    } catch (error) {
      sent.push(pick.key + " FAILED → " + pick.user.email + " (" + (error?.message || error) + ")");
    }
  }

  if (sent.length) {
    await Promise.allSettled(ambassadorAdminEmails().map((to) => sendEmail({
      to,
      subject: "Lifecycle emails sent today: " + sent.length,
      html: "<div style=\"font-family:sans-serif;font-size:14px;line-height:1.6\"><p>Sent by the daily job:</p><ul>" + sent.map((s) => "<li>" + htmlEscape(s) + "</li>").join("") + "</ul></div>",
    })));
  }
  return sent;
}

export async function unsubscribe(supabaseAdmin, userId) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("user_onboarding")
    .upsert({ user_id: userId, emails_unsubscribed_at: now, updated_at: now }, { onConflict: "user_id" });
  if (error) throw error;
}
