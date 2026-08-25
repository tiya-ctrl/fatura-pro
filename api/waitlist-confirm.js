import { createClient } from "@supabase/supabase-js";

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

function html(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[character]));
}

async function sendEmail(payload) {
  if (!process.env.RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{ "Content-Type":"application/json", Authorization:`Bearer ${process.env.RESEND_API_KEY}` },
    body:JSON.stringify(payload),
  });
}

async function handleAmbassadorApplication(req, res) {
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

  const supabaseAdmin = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth:{ persistSession:false, autoRefreshToken:false } }
  );

  const { error } = await supabaseAdmin.from("ambassador_applications").insert(application);
  if (error?.code === "23505") return res.status(200).json({ ok:true, already:true });
  if (error) throw error;

  await Promise.allSettled([
    sendEmail({
      from:"Fatūra Pro <noreply@faturapro.app>",
      to:application.email,
      subject:"We received your Fatūra Pro ambassador application",
      html:`<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#222"><div style="color:#a68123;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Founding Ambassador Circle</div><h1 style="font-size:26px;margin:12px 0">Thank you, ${html(application.name)}.</h1><p style="line-height:1.7">We received your application and will review it alongside the next founding-circle batch. If there is a strong fit, we will contact you by email with the program terms before you publish anything.</p><p style="line-height:1.7">In the meantime, you can explore Fatūra Pro and create your first invoice for free.</p><p style="margin:28px 0"><a href="https://faturapro.app" style="background:#c9a84c;color:#000;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:700">Explore Fatūra Pro →</a></p><p style="color:#888;font-size:12px">Fatūra Pro · Business without borders</p></div>`,
    }),
    sendEmail({
      from:"Fatūra Pro <noreply@faturapro.app>",
      to:"support@faturapro.app",
      subject:`New ambassador application — ${application.name}`,
      html:`<div style="font-family:Arial,sans-serif;max-width:620px;padding:24px"><h2>New ambassador application</h2><p><b>Name:</b> ${html(application.name)}<br><b>Email:</b> ${html(application.email)}<br><b>Channel:</b> ${html(application.primary_channel)}<br><b>Audience:</b> ${html(application.audience_size)}<br><b>Languages:</b> ${html(application.languages)}<br><b>Market:</b> ${html(application.country)}<br><b>Profile:</b> <a href="${html(application.profile_url)}">${html(application.profile_url)}</a></p><p><b>Why it fits:</b><br>${html(application.motivation).replace(/\n/g,"<br>")}</p><p style="color:#777;font-size:12px">Source: ${html(application.source)} / ${html(application.medium)} / ${html(application.campaign)}</p></div>`,
    }),
  ]);

  return res.status(201).json({ ok:true });
}

async function handleWaitlistConfirmation(req, res) {
  const email = text(req.body?.email, 160).toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ error:"Email required" });

  await sendEmail({
    from:"Fatūra Pro <noreply@faturapro.app>",
    to:email,
    subject:"You're on the Fatūra Business Plan waitlist! 🎉",
    html:`<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px"><h2 style="color:#c9a84c">You're on the list! ✦</h2><p>Hi there,</p><p>Thank you for joining the <strong>Fatūra Business Plan</strong> waitlist. You'll be among the first to know when we launch.</p><p>While you wait, you can enjoy <strong>Fatūra Pro</strong> — our full-featured invoicing plan for freelancers and entrepreneurs.</p><p style="margin:24px 0"><a href="https://faturapro.app" style="background:#c9a84c;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Try Pro Free for 7 Days →</a></p><p style="color:#999;font-size:12px">Fatūra Pro · Professional Invoicing · faturapro.app</p></div>`,
  });

  return res.status(200).json({ ok:true });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error:"Method not allowed" });
  }

  try {
    if (req.query?.intent === "ambassador") return await handleAmbassadorApplication(req, res);
    return await handleWaitlistConfirmation(req, res);
  } catch (error) {
    console.error("Public form error:", error?.message || error);
    return res.status(500).json({ error:"We could not submit your request. Please try again." });
  }
}
