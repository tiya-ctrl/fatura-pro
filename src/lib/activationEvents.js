import { supabase } from "../supabase";

const ALLOWED_EVENTS = new Set([
  "business_profile_created",
  "client_created",
  "invoice_started",
  "invoice_created",
  "quote_created",
  "expense_created",
  "user_returned",
]);

const ALLOWED_METADATA = new Set([
  "source",
  "currency",
  "is_first_invoice",
  "is_first_client",
  "is_first_quote",
  "is_first_expense",
]);

function cleanMetadata(metadata) {
  return Object.fromEntries(
    Object.entries(metadata || {})
      .filter(([key, value]) => ALLOWED_METADATA.has(key) && ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 80) : value])
  );
}

// Product activation is stored separately from invoice/client content. Only a
// small allow-list of event names and non-sensitive properties can be written.
// A dedupe key is optional and is unique per user when supplied.
export async function recordActivationEvent(eventName, { metadata = {}, dedupeKey = null } = {}) {
  if (!ALLOWED_EVENTS.has(eventName)) return { skipped: "unsupported_event" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { skipped: "signed_out" };

  const row = {
    user_id: user.id,
    event_name: eventName,
    metadata: cleanMetadata(metadata),
    dedupe_key: dedupeKey ? String(dedupeKey).slice(0, 160) : null,
  };
  const { error } = await supabase.from("activation_events").insert(row);
  if (!error) return { recorded: true };
  if (error.code === "23505") return { deduped: true };

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[activation] ${eventName} was not stored`, error.message);
  }
  return { error: error.message };
}

