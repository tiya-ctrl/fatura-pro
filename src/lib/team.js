// Fatura Pro - Team members (Business plan)
import { supabase } from "../supabase";

export const TEAM_LIMIT = 5;

// فريقي (كمالك): كل الأعضاء المدعوين والنشطين
export async function loadTeam(ownerId) {
  const { data, error } = await supabase
    .from("team_members").select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });
  if (error) { console.error("loadTeam:", error.message); return []; }
  return data || [];
}

// دعوة عضو جديد بالإيميل
export async function inviteMember(email, ownerId, currentCount) {
  if (currentCount >= TEAM_LIMIT) return { error: "Team limit reached (" + TEAM_LIMIT + " members)" };
  const clean = (email || "").trim().toLowerCase();
  if (!clean || !clean.includes("@")) return { error: "Enter a valid email" };
  const { error } = await supabase.from("team_members").insert({
    owner_id: ownerId,
    member_email: clean,
    status: "invited",
  });
  if (error) {
    if (error.code === "23505") return { error: "This email is already invited" };
    console.error("inviteMember:", error.message);
    return { error: "Could not send invite" };
  }
  // إرسال إيميل الدعوة (لا نفشل العملية لو تعذر الإرسال)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/team?action=invite", {
      method: "POST",
      headers: { Authorization: "Bearer " + (session?.access_token || ""), "Content-Type": "application/json" },
      body: JSON.stringify({ email: clean }),
    });
  } catch (e) { console.error("invite email:", e); }
  return { ok: true };
}

// إزالة عضو
export async function removeMember(memberId, ownerId) {
  const { error } = await supabase.from("team_members")
    .delete().eq("id", memberId).eq("owner_id", ownerId);
  if (error) { console.error("removeMember:", error.message); return false; }
  return true;
}

// تفعيل الدعوات عبر السيرفر (يتجاوز RLS بأمان بعد التحقق من الهوية)
export async function claimInvites() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return false;
    const r = await fetch("/api/team?action=claim", {
      method: "POST",
      headers: { Authorization: "Bearer " + session.access_token },
    });
    const d = await r.json();
    return (d.activated || 0) > 0;
  } catch (e) {
    console.error("claimInvites:", e);
    return false;
  }
}

// My active team membership: { owner_id, role, owner_email } or null. Read on the server.
export async function myTeamMembership() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return null;
    const r = await fetch("/api/team?action=me", { method: "POST", headers: { Authorization: "Bearer " + session.access_token } });
    if (!r.ok) return null;
    const d = await r.json();
    return d.membership || null;
  } catch (e) {
    console.error("myTeamMembership:", e);
    return null;
  }
}

// Which workspace to open when I am in a team and also have my own account.
const WORKSPACE_KEY = "fatura_workspace";
export function preferredWorkspace() { try { return localStorage.getItem(WORKSPACE_KEY) || "team"; } catch (e) { return "team"; } }
export function setPreferredWorkspace(value) { try { localStorage.setItem(WORKSPACE_KEY, value); } catch (e) {} }

// Whose data to show: the team owner (team workspace) or me (own account).
export async function currentDataOwner(userId) {
  const membership = await myTeamMembership();
  return membership && preferredWorkspace() !== "own" ? membership.owner_id : userId;
}

// My role in the team I am a member of: "viewer" (read only) or "editor".
// Falls back to "viewer" when the role cannot be read.
export async function myTeamRole(userId) {
  const membership = await myTeamMembership();
  if (membership) return membership.role;
  const { data, error } = await supabase
    .from("team_members").select("role")
    .eq("member_user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) { console.error("myTeamRole:", error.message); return "viewer"; }
  return data?.role === "editor" ? "editor" : "viewer";
}

// Owner only: change a member's role (checked on the server).
export async function setMemberRole(memberId, role) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch("/api/team?action=role", {
      method: "POST",
      headers: { Authorization: "Bearer " + (session?.access_token || ""), "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, role }),
    });
    return r.ok;
  } catch (e) {
    console.error("setMemberRole:", e);
    return false;
  }
}

// هل أنا عضو نشط بفريق أحد؟ يرجع owner_id أو null
export async function myTeamOwner(userId) {
  const { data, error } = await supabase
    .from("team_members").select("owner_id")
    .eq("member_user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) { console.error("myTeamOwner:", error.message); return null; }
  return data?.owner_id || null;
}
