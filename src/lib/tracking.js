import { track } from "@vercel/analytics";

export function trackEvent(name, properties = {}) {
  try {
    track(name, properties);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[analytics] ${name}`, properties);
    }
  }
}
