import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────
   Fatūra Chatbot — Claude-powered support assistant
   
   Setup:
   1. ضعي مفتاح Anthropic في .env.local:
      REACT_APP_ANTHROPIC_KEY=sk-ant-...
   2. استوردي المكون في App.js:
      import Chatbot from './components/Chatbot';
   3. أضيفيه في آخر الـ return:
      <Chatbot />
───────────────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are Fatūra's friendly support assistant. Fatūra is a professional SaaS invoicing platform.

Key facts:
- Free plan: 5 invoices/month, 3 clients
- Pro plan: €9/month — unlimited invoices & clients, PDF export, payment reminders
- Business plan: €19/month — team members, multi-business, Stripe integration, API access
- Supports 17 currencies (EUR, USD, GBP, AED, SAR, MAD, DZD and more)
- Payment reminders via Email & WhatsApp (3 tones: Polite, Firm, Final)
- Built for freelancers — no business registration needed
- Payments via Stripe

Answer in the same language the user writes in (Arabic or English).
Keep replies short — 2 to 4 sentences max.
Be friendly, helpful, and specific.
If unsure, suggest emailing support@faturapro.app`;

const SUGGESTIONS = [
  "What's in the Pro plan?",
  "كيف تشتغل؟",
  "Do I need a company?",
  "Stripe payments?",
];

const timeStr = () =>
  new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });

const INIT_MSG = {
  role: "bot",
  text: "Hey! 👋 I'm Fatūra's assistant. Ask me anything about features, pricing, or how to get started.",
  time: timeStr(),
};

/* ─── CSS ─────────────────────────────────────────────── */
const CHAT_CSS = `
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

