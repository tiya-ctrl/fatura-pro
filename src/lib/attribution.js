const STORAGE_KEY = "fatura_attribution";
const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"];

function clean(value) {
  return String(value || "").trim().slice(0, 160);
}

export function readCampaignParams(search = "") {
  const params = new URLSearchParams(search);
  return Object.fromEntries(CAMPAIGN_KEYS.flatMap(key => {
    const value = clean(params.get(key));
    return value ? [[key, value]] : [];
  }));
}

export function captureAttribution(search = typeof window !== "undefined" ? window.location.search : "") {
  if (typeof window === "undefined") return {};
  const campaign = readCampaignParams(search);
  let current = {};
  try { current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (_) {}
  if (Object.keys(campaign).length) {
    const now = new Date().toISOString();
    current = {
      first: current.first || { ...campaign, captured_at:now },
      last: { ...campaign, captured_at:now },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return current;
}

export function getAttribution() {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (_) { return {}; }
}

export function attributionEventProperties() {
  const touch = getAttribution().last || getAttribution().first || {};
  const source = touch.utm_source || (touch.ref ? "referral" : "direct");
  return {
    acquisition_source: source,
    acquisition_medium: touch.utm_medium || "",
    acquisition_campaign: touch.utm_campaign || "",
    has_referral: Boolean(touch.ref),
  };
}

export function copyCampaignParams(target, search = typeof window !== "undefined" ? window.location.search : "") {
  const params = target instanceof URLSearchParams ? target : new URLSearchParams(target || "");
  Object.entries(readCampaignParams(search)).forEach(([key, value]) => params.set(key, value));
  return params;
}
