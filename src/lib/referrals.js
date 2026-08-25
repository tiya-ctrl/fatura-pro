import { supabase } from "../supabase";

export const REFERRAL_STORAGE_KEY = "fatura_referral_code";

async function referralRequest(path = "", options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Sign in to use referrals");

  const response = await fetch("/api/referrals" + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + session.access_token,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Referral request failed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function storeReferralCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  if (!/^FP[A-Z0-9]{8}$/.test(normalized)) return false;
  localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  return true;
}

export async function claimStoredReferral() {
  const code = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!code) return null;
  try {
    const data = await referralRequest("?action=claim", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    return data;
  } catch (error) {
    if (error.status && error.status < 500) localStorage.removeItem(REFERRAL_STORAGE_KEY);
    throw error;
  }
}

export function fetchReferralSummary() {
  return referralRequest();
}

export function activateReferral() {
  return referralRequest("?action=activate", { method: "POST", body: "{}" });
}

export function redeemReferralRewards() {
  return referralRequest("?action=redeem", { method: "POST", body: "{}" });
}