.chat-btn {
  position:fixed; bottom:28px; right:28px; z-index:200;
  width:56px; height:56px; border-radius:50%;
  background:#c9a84c; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:24px; box-shadow:0 6px 24px rgba(201,168,76,0.5);
  transition:transform 0.2s, box-shadow 0.2s;
  animation:float 4s ease-in-out infinite;
}
.chat-btn:hover {
  transform:scale(1.1);
  box-shadow:0 8px 32px rgba(201,168,76,0.65);
}
.chat-window {
  position:fixed; bottom:96px; right:28px; z-index:200;
  width:360px; max-width:calc(100vw - 40px);
  background:#0f0f17; border:1px solid rgba(201,168,76,0.18);
  border-radius:20px; box-shadow:0 24px 64px rgba(0,0,0,0.7);
  display:flex; flex-direction:column; overflow:hidden;
  animation:fadeUp 0.25s ease;
}
.chat-head {
  background:linear-gradient(135deg,#16161f 0%,#1a1520 100%);
  padding:16px 18px; border-bottom:1px solid rgba(201,168,76,0.18);
  display:flex; align-items:center; gap:12px;
}
.chat-head-avatar {
  width:38px; height:38px; border-radius:50%;
  background:#c9a84c; display:flex; align-items:center;
  justify-content:center; font-size:17px; font-weight:700;
  color:#000; flex-shrink:0;
}
.chat-head-info { flex:1; }
.chat-head-name { font-size:14px; font-weight:700; color:#e8e4dc; }
.chat-head-status {
  font-size:11px; color:#4caf89;
  display:flex; align-items:center; gap:5px;
}
.chat-head-dot {
  width:6px; height:6px; border-radius:50%;
  background:#4caf89; animation:pulse 2s infinite;
}
.chat-close {
  background:none; border:none; color:#9a9690;
  cursor:pointer; font-size:18px; padding:4px;
  transition:color 0.2s;
}
.chat-close:hover { color:#e8e4dc; }
.chat-messages {
  flex:1; overflow-y:auto; padding:16px;
  display:flex; flex-direction:column; gap:12px;
  max-height:360px; min-height:200px;
}
.chat-messages::-webkit-scrollbar { width:4px; }
.chat-messages::-webkit-scrollbar-thumb { background:rgba(201,168,76,0.2); border-radius:2px; }
.chat-msg { max-width:85%; display:flex; flex-direction:column; gap:3px; }
.chat-msg.user { align-self:flex-end; align-items:flex-end; }
.chat-msg.bot  { align-self:flex-start; }
.chat-bubble {
  padding:10px 14px; border-radius:14px;
  font-size:13px; line-height:1.6;
  font-family:'DM Sans',sans-serif;
}
.chat-msg.user .chat-bubble {
  background:#c9a84c; color:#000;
  border-radius:14px 14px 4px 14px;
}
.chat-msg.bot .chat-bubble {
  background:#18181f; color:#e8e4dc;
  border:1px solid rgba(255,255,255,0.07);
  border-radius:14px 14px 14px 4px;
}
.chat-time { font-size:10px; color:#5a5750; padding:0 4px; }
.chat-typing {
  display:flex; gap:5px; padding:12px 14px;
  background:#18181f; border:1px solid rgba(255,255,255,0.07);
  border-radius:14px 14px 14px 4px; width:54px;
}
.chat-typing span {
  width:7px; height:7px; border-radius:50%;
  background:#9a9690; animation:pulse 1.2s infinite;
}
.chat-typing span:nth-child(2) { animation-delay:0.2s; }
.chat-typing span:nth-child(3) { animation-delay:0.4s; }
.chat-suggestions {
  padding:8px 14px 4px;
  display:flex; gap:6px; flex-wrap:wrap;
}
.chat-sug {
  font-size:11px; background:#16161f;
  border:1px solid rgba(255,255,255,0.07);
  border-radius:20px; padding:5px 12px;
  cursor:pointer; color:#9a9690;
  transition:all 0.15s; white-space:nowrap;
  font-family:'DM Sans',sans-serif;
}
.chat-sug:hover { border-color:#c9a84c; color:#c9a84c; }
.chat-input-row {
  padding:12px 14px;
  border-top:1px solid rgba(255,255,255,0.07);
  display:flex; gap:8px; align-items:flex-end;
}
.chat-input {
  flex:1; background:#16161f;
  border:1px solid rgba(255,255,255,0.07);
  border-radius:10px; color:#e8e4dc; font-size:13px;
  padding:10px 12px; font-family:'DM Sans',sans-serif;
  outline:none; resize:none; max-height:100px;
  min-height:40px; transition:border-color 0.2s; line-height:1.5;
}
.chat-input:focus { border-color:#c9a84c; }
.chat-input::placeholder { color:#5a5750; }
.chat-send {
  width:38px; height:38px; border-radius:9px;
  background:#c9a84c; border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:16px; color:#000; flex-shrink:0;
  transition:all 0.2s;
}
.chat-send:hover { background:#e8c97a; transform:scale(1.05); }
.chat-send:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

@media(max-width:500px) {
  .chat-window { right:14px; bottom:86px; width:calc(100vw - 28px); }
  .chat-btn    { right:18px; bottom:20px; }
}
`;

/* ─── COMPONENT ───────────────────────────────────────── */
export default function Chatbot() {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([INIT_MSG]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user", text: text.trim(), time: timeStr() };
    setMsgs(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...msgs, userMsg]
        .filter(m => m.text)
        .map(m => ({
          role:    m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response.";
      setMsgs(m => [...m, { role: "bot", text: reply, time: timeStr() }]);

    } catch (err) {
      console.error("Chatbot error:", err.message);
      setMsgs(m => [...m, {
        role: "bot",
        text: "⚠️ Chat unavailable right now. Email us at support@faturapro.app",
        time: timeStr(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      <style>{CHAT_CSS}</style>

      {open && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-head">
            <div className="chat-head-avatar">F</div>
            <div className="chat-head-info">
              <div className="chat-head-name">Fatūra Assistant</div>
              <div className="chat-head-status">
                <span className="chat-head-dot" /> Online · Replies instantly
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="chat-bubble">{m.text}</div>
                <div className="chat-time">{m.time}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <div className="chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only on first open */}
          {msgs.length <= 2 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <div key={i} className="chat-sug" onClick={() => send(s)}>{s}</div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything..."
              rows={1}
            />
            <button
              className="chat-send"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
            >
              {loading
                ? <span style={{ width:14, height:14, border:"2px solid #000",
                    borderTopColor:"transparent", borderRadius:"50%",
                    display:"inline-block", animation:"spin 0.7s linear infinite" }} />
                : "↑"
              }
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        className="chat-btn"
        onClick={() => setOpen(o => !o)}
        title="Chat with Fatūra Assistant"
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}