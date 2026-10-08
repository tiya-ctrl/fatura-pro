// Fatura Pro - Team endpoints (Business plan)
// POST /api/team?action=claim   -> تفعيل دعوة العضو
// POST /api/team?action=invite  -> إرسال إيميل دعوة
import { createClient } from "@supabase/supabase-js";
import { safeOrigin, escapeHtml } from "../server/request-safety.js";
import { brandedEmail, emailButton } from "../server/email.js";
import { hasAdvancedAccess } from "../server/plan-access.js";

const TEAM_LIMIT = 5; // same as src/lib/team.js

const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user?.email) return res.status(401).json({ error: "Invalid session" });

  const action = req.query?.action;

  // --- تفعيل الدعوة ---
  if (action === "claim") {
    // Only the real owner of the invited address may join (confirmed email).
    if (!user.email_confirmed_at) return res.status(403).json({ error: "Confirm your email first" });
    const { data, error: updErr } = await supabaseAdmin
      .from("team_members")
      .update({ member_user_id: user.id, status: "active" })
      .eq("member_email", user.email.toLowerCase())
      .eq("status", "invited")
      .select();
    if (updErr) return res.status(500).json({ error: updErr.message });
    return res.status(200).json({ activated: (data || []).length });
  }

  // --- إرسال إيميل الدعوة ---
  if (action === "invite") {
    const invitee = ((req.body || {}).email || "").trim().toLowerCase();
    if (!invitee.includes("@")) return res.status(400).json({ error: "Invalid email" });

    const { data: invite } = await supabaseAdmin
      .from("team_members").select("id")
      .eq("owner_id", user.id).eq("member_email", invitee).maybeSingle();
    if (!invite) return res.status(404).json({ error: "Invite not found" });
    // Teams are an Advanced feature with at most 5 members. The app checks this too,
    // but invites are stored from the browser, so check again before emailing anyone.
    if (!(await hasAdvancedAccess(supabaseAdmin, user.id))) return res.status(403).json({ error: "Teams require the Advanced plan." });
    const { count } = await supabaseAdmin.from("team_members").select("id", { count: "exact", head: true }).eq("owner_id", user.id);
    if ((count || 0) > TEAM_LIMIT) return res.status(400).json({ error: "Team limit reached (" + TEAM_LIMIT + " members)" });

    const origin = safeOrigin(req);
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Fatūra Pro <noreply@faturapro.app>",
          to: invitee,
          subject: "You've been invited to a team on Fatūra Pro",
          html: brandedEmail({
            title: "You're invited to a team",
            paragraphs: [
              `<b style="color:#fff;">${escapeHtml(user.email)}</b> invited you to join their team on <b style="color:#fff;">Fatūra Pro</b>. You'll be able to work on their invoices, clients and quotes.`,
              `Sign up (or log in) with <b style="color:#fff;">${escapeHtml(invitee)}</b> and you'll join the team automatically.`,
            ],
            buttons: [emailButton(`${origin}/app?invited=${encodeURIComponent(invitee)}`, "Join the team →")],
            footer: "If you didn't expect this invite, you can ignore this email.",
          }),
        }),
      });
    } catch (e) { console.error("invite email:", e.message); }
    return res.status(200).json({ sent: true });
  }

  // --- Change a member's role (owner only) ---
  if (action === "role") {
    const { memberId, role } = req.body || {};
    if (!["viewer", "editor"].includes(role) || !memberId) return res.status(400).json({ error: "Invalid role" });
    const { data, error: roleErr } = await supabaseAdmin
      .from("team_members").update({ role })
      .eq("id", memberId).eq("owner_id", user.id)
      .select("id");
    if (roleErr) return res.status(500).json({ error: roleErr.message });
    if (!data || !data.length) return res.status(404).json({ error: "Member not found" });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: "Unknown action" });
}
