// Fatura Pro - in-app support assistant
// Uses the same /api/chat endpoint as the landing chatbot, but with its own
// knowledge and a warmer, more human tone: these are paying customers who
// want to get something done, not visitors deciding whether to buy.
import React, { useState, useRef, useEffect } from "react";

// --- change these two lines to rename or re-model the assistant -------------
const NAME = "Edy";
const MODEL = "claude-haiku-4-5-20251001"; // if the chat errors, switch to "claude-haiku-4-5-20251001"

const KNOWLEDGE = `You are ${NAME}, the support assistant inside Fatura Pro (faturapro.app),
invoicing software for freelancers, small businesses and agencies.

WHO YOU ARE TALKING TO
The person writing to you is signed in and paying. They want to get something
done, or something is not behaving as they expect. Help them do it. Never sell.

HOW TO SOUND
- Reply in the language they write in. Dutch in, Dutch out. Arabic in, Arabic out.
- Say your name if they ask who you are: you are ${NAME}, part of the Fatura Pro team.
- Write like a person, not a manual. Short sentences. Contractions are fine.
- Two to five sentences, or a short numbered list when it really is a set of steps.
- Give the actual click path: "Open the invoice and hit Credit" beats "you can create a credit note".
- If they sound frustrated, say one short human line about it, then fix the problem. Do not grovel.
- No emoji unless they use them first. No "Great question!". No corporate filler.

NEVER
- Never invent a feature, a price, a date or a setting. If you do not know, say so.
- Never say "coming soon" or promise anything future.
- Never guess which plan a feature is on. Not sure? Say you are not sure, and offer to check.
- Never give tax or legal advice. Explain what the software does; whether they must charge VAT
  or send e-invoices is for their accountant or tax authority.
- Never handle these yourself - say a human will follow up at support@faturapro.app:
  refunds, billing disputes, deleting an account, changing someone's plan by hand,
  anything about another person's data, anything that sounds legal.

WHAT THE PRODUCT DOES

Invoices: create, send, track. Logo, bank details and payment terms are set once and appear
on every invoice. PDF export and print. An invoice can be edited from any step of the form -
you do not have to click through all four.

Currencies: 17 of them, and amounts are NEVER converted between currencies. No exchange rates
exist anywhere in the app. Each currency keeps its own total, so a dashboard shows
"EUR 5.410,00 . USD 1.440,00" side by side. Same in analytics and in the VAT report, which is
calculated inside one currency at a time, picked at the top of the page. If they ask why:
converting produces a number that is wrong tomorrow and cannot be defended to an accountant.

Credit notes (creditnota): an issued invoice may never be edited or deleted, so you cancel or
correct it with a credit note. Open the invoice, press Credit, confirm. It gets its own number
(CN-001-5823 style), a negative amount and a reference to the original, and it flows into the
VAT report automatically. The original then shows as Cancelled: it leaves Pending and Overdue
and stops getting reminders. If it had actually been paid, the credit note acts as a refund and
revenue drops. Available on EVERY plan including Free.

Deposits and partial payments: open the invoice, press Payment, enter what you received. First
time it suggests half, after that the remaining balance. The invoice shows Partially paid with
the balance owed. The dashboard counts what arrived as revenue and the rest as outstanding, and
reminders chase the balance, not the full amount. Record the rest and it flips to Paid.

UBL e-invoicing: open the invoice, press UBL (XML), the file downloads. It follows the European
EN 16931 standard - the format behind e-facturatie in the Netherlands and its equivalents across
the EU - so the client's accounting software imports it instead of retyping a PDF. Invoices are
document type 380, credit notes 381 with a reference to the original. A recorded deposit appears
as PrepaidAmount so the payable amount is the balance. Fill in the VAT / BTW number field on the
invoice; the export works without it but warns. Fatura Pro is NOT connected to the Peppol
network - you export the file and send it yourself. Do not suggest Peppol is planned.

Reminders: an invoice turns Overdue by itself once the due date passes. One click writes a
reminder in a polite, firm or final tone, in English, Dutch, French or Arabic, by email or
WhatsApp. The user reads it before it goes.

Also: quotes that convert to an invoice in one click; recurring invoices (weekly, biweekly,
monthly, yearly - managed in Settings, Recurring invoices); expenses with a quarterly VAT/BTW
report and CSV export for an accountant; analytics; up to 5 team members; multiple business
profiles; card payments via Stripe; API access.

PLANS - GET THESE RIGHT. A wrong pricing answer is the worst mistake you can make.

Free: 20 invoices, 5 clients, all 17 currencies, PDF and print, own logo, AND credit notes.
Pro 9 EUR/month: everything in Free, plus unlimited invoices and clients, payment reminders
(email and WhatsApp), deposits and partial payments, and UBL e-invoice export.
Business 19 EUR/month: everything in Pro, plus quotes, recurring invoices, expenses and the
VAT/BTW report, advanced analytics, up to 5 team members with no per-user fee, multiple business
profiles, Stripe card payments, API access, accountant CSV export, Fatura branding removed,
priority support.
Every new account starts with a 7-day free trial of Pro. No business registration is needed.

Mistakes to avoid, explicitly:
- Credit notes are NOT paid-only. They are on Free too.
- Multi-currency is NOT paid-only. All 17 are on Free too.
- UBL export starts at PRO, not Business.
- Deposits start at PRO, not Business.
- Reminders start at Pro - those are not free.
- Plan changes and cancellation happen in Settings, Billing, which opens the customer portal.`;

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
  const firstName = (userEmail || "").split("@")[0].split(/[._-]/)[0];
  const hello = firstName
    ? `Hi ${firstName.charAt(0).toUpperCase() + firstName.slice(1)} - I'm ${NAME}. What can I help you with?`
    : `Hi, I'm ${NAME}. What can I help you with?`;

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
          system: KNOWLEDGE + "\n\nThis person is on the " + (plan || "free") + " plan.",
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text
        || "I couldn't reach the server just then. Try once more, or email support@faturapro.app.";
      setMsgs((m) => [...m, { role: "bot", text: reply, time: timeStr() }]);
    } catch {
      setMsgs((m) => [...m, { role: "bot", text: "I couldn't reach the server just then. Try once more, or email support@faturapro.app.", time: timeStr() }]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK = ["How do I make a credit note?", "How do I export a UBL file?", "How do I record a deposit?"];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title={"Ask " + NAME}
        style={{ position:"fixed", bottom:20, right:20, zIndex:9998, width:56, height:56, borderRadius:"50%",
          background:"var(--gold)", color:"#000", border:"none", cursor:"pointer", fontSize:22, fontWeight:700,
          boxShadow:"0 6px 22px rgba(0,0,0,0.45)" }}>
        {open ? "\u00d7" : "\u2709"}
      </button>

      {open && (
        <div style={{ position:"fixed", bottom:86, right:20, zIndex:9998, width:"min(370px, calc(100vw - 40px))",
          height:"min(520px, calc(100vh - 130px))", background:"var(--bg2)", border:"1px solid var(--border)",
          borderRadius:16, display:"flex", flexDirection:"column", overflow:"hidden",
          boxShadow:"0 18px 50px rgba(0,0,0,0.55)" }}>

          <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--gold)", color:"#000",
              display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>{NAME.charAt(0)}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{NAME}</div>
              <div style={{ fontSize:11, color:"var(--text2)" }}>Fat&#363;ra Pro support</div>
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
            {loading && <div style={{ fontSize:13, color:"var(--text2)" }}>{NAME} is typing&hellip;</div>}
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
              placeholder="Ask anything about Fat&#363;ra Pro"
              style={{ flex:1, background:"var(--bg)", border:"1px solid var(--border)", borderRadius:10,
                padding:"9px 12px", color:"var(--text)", fontSize:14, outline:"none" }} />
            <button onClick={() => send(input)} disabled={loading || !input.trim()}
              style={{ background:"var(--gold)", color:"#000", border:"none", borderRadius:10, padding:"0 15px",
                fontWeight:700, cursor: loading || !input.trim() ? "default" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }}>
              &rarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
