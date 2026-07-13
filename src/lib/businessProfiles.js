// Fatura Pro - Multi-business profiles (Business plan)
import { supabase } from "../supabase";

export async function loadProfiles(userId) {
  const { data, error } = await supabase
    .from("business_profiles").select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) { console.error("loadProfiles:", error.message); return []; }
  return data || [];
}

export async function saveProfile(profile, userId) {
  const row = { ...profile, user_id: userId };
  const { data, error } = await supabase
    .from("business_profiles").upsert(row).select().single();
  if (error) { console.error("saveProfile:", error.message); return null; }
  return data;
}

export async function deleteProfile(profileId, userId) {
  const { error } = await supabase.from("business_profiles")
    .delete().eq("id", profileId).eq("user_id", userId);
  if (error) { console.error("deleteProfile:", error.message); return false; }
  return true;
}
