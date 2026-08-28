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
