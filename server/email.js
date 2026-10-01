function normalizedEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function htmlEscape(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;",
  }[character]));
}

export function ambassadorAdminEmails() {
  return [...new Set(String(process.env.AMBASSADOR_ADMIN_EMAILS || "support@faturapro.app")
    .split(",")
    .map(normalizedEmail)
    .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))];
}

// Brand header for the dark email layouts: the logo mark on a light tile (the mark is
// dark navy) and "FaturaPro" as on the site. Plain characters only — some mail apps
// (Gmail on iOS) show HTML entities such as &umacr; literally.
export const EMAIL_BRAND_HEADER =
  '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>' +
  '<td style="background:#ffffff;border-radius:10px;padding:5px;line-height:0;"><img src="https://faturapro.app/fatura-logo.png" width="30" height="30" alt="FaturaPro" style="display:block;border:0;"></td>' +
  '<td style="padding-left:12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:21px;font-weight:700;color:#ffffff;">Fatura<span style="color:#5EEAD4;">Pro</span></td>' +
  "</tr></table>";

// One layout for every customer email: dark card, brand header, title, paragraphs (HTML),
// optional highlighted boxes, buttons and a small footer. Callers escape user values.
const FONT = "-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif";
export function emailBox(title, bodyHtml) {
  return '<div style="margin:0 0 18px;padding:16px 18px;border-radius:10px;background:#1d1d2a;border:1px solid #2f2f42;">' +
    (title ? '<div style="color:#ffffff;font-weight:600;font-size:15px;margin:0 0 6px;">' + title + "</div>" : "") +
    '<div style="color:#c9c9c9;font-size:14px;line-height:1.6;">' + bodyHtml + "</div></div>";
}
export function emailButton(href, label, secondary = false) {
  return '<a href="' + href + '" style="display:inline-block;margin:4px 8px 4px 0;background:' + (secondary ? "#2a2a3a" : "#6366F1") +
    ";color:" + (secondary ? "#ffffff" : "#0d0d0d") + ';text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:15px;">' + label + "</a>";
}
export function brandedEmail({ kicker = "", title, paragraphs = [], boxes = [], buttons = [], footer = "" }) {
  return [
    '<div style="background:#0d0d0d;padding:32px 16px;font-family:' + FONT + ';">',
    '<div style="max-width:540px;margin:0 auto;background:#141414;border:1px solid #2a2a2a;border-radius:12px;padding:32px;">',
    EMAIL_BRAND_HEADER,
    '<div style="height:1px;background:#2a2a2a;margin:20px 0 24px;"></div>',
    kicker ? '<div style="color:#7C6CF2;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">' + kicker + "</div>" : "",
    '<h1 style="color:#ffffff;font-size:21px;line-height:1.35;margin:0 0 16px;font-weight:600;">' + title + "</h1>",
    ...paragraphs.map((p) => '<p style="color:#c9c9c9;font-size:15px;line-height:1.65;margin:0 0 16px;">' + p + "</p>"),
    ...boxes,
    buttons.length ? '<div style="margin:8px 0 0;">' + buttons.join("") + "</div>" : "",
    '<div style="height:1px;background:#2a2a2a;margin:28px 0 18px;"></div>',
    '<p style="color:#7a7a7a;font-size:12.5px;line-height:1.6;margin:0;">' +
      (footer || 'Questions? Reply to this email or write to <a href="mailto:support@faturapro.app" style="color:#9d97f5;text-decoration:none;">support@faturapro.app</a>.') + "</p>",
    "</div></div>",
  ].join("");
}

export async function sendEmail(payload) {
  if (!process.env.RESEND_API_KEY) return { sent:false, reason:"email_not_configured" };
  const response = await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{ "Content-Type":"application/json", Authorization:`Bearer ${process.env.RESEND_API_KEY}` },
    body:JSON.stringify({
      from:process.env.RESEND_FROM || "Fatūra Pro <noreply@faturapro.app>",
      reply_to:"support@faturapro.app",
      ...payload,
    }),
  });
  if (!response.ok) throw new Error(`Email provider rejected the request (${response.status})`);
  const data = await response.json().catch(() => ({}));
  return { sent:true, id:data.id || null };
}

export async function sendAmbassadorAdminEmail(payload) {
  const recipients = ambassadorAdminEmails();
  const results = await Promise.allSettled(recipients.map(to => sendEmail({ ...payload, to })));
  const sent = results.filter(result => result.status === "fulfilled" && result.value?.sent).length;
  return { sent:sent > 0, sentCount:sent, recipientCount:recipients.length };
}
