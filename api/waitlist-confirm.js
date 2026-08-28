import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";
import { htmlEscape, sendAmbassadorAdminEmail, sendEmail } from "../server/email.js";

const CHANNELS = new Set(["YouTube", "TikTok", "Instagram", "LinkedIn", "Newsletter", "Community", "Consulting", "Other"]);
const AUDIENCE_SIZES = new Set(["under_1k", "1k_5k", "5k_25k", "25k_plus"]);

function text(value, max) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, max);
}

function paragraph(value, max) {
  return String(value || "").trim().replace(/\r\n/g, "\n").slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 160;
}

function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && value.length <= 300;
  } catch {
    return false;
  }
}

function adminClient() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) throw new Error("Server configuration is incomplete");
  return createClient(url, secret, { auth:{ persistSession:false, autoRefreshToken:false } });
}

function requestOriginIsAllowed(req) {
  const origin = text(req.headers.origin, 300);
  if (!origin) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "https:" && protocol !== "http:") return false;
    return hostname === "faturapro.app" || hostname === "www.faturapro.app" || hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function requestActorHash(req, subject = "") {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = forwarded || String(req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown");
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "unconfigured";
  return createHmac("sha256", secret).update(`${ip}|${subject}`).digest("hex");
}

async function consumeRateLimit(supabaseAdmin, formKey, actorHash, limit) {
  const { data, error } = await supabaseAdmin.rpc("consume_public_form_rate_limit", {
    p_form_key:formKey,
    p_actor_hash:actorHash,
    p_limit:limit,
  });
  if (error) throw error;
  return data === true;
}

async function handleAmbassadorApplication(req, res, supabaseAdmin) {
  const body = req.body || {};

  // Quietly accept honeypot submissions so automated spam receives no signal.
  if (text(body.website, 200)) return res.status(200).json({ ok:true });

  const elapsed = Date.now() - Number(body.startedAt || 0);
  if (!Number.isFinite(elapsed) || elapsed < 2500 || elapsed > 2 * 60 * 60 * 1000) {
    return res.status(400).json({ error:"Please reload the page and try again." });
  }

  const application = {
    name:text(body.name, 80),
    email:text(body.email, 160).toLowerCase(),
    primary_channel:text(body.channel, 30),
    profile_url:text(body.profileUrl, 300),
    audience_size:text(body.audienceSize, 30),
    languages:text(body.languages, 100),
    country:text(body.country, 80),
    motivation:paragraph(body.motivation, 1000),
    source:text(body.source, 60) || "website",
    medium:text(body.medium, 60) || "organic",
    campaign:text(body.campaign, 80) || "founding_ambassadors",
  };

  if (!application.name || !validEmail(application.email)) return res.status(400).json({ error:"Enter a valid name and email address." });
  if (!CHANNELS.has(application.primary_channel)) return res.status(400).json({ error:"Choose a valid primary channel." });
  if (!AUDIENCE_SIZES.has(application.audience_size)) return res.status(400).json({ error:"Choose an audience-size range." });
  if (!validHttpUrl(application.profile_url)) return res.status(400).json({ error:"Enter a valid public profile or community URL." });
  if (!application.languages || !application.country || application.motivation.length < 40) return res.status(400).json({ error:"Please complete every field and tell us a little more about your audience." });

  const ipAllowed = await consumeRateLimit(supabaseAdmin, "ambassador_ip", requestActorHash(req), 5);
  const emailAllowed = await consumeRateLimit(supabaseAdmin, "ambassador_email", requestActorHash(req, application.email), 2);
  if (!ipAllowed || !emailAllowed) return res.status(429).json({ error:"Too many applications. Please try again later." });

  const { error } = await supabaseAdmin.from("ambassador_applications").insert(application);
  if (error?.code === "23505") return res.status(200).json({ ok:true, already:true });
  if (error) throw error;

  await Promise.allSettled([
    sendEmail({
      to:application.email,
      subject:"We received your Fatūra Pro ambassador application",
      html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#222"><div style="color:#a68123;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Founding Ambassador Circle</div><h1 style="font-size:26px;margin:12px 0">Thank you, ${htmlEscape(application.name)}.</h1><p style="line-height:1.7">We received your application and will review it alongside the next founding-circle batch. If there is a strong fit, we will contact you by email before you publish anything.</p><p style="line-height:1.7">The program uses fixed terms: 25% on Pro and 35% on Business subscription revenue for the first 12 paid months of each qualified customer.</p><p style="margin:28px 0"><a href="https://faturapro.app/ambassador" style="background:#c9a84c;color:#000;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700">Check application status →</a></p><p style="color:#888;font-size:12px">Fatūra Pro · Business without borders</p></div>`,
    }),
    sendAmbassadorAdminEmail({
      subject:`New ambassador application — ${application.name}`,
      html:`<div style="font-family:Arial,sans-serif;max-width:620px;padding:24px"><h2>New ambassador application</h2><p><b>Name:</b> ${htmlEscape(application.name)}<br><b>Email:</b> ${htmlEscape(application.email)}<br><b>Channel:</b> ${htmlEscape(application.primary_channel)}<br><b>Audience:</b> ${htmlEscape(application.audience_size)}<br><b>Languages:</b> ${htmlEscape(application.languages)}<br><b>Market:</b> ${htmlEscape(application.country)}<br><b>Profile:</b> <a href="${htmlEscape(application.profile_url)}">${htmlEscape(application.profile_url)}</a></p><p><b>Why it fits:</b><br>${htmlEscape(application.motivation).replace(/\n/g,"<br>")}</p><p style="margin:24px 0"><a href="https://faturapro.app/admin" style="background:#c9a84c;color:#000;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700">Review application →</a></p><p style="color:#777;font-size:12px">Source: ${htmlEscape(application.source)} / ${htmlEscape(application.medium)} / ${htmlEscape(application.campaign)}</p></div>`,
    }),
  ]);

  return res.status(201).json({ ok:true });
}

async function handleWaitlistConfirmation(req, res, supabaseAdmin) {
  const email = text(req.body?.email, 160).toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ error:"Email required" });

  const ipAllowed = await consumeRateLimit(supabaseAdmin, "waitlist_ip", requestActorHash(req), 10);
  const emailAllowed = await consumeRateLimit(supabaseAdmin, "waitlist_email", requestActorHash(req, email), 1);
  if (!ipAllowed || !emailAllowed) return res.status(429).json({ error:"Please wait before requesting another email." });

  await sendEmail({
    to:email,
    subject:"You're on the Fatūra Business Plan waitlist! 🎉",
    html:`<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px"><h2 style="color:#c9a84c">You're on the list! ✦</h2><p>Hi there,</p><p>Thank you for joining the <strong>Fatūra Business Plan</strong> waitlist. You'll be among the first to know when we launch.</p><p>While you wait, you can enjoy <strong>Fatūra Pro</strong> — our full-featured invoicing plan for freelancers and entrepreneurs.</p><p style="margin:24px 0"><a href="https://faturapro.app" style="background:#c9a84c;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Try Pro Free for 7 Days →</a></p><p style="color:#999;font-size:12px">Fatūra Pro · Professional Invoicing · faturapro.app</p></div>`,
  });

  return res.status(200).json({ ok:true });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error:"Method not allowed" });
  }

  try {
    if (!requestOriginIsAllowed(req)) return res.status(403).json({ error:"Request origin is not allowed" });
    const contentLength = Number(req.headers["content-length"] || 0);
    if (contentLength > 12_000 || JSON.stringify(req.body || {}).length > 12_000) {
      return res.status(413).json({ error:"Request is too large" });
    }

    const supabaseAdmin = adminClient();
    if (req.query?.intent === "ambassador") return await handleAmbassadorApplication(req, res, supabaseAdmin);
    return await handleWaitlistConfirmation(req, res, supabaseAdmin);
  } catch (error) {
    console.error("Public form error:", error?.message || error);
    return res.status(500).json({ error:"We could not submit your request. Please try again." });
  }
}
