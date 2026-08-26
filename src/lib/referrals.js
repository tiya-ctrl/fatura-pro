import { supabase } from "../supabase";

export const REFERRAL_STORAGE_KEY = "fatura_referral_code";
const REFERRAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function clickToken() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, character => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function storedReferral() {
  const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.code || Number(parsed.expiresAt || 0) <= Date.now()) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    // Backwards compatibility for links saved by the first referral release.
    return { code: raw, expiresAt: Date.now() + REFERRAL_WINDOW_MS };
  }
}

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
  const existing = storedReferral();
  const token = existing?.code === normalized && existing?.clickToken ? existing.clickToken : clickToken();
  localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify({
    code: normalized,
    clickToken: token,
    storedAt: Date.now(),
    expiresAt: Date.now() + REFERRAL_WINDOW_MS,
  }));
  fetch("/api/referrals?action=track-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: normalized, clickToken: token }),
  }).catch(() => {});
  return true;
}

export async function claimStoredReferral() {
  const stored = storedReferral();
  if (!stored?.code) return null;
  try {
    const data = await referralRequest("?action=claim", {
      method: "POST",
      body: JSON.stringify({ code: stored.code }),
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
