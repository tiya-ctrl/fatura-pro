// Fatura Pro - Send team invite email (Business plan)
// ينادى من التطبيق عند دعوة عضو: يتحقق من هوية المالك ويرسل إيميل دعوة عبر Resend
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Invalid session" });

    const { email } = req.body || {};
    const invitee = (email || "").trim().toLowerCase();
    if (!invitee.includes("@")) return res.status(400).json({ error: "Invalid email" });

    // نتأكد أن الدعوة موجودة فعلاً وأن المرسل هو صاحبها
    const { data: invite } = await supabaseAdmin
      .from("team_members").select("id")
      .eq("owner_id", user.id).eq("member_email", invitee).maybeSingle();
    if (!invite) return res.status(404).json({ error: "Invite not found" });

    const origin = req.headers.origin || "https://faturapro.app";
    const inviterName = user.email || "A Fatūra Pro user";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Fatūra Pro <noreply@faturapro.app>",
        to: invitee,
        subject: "You've been invited to a team on Fatūra Pro",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 8px">You're invited 🎉</h2>
            <p style="color:#555;line-height:1.6">
              <b>${inviterName}</b> invited you to join their team on <b>Fatūra Pro</b> — you'll be able to work on their invoices, clients and quotes.
            </p>
            <p style="color:#555;line-height:1.6">
              Sign up (or log in) with <b>${invitee}</b> and you'll join the team automatically.
            </p>
            <a href="${origin}/register?invite=1" style="display:inline-block;margin:16px 0;padding:12px 22px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:8px;font-weight:700">
              Join the team →
            </a>
            <p style="color:#999;font-size:12px">If you didn't expect this invite, you can ignore this email.</p>
          </div>
        `,
      }),
    });

    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error("send-team-invite:", err.message);
    return res.status(500).json({ error: "Could not send invite email" });
  }
}
