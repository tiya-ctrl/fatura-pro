import { supabase } from "../supabase";

async function request(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Sign in to continue");
  const response = await fetch(`/api/referrals?action=${encodeURIComponent(path)}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "The request could not be completed");
    error.status = response.status;
    throw error;
  }
  return data;
}

export function fetchAmbassadorSummary() {
  return request("ambassador-summary");
}

export function fetchAmbassadorAdmin() {
  return request("ambassador-admin");
}

export function fetchAmbassadorAdminAccess() {
  return request("ambassador-admin-access");
}

export function approveAmbassador(applicationId) {
  return request("ambassador-admin-approve", {
    method: "POST",
    body: JSON.stringify({ applicationId }),
  });
}

export function declineAmbassador(applicationId) {
  return request("ambassador-admin-decline", {
    method: "POST",
    body: JSON.stringify({ applicationId }),
  });
}

export function resendAmbassadorAcceptance(applicationId) {
  return request("ambassador-admin-resend-acceptance", {
    method: "POST",
    body: JSON.stringify({ applicationId }),
  });
}

export function updateAmbassador(accountId, updates) {
  return request("ambassador-admin-update", {
    method: "POST",
    body: JSON.stringify({ accountId, ...updates }),
  });
}

export async function connectAmbassadorPayout(action = "connect") {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Sign in to continue");
  const params = new URLSearchParams({ intent: "ambassador" });
  if (action !== "connect") params.set("action", action);
  const response = await fetch(`/api/connect-stripe?${params}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Stripe payout setup could not be completed");
  return data;
}

