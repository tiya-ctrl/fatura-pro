// Fatura Pro - Activate team invite (server-side, bypasses RLS safely)
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

    // هوية موثقة من التوكن - لا نثق بأي إيميل مرسل من المتصفح
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user?.email) return res.status(401).json({ error: "Invalid session" });

    const { data, error: updErr } = await supabaseAdmin
      .from("team_members")
      .update({ member_user_id: user.id, status: "active" })
      .eq("member_email", user.email.toLowerCase())
      .eq("status", "invited")
      .select();

    if (updErr) return res.status(500).json({ error: updErr.message });
    return res.status(200).json({ activated: (data || []).length });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}
