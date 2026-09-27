// Keep the site owner's own visits out of Vercel Web Analytics.
//
// Vercel has no owner filter, so a browser is marked in localStorage ("va-disable",
// the key Vercel's docs use) and its page views and events are dropped before
// they are sent. A browser is marked when:
//   - it opens any page with ?analytics=off (undo with ?analytics=on), or
//   - an account with admin access signs in to the app (see InvoiceApp).
// public/seo-tracking.js applies the same rule on the static pages.
const KEY = "va-disable";

export function readAnalyticsSwitch() {
  try {
    const value = new URLSearchParams(window.location.search).get("analytics");
    if (value === "off") localStorage.setItem(KEY, "1");
    if (value === "on") localStorage.removeItem(KEY);
  } catch (e) {}
}

export function markOwnBrowser() {
  try { localStorage.setItem(KEY, "1"); } catch (e) {}
}

export function isOwnBrowser() {
  try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
}

// For <Analytics beforeSend={...} />: returning null drops the event.
export function dropOwnVisits(event) {
  return isOwnBrowser() ? null : event;
}
