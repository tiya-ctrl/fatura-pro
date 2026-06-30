export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "Fatūra Pro <noreply@faturapro.app>",
      to: email,
      subject: "You're on the Fatūra Business Plan waitlist! 🎉",
      html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px">
        <h2 style="color:#c9a84c">You're on the list! ✦</h2>
        <p>Hi there,</p>
        <p>Thank you for joining the <strong>Fatūra Business Plan</strong> waitlist. You'll be among the first to know when we launch.</p>
        <p>While you wait, you can enjoy <strong>Fatūra Pro</strong> — our full-featured invoicing plan for freelancers and entrepreneurs.</p>
        <p style="margin:24px 0">
          <a href="https://faturapro.app" style="background:#c9a84c;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Try Pro Free for 7 Days →
          </a>
        </p>
        <p style="color:#999;font-size:12px">Fatūra Pro · Professional Invoicing · faturapro.app</p>
      </div>`
    })
  });

  res.status(200).json({ ok: true });
}
