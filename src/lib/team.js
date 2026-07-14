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
  return { ok: true };
}

// إزالة عضو
export async function removeMember(memberId, ownerId) {
  const { error } = await supabase.from("team_members")
    .delete().eq("id", memberId).eq("owner_id", ownerId);
  if (error) { console.error("removeMember:", error.message); return false; }
  return true;
}

// عند تسجيل دخول أي مستخدم: هل في دعوة معلقة بإيميله؟ نفعّلها ونربطها بحسابه
export async function claimInvites(userId, userEmail) {
  if (!userEmail) return false;
  const { data, error } = await supabase
    .from("team_members")
    .update({ member_user_id: userId, status: "active" })
    .eq("member_email", userEmail.toLowerCase())
    .eq("status", "invited")
    .select();
  if (error) { console.error("claimInvites:", error.message); return false; }
  return (data || []).length > 0;
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
