const RATE_LIMIT = 25;                 // أقصى عدد رسائل
const RATE_WINDOW_MS = 10 * 60 * 1000; // خلال 10 دقائق
const hits = new Map();

function allowedHost(value) {
  if (!value) return false;
  try {
    const host = value.startsWith("http") ? new URL(value).host : value;
    return (
      host === "faturapro.app" ||
      host.endsWith(".faturapro.app") ||
      host.endsWith(".vercel.app") ||
      host.startsWith("localhost")
    );
  } catch (e) {
    return false;
  }
}

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (!times.length || now - times[times.length - 1] > RATE_WINDOW_MS) hits.delete(key);
    }
  }
  return list.length > RATE_LIMIT;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1) الطلب لازم يجي من موقعنا
  const origin = req.headers.origin || req.headers.referer;
  if (!allowedHost(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 2) حد للطلبات لكل زائر
  const fwd = req.headers["x-forwarded-for"] || "";
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd).split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "Too many messages. Please try again in a few minutes." });
  }

  const { messages, system } = req.body || {};

  // 3) تحقق من الشكل والحجم
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 25) {
    return res.status(400).json({ error: "Invalid request" });
  }
  let total = 0;
  for (const m of messages) {
    if (!m || typeof m.content !== "string" || (m.role !== "user" && m.role !== "assistant")) {
      return res.status(400).json({ error: "Invalid request" });
    }
    total += m.content.length;
  }
  if (total > 12000) {
    return res.status(400).json({ error: "Message too long" });
  }
  if (typeof system !== "string" || system.length > 24000 || system.indexOf("Fat") === -1) {
    return res.status(400).json({ error: "Invalid request" });
  }

  // 4) تاريخ اليوم حتى يقدر يجاوب عنه
  const today = new Date().toISOString().slice(0, 10);
  const systemWithDate = system + "\n\nToday's date is " + today + ".";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // ثابت — لا يُؤخذ من المتصفح
        max_tokens: 400,
        system: systemWithDate,
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // تسجيل المحادثة (لا يوقف الرد لو فشل)
    try {
      const supaUrl = process.env.REACT_APP_SUPABASE_URL;
      const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      let question = "";
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === "user") { question = messages[i].content; break; }
      }
      const answer = Array.isArray(data.content)
        ? data.content.map((c) => c.text || "").join(" ")
        : "";
      if (supaUrl && supaKey && question) {
        await fetch(supaUrl + "/rest/v1/chat_logs", {
          method: "POST",
          headers: {
            apikey: supaKey,
            Authorization: "Bearer " + supaKey,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            bot: system.indexOf("Edy") >= 0 ? "edy" : "landing",
            question: question.slice(0, 2000),
            answer: answer.slice(0, 4000),
            turns: messages.length,
          }),
        });
      }
    } catch (e) {}

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
