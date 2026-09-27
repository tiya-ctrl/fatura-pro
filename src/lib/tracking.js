import { track } from "@vercel/analytics";
import { isOwnBrowser } from "./ownVisits";

export function trackEvent(name, properties = {}) {
  if (isOwnBrowser()) return; // the site owner's own browser is not counted
  try {
    track(name, properties);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[analytics] ${name}`, properties);
    }
  }
}
