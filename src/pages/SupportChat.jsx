// Fatura Pro - in-app support assistant
// Uses the same /api/chat endpoint as the landing chatbot, but with its own
// knowledge and a warmer, more human tone: these are paying customers who
// want to get something done, not visitors deciding whether to buy.
import React, { useState, useRef, useEffect } from "react";
import { getLocale } from "../lib/locale";
import { SUPPORT_ASSISTANT_NAME } from "../lib/chatPrompts";

// The assistant's name and instructions live in ../lib/chatPrompts.js,
// so the server can use them without trusting text sent from the browser.
const NAME = SUPPORT_ASSISTANT_NAME;
const MODEL = "claude-haiku-4-5-20251001"; // if the chat errors, switch to "claude-haiku-4-5-20251001"


const timeStr = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const isRTL = (s) => /[\u0600-\u06FF]/.test(s);

// DM Sans carries no Arabic glyphs, so Arabic falls back to whatever the browser
// happens to have. Name real Arabic faces, and give the script the size and line
// height it needs to be read comfortably.
const AR_FONT = "\"Noto Naskh Arabic\", \"Segoe UI\", Tahoma, \"Traditional Arabic\", serif";

// Edy writes **bold** markdown. Render it instead of printing the asterisks.
const richText = (text) =>
  String(text).split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );

export default function SupportChat({ userEmail, plan }) {
  const ar = getLocale() === "ar";
  const firstName = (userEmail || "").split("@")[0].split(/[._-]/)[0];
  const hello = ar
    ? `مرحبًا${firstName ? ` ${firstName}` : ""}، أنا ${NAME}، المساعد الذكي (AI) في Fatūra. كيف يمكنني مساعدتك؟`
    : firstName
      ? `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)} - I'm ${NAME}, Fatūra's AI assistant. What can I help you with?`
      : `Hi, I'm ${NAME}, Fatūra's AI assistant. What can I help you with?`;

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "bot", text: hello, time: timeStr() }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 250); }, [open]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", text: text.trim(), time: timeStr() };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...msgs.slice(1), userMsg].map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          bot: "support",
          plan: plan || "free",
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text
        || (ar ? "تعذّر الاتصال بالخادم الآن. حاول مرة أخرى أو راسل support@faturapro.app." : "I couldn't reach the server just then. Try once more, or email support@faturapro.app.");
      setMsgs((m) => [...m, { role: "bot", text: reply, time: timeStr() }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: ar ? "تعذّر الاتصال بالخادم الآن. حاول مرة أخرى أو راسل support@faturapro.app." : "I couldn't reach the server just then. Try once more, or email support@faturapro.app.", time: timeStr() }]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK = ar
    ? ["كيف أنشئ إشعارًا دائنًا؟", "كيف أصدّر ملف UBL؟", "كيف أسجّل دفعة مقدّمة؟"]
    : ["How do I make a credit note?", "How do I export a UBL file?", "How do I record a deposit?"];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title={ar ? `اسأل ${NAME}` : "Ask " + NAME}
        style={{ position:"fixed", bottom:20, right:ar ? "auto" : 20, left:ar ? 20 : "auto", zIndex:9998, width:56, height:56, borderRadius:"50%",
          background:"var(--gold)", color:"#000", border:"none", cursor:"pointer", fontSize:22, fontWeight:700,
          boxShadow:"0 6px 22px rgba(0,0,0,0.45)" }}>
        {open ? "\u00d7" : "\u2709"}
      </button>

      {open && (
        <div dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : undefined} style={{ position:"fixed", bottom:86, right:ar ? "auto" : 20, left:ar ? 20 : "auto", zIndex:9998, width:"min(370px, calc(100vw - 40px))",
          height:"min(520px, calc(100vh - 130px))", background:"var(--bg2)", border:"1px solid var(--border)",
          borderRadius:16, display:"flex", flexDirection:"column", overflow:"hidden",
          boxShadow:"0 18px 50px rgba(0,0,0,0.55)" }}>

          <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--gold)", color:"#000",
              display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>{NAME.charAt(0)}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{NAME}</div>
              <div style={{ fontSize:11, color:"var(--text2)" }}>{ar ? "مساعد ذكي (AI) · دعم Fatūra Pro" : "AI assistant · Fatūra Pro support"}</div>
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth:"88%" }}>
                <div style={{ background: m.role === "user" ? "var(--gold)" : "var(--bg3)",
                  color: m.role === "user" ? "#000" : "var(--text)",
                  border: m.role === "user" ? "none" : "1px solid var(--border)",
                  padding:"9px 12px", borderRadius:14, whiteSpace:"pre-wrap",
                  fontFamily: isRTL(m.text) ? AR_FONT : undefined,
                  fontSize: isRTL(m.text) ? 15.5 : 14,
                  lineHeight: isRTL(m.text) ? 1.95 : 1.55,
                  direction: isRTL(m.text) ? "rtl" : "ltr", textAlign: isRTL(m.text) ? "right" : "left" }}>
                  {richText(m.text)}
                </div>
                <div style={{ fontSize:10, color:"var(--text2)", marginTop:3,
                  textAlign: m.role === "user" ? "right" : "left" }}>{m.time}</div>
              </div>
            ))}
            {loading && <div style={{ fontSize:13, color:"var(--text2)" }}>{ar ? `${NAME} يكتب…` : <>{NAME} is typing&hellip;</>}</div>}
            {msgs.length === 1 && !loading && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
                {QUICK.map((q) => (
                  <button key={q} onClick={() => send(q)}
                    style={{ background:"var(--bg3)", color:"var(--text2)", border:"1px solid var(--border)",
                      borderRadius:20, padding:"6px 11px", fontSize:12, cursor:"pointer" }}>{q}</button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ borderTop:"1px solid var(--border)", padding:10, display:"flex", gap:8 }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
              placeholder={ar ? "اسأل عن أي شيء يخص Fatūra Pro" : "Ask anything about Fatūra Pro"}
              style={{ flex:1, background:"var(--bg)", border:"1px solid var(--border)", borderRadius:10,
                padding:"9px 12px", color:"var(--text)", fontSize:14, outline:"none" }} />
            <button onClick={() => send(input)} disabled={loading || !input.trim()}
              style={{ background:"var(--gold)", color:"#000", border:"none", borderRadius:10, padding:"0 15px",
                fontWeight:700, cursor: loading || !input.trim() ? "default" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }}>
              {ar ? "←" : "→"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
