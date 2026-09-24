// Shared request helpers for API functions.

const FALLBACK_ORIGIN = "https://faturapro.app";

// Only our own site (or this deployment / local dev) may be used to build links
// that we send to customers, so a forged Origin header cannot point them elsewhere.
export function safeOrigin(req) {
  try {
    const url = new URL(req.headers.origin || FALLBACK_ORIGIN);
    const deploymentHost = String(process.env.VERCEL_URL || "").toLowerCase();
    const isLocal = process.env.NODE_ENV !== "production"
      && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    const allowed = url.hostname === "faturapro.app"
      || url.hostname === "www.faturapro.app"
      || (deploymentHost && url.hostname === deploymentHost)
      || isLocal;
    return allowed && (url.protocol === "https:" || url.protocol === "http:") ? url.origin : FALLBACK_ORIGIN;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

export function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || String(req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown");
}

// Best-effort in-memory limiter (per server instance). It slows down guessing,
// it is not a hard guarantee.
export function createRateLimiter(limit, windowMs) {
  const hits = new Map();
  return function isLimited(key) {
    const now = Date.now();
    const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
    list.push(now);
    hits.set(key, list);
    if (hits.size > 1000) {
      for (const [k, times] of hits) {
        if (!times.length || now - times[times.length - 1] > windowMs) hits.delete(k);
      }
    }
    return list.length > limit;
  };
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
