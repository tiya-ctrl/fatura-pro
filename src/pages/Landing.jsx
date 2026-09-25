import LanguageLinks from "../components/LanguageLinks";
import { useState, useRef, useEffect } from "react";
import { trackEvent } from "../lib/tracking";
import { storeReferralCode } from "../lib/referrals";
import { applyPageSeo } from "../lib/pageSeo";
import { initLandingMotion } from "../lib/landingMotion";
import "./landing-v2.en.css";

// Landing page design lives in landing-v2.en.css (generated from public/landing-v2.css,
// scoped to .lv2). The chat widget keeps its original styles below.
const CHAT_CSS = `
:root {
  --gold: var(--brand-primary, #6366F1); --gold-l: var(--brand-highlight, #7C6CF2); --gold-dim: rgba(var(--brand-primary-rgb, 99,102,241),0.13);
  --bg: #08080e; --bg2: #0f0f17; --bg3: #16161f; --bg4: #1c1c27;
  --border: rgba(99,102,241,0.16); --border2: rgba(255,255,255,0.07);
  --text: #e8e4dc; --text2: #9a9690; --text3: #5a5750;
  --green: #4caf89; --red: #e05555; --radius: 14px;
}
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
/* chatbot */
.chat-btn {
  position:fixed; bottom:28px; right:28px; z-index:200;
  width:56px; height:56px; border-radius:50%; background:var(--gold);
  border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
  font-size:24px; box-shadow:0 6px 24px rgba(99,102,241,0.5);
  transition:transform 0.2s, box-shadow 0.2s; animation:float 4s ease-in-out infinite;
}
.chat-btn:hover { transform:scale(1.1); box-shadow:0 8px 32px rgba(99,102,241,0.6); }
.chat-window {
  position:fixed; bottom:96px; right:28px; z-index:200;
  width:360px; max-width:calc(100vw - 40px);
  background:var(--bg2); border:1px solid var(--border);
  border-radius:20px; box-shadow:0 24px 64px rgba(0,0,0,0.6);
  display:flex; flex-direction:column; overflow:hidden;
  animation:fadeUp 0.25s ease;
}
.chat-head {
  background:linear-gradient(135deg, var(--bg3) 0%, #1a1520 100%);
  padding:16px 18px; border-bottom:1px solid var(--border);
  display:flex; align-items:center; gap:12px;
}
.chat-head-avatar {
  width:38px;height:38px;border-radius:50%;background:var(--gold);
  display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#000;
  flex-shrink:0;
}
.chat-head-info { flex:1; }
.chat-head-name { font-size:14px; font-weight:700; color:var(--text); }
.chat-head-status { font-size:11px; color:var(--green); display:flex; align-items:center; gap:5px; }
.chat-head-dot { width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite; }
.chat-close { background:none;border:none;color:var(--text2);cursor:pointer;font-size:18px;padding:4px; }
.chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; max-height:360px; min-height:120px; }
/* Never taller than the screen above the chat button (short laptop and phone screens). */
.chat-window { max-height:calc(100vh - 130px); max-height:calc(100dvh - 130px); }
body:has(.sticky-cta.show) .chat-window { max-height:calc(100dvh - 190px); }
.chat-msg { max-width:85%; display:flex; flex-direction:column; gap:3px; }
.chat-msg.user { align-self:flex-end; align-items:flex-end; }
.chat-msg.bot  { align-self:flex-start; }
.chat-bubble {
  padding:10px 14px; border-radius:14px; font-size:13px; line-height:1.6; white-space:pre-wrap; overflow-wrap:anywhere;
}
.chat-msg.user .chat-bubble { background:var(--gold); color:#000; border-radius:14px 14px 4px 14px; }
.chat-msg.bot  .chat-bubble { background:var(--bg3); color:var(--text); border:1px solid var(--border2); border-radius:14px 14px 14px 4px; }
.chat-time { font-size:10px; color:var(--text3); padding:0 4px; }
.chat-typing { display:flex; gap:5px; padding:12px 14px; background:var(--bg3); border:1px solid var(--border2);
  border-radius:14px 14px 14px 4px; width:52px; }
.chat-typing span { width:7px;height:7px;border-radius:50%;background:var(--text2); animation:pulse 1.2s infinite; }
.chat-typing span:nth-child(2) { animation-delay:0.2s; }
.chat-typing span:nth-child(3) { animation-delay:0.4s; }
.chat-suggestions { padding:8px 16px 4px; display:flex; gap:6px; flex-wrap:wrap; }
.chat-sug { font-size:11px; background:var(--bg3); border:1px solid var(--border2);
  border-radius:20px; padding:5px 12px; cursor:pointer; color:var(--text2);
  transition:all 0.15s; white-space:nowrap; font-family:inherit; }
.chat-sug:hover { border-color:var(--gold); color:var(--gold); }
.chat-input-row { padding:12px 14px; border-top:1px solid var(--border2); display:flex; gap:8px; align-items:flex-end; }
.chat-input {
  flex:1; background:var(--bg3); border:1px solid var(--border2); border-radius:10px;
  color:var(--text); font-size:13px; padding:10px 12px; font-family:'DM Sans',sans-serif;
  outline:none; resize:none; max-height:100px; min-height:40px; transition:border-color 0.2s;
  line-height:1.5;
}
.chat-input:focus { border-color:var(--gold); }
.chat-send {
  width:38px;height:38px;border-radius:9px;background:var(--gold);border:none;
  cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;
  flex-shrink:0; transition:all 0.2s; color:#000;
}
.chat-send:hover { background:var(--gold-l); transform:scale(1.05); }
.chat-send:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
/* mobile */
@media(max-width:500px){
  .chat-window { right:14px; bottom:86px; width:calc(100vw - 28px); }
  .chat-btn { right:18px; bottom:20px; }
}
@media(max-width:720px){
  body:has(.sticky-cta.show) .chat-btn { bottom:96px; }
  body:has(.sticky-cta.show) .chat-window { bottom:162px; }
}
`;

const timeStr = () => new Date().toLocaleTimeString("en", { hour:"2-digit", minute:"2-digit" });
// The assistant writes **bold** markdown. Show it as bold instead of printing the asterisks.
const richText = (text) => String(text).split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
  part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part);

/* ─── CHATBOT ────────────────────────────────────────────────── */
const SUGGESTIONS = ["What's in the Essential plan?", "كيف تشتغل؟", "Do I need a company?", "How does the trial work?"];
const INIT_MSG = { role:"bot", text:"Hey! 👋 I'm Fatūra's AI assistant. Ask me anything about features, pricing, or how to get started.", time: timeStr() };

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([INIT_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role:"user", text: text.trim(), time: timeStr() };
    setMsgs(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...msgs.filter(m => m.role !== "bot" || m !== INIT_MSG), userMsg]
        .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot: "landing",
          lang: "en",
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response. Please try again.";
      setMsgs(m => [...m, { role: "bot", text: reply, time: timeStr() }]);
    } catch {
      setMsgs(m => [...m, { role:"bot", text:"Something went wrong. Please try again in a moment.", time: timeStr() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      {open && (
        <div className="chat-window">
          <div className="chat-head">
            <div className="chat-head-avatar">F</div>
            <div className="chat-head-info">
              <div className="chat-head-name">Fatūra Assistant</div>
              <div className="chat-head-status"><span className="chat-head-dot" />Online · Replies instantly</div>
            </div>
            <button className="chat-close" aria-label="Close chat" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="chat-bubble" style={{ direction: /[؀-ۿ]/.test(m.text) ? "rtl" : "ltr", textAlign: /[؀-ۿ]/.test(m.text) ? "right" : "left" }}>{richText(m.text)}</div>
                <div className="chat-time">{m.time}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <div className="chat-typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {msgs.length <= 2 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button type="button" key={i} className="chat-sug" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}
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
            <button className="chat-send" onClick={() => send(input)} disabled={loading || !input.trim()}>
              {loading ? <span style={{ width:14,height:14,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }} /> : "↑"}
            </button>
          </div>
        </div>
      )}
      <button className="chat-btn" onClick={() => setOpen(o => !o)} title="Chat with us" aria-label={open ? "Close chat" : "Chat with the AI assistant"}>
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}

/* ─── CONTENT ────────────────────────────────────────────────── */
const TRUST = ["Free plan, no credit card", "Essential from €9 per month", "Cancel anytime"];

// Feature bubbles around the product shot (rotated by initLandingMotion).
const HERO_CHIPS = [["✓", "Credit notes on every plan"], ["18", "currencies, kept separate"], ["PDF", "Branded PDF invoices"], ["↻", "Reminders by email & WhatsApp"], ["%", "Deposits & partial payments"], ["XML", "UBL export for EN 16931"], ["5", "invoice languages"], ["→", "Quotes become invoices"], ["€", "Card payments via Stripe"]];

const FACTS = [
  ["18", "currencies, balances kept separate"],
  ["5", "languages for your invoices"],
  ["5", "languages for payment reminders"],
  ["UBL/XML", "export for EN 16931 workflows"],
];

const STEPS = [
  ["Set up your profile", "Add your company name, logo, address and bank details once. They appear on every invoice."],
  ["Add your client and line items", "Pick a saved client or add a new one, choose the invoice language and currency, and list your services."],
  ["Export and track payment", "Save or print the PDF, send it your way, and see what is paid, pending or overdue at a glance."],
];

const SHOWCASE_POINTS = [
  "Interface language and invoice language are separate settings.",
  "Each currency keeps its own total, with no exchange rates applied.",
  "VAT, discounts and deposits are calculated automatically.",
];

const AUDIENCES = [
  ["Independent", "Freelancers with clients in more than one country", "Invoice in the client’s currency, reuse their details, ask for a deposit and follow up without turning your work into bookkeeping.", "/for-freelancers", "Invoicing for freelancers"],
  ["Client services", "Consultants and agencies selling projects or retainers", "Move from quote to invoice, schedule recurring work, separate business profiles and see what every client still owes.", "/for-agencies", "Workflows for agencies"],
  ["Growing teams", "Small businesses that need structure, not an ERP", "Share one client and invoice workspace with up to five people, connect online payments and export clean records for your accountant.", "#pricing", "Compare plans"],
];

const FEATURES = [
  ["free", "globe", "Multi-currency invoicing that stays honest", "Invoice international clients in 18 currencies. EUR, USD, GBP, AED and every other balance stays separate, with no conversion hiding what you were actually paid."],
  ["free", "users", "Enter client details once", "Save clients and business details, then reuse them on every invoice. Less retyping, fewer mistakes, faster billing."],
  ["free", "undo", "Credit notes on every plan", "Correct an issued invoice with a credit note that has its own number, a negative amount and a reference to the original. Included on every plan, including Free."],
  ["essential", "bell", "Know what is paid, and what is late", "Track pending, partial, paid and overdue invoices. Record deposits, prepare a clear reminder, review it, then open it in email or WhatsApp to send."],
  ["essential", "code", "PDF for people. UBL XML for systems.", "Create branded PDF invoices and export UBL XML for EN 16931 workflows. Validate the profile your customer requires; UBL export is not Peppol delivery."],
  ["advanced", "chart", "Quotes, expenses and VAT summaries", "Turn an accepted quote into an invoice, schedule recurring invoices for review, log expenses and see quarterly VAT/BTW summaries per currency."],
];

const WHY = [
  ["A structured e-invoice, not just a PDF", "Export invoices as UBL XML built for EN 16931 workflows. Credit notes export too, as document type 381."],
  ["Currencies are never converted", "Bill in 18 currencies and each keeps its own total. You see EUR 5,410 and USD 1,440 side by side, never one invented figure based on yesterday’s rate."],
  ["Corrections leave a clear trail", "Instead of silently rewriting an issued invoice, create a credit note with its own number and a reference to the original."],
  ["Deposits that actually add up", "Take 50% up front and the invoice shows a real balance. Revenue counts what arrived, and reminders chase what is still owed."],
];

const PLANS = {
  free: { name: "Free", price: 0, desc: "For freelancers who are just getting started.", items: ["20 invoices and 5 clients", "All 18 currencies", "Dashboard totals and invoice overview", "PDF export and print", "Your own logo and branding", "Credit notes"], cta: "Start free" },
  pro: { name: "Essential", price: 9, desc: "Unlimited invoicing, with payment reminders.", items: ["Everything in Free", "Unlimited invoices and clients", "Editable payment reminders in 5 languages by email and WhatsApp (you send them)", "Deposits and partial payments", "UBL/XML export for EN 16931 workflows (no Peppol delivery)"], cta: "Try Essential free", foot: "7-day free trial, automatic · no card needed" },
  business: { name: "Advanced", price: 19, desc: "For agencies and teams managing many clients.", items: ["Everything in Essential", "Quotes that convert to invoices", "Expenses and quarterly VAT/BTW summary", "Recurring invoices created for your review", "Up to 5 team members and multiple business profiles", "Online card payments via Stripe", "API access and accountant CSV export", "Remove Fatūra branding", "Priority support"], cta: "Try Advanced free for 7 days", foot: "7-day free trial · card via Stripe · cancel anytime" },
};

const FAQS = [
  ["Is Fatūra Pro free to use?", "Yes. The Free plan lets you create up to 20 invoices for 5 clients, with PDF export, your logo and credit notes, and no credit card. For unlimited invoicing, Essential costs €9 per month excluding VAT."],
  ["Can I invoice in different currencies?", "Yes, in 18 currencies. Amounts are never converted between them: each currency keeps its own total, so you always see exactly what you were paid in the currency you were paid in."],
  ["Can I create an invoice in another language?", "Yes. The invoice document language is set per invoice: English, Dutch, French, Spanish or Arabic, and the printable document supports right-to-left text. The app itself is available in English, Dutch, French, Spanish and Arabic."],
  ["Can I create a UBL invoice with Fatūra Pro?", "Yes. Invoices and credit notes can be exported as UBL/XML files intended for EN 16931 workflows. Receiving systems can apply extra rules, so confirm the required profile and validate the file before delivery."],
  ["Does Fatūra Pro send invoices through Peppol?", "No. Fatūra Pro exports a downloadable UBL/XML file, but it is not connected to the Peppol network and is not an approved platform under national e-invoicing schemes. You deliver the file using the method your customer requests."],
  ["How do I make a credit note?", "Open the invoice and press Credit. Fatūra Pro creates a separate document with its own number, a negative amount and a reference to the original invoice. Credit notes are included on every plan, including Free."],
  ["Can I ask for a deposit and invoice the rest later?", "Yes. Record what you received, for example 50% up front, and the invoice shows as partially paid with the balance still owed. Reminders then chase the balance rather than the full amount."],
  ["How does the payment reminder work?", "When an invoice passes its due date, it is marked overdue. You choose a polite, firm or final tone, review the prepared message, then open it in email or WhatsApp to send it yourself."],
  ["Do I need a registered company to start?", "No. Freelancers, sole traders and small businesses can start without a registered company or VAT number. Whether you must register to invoice depends on the rules that apply to you."],
  ["Can clients pay an invoice online?", "Advanced accounts can connect Stripe so clients can pay by card from the invoice payment page. Available payment methods depend on the connected Stripe account and region."],
  ["Does Fatūra Pro have a referral program?", "Yes. Open Settings and choose Earn Essential to copy your personal link. A friend who joins through it receives 7 extra Essential days after creating their first valid invoice, and every three activated friends earn you 30 Essential days."],
  ["How is my data handled?", "Account and invoice data is hosted in the European Union (Ireland) and connections are encrypted. We do not sell personal data. The Privacy Policy explains how to request access, export or deletion."],
];

const FOOTER_COLUMNS = [
  ["Product", [["#features", "Features"], ["#how", "How it works"], ["#pricing", "Pricing"], ["#referrals", "Referral rewards"], ["/invoice-generator", "Free invoice generator"], ["/api-docs", "API documentation"]]],
  ["Solutions", [["/for-freelancers", "For freelancers"], ["/for-agencies", "For agencies and teams"], ["/ubl-factuur-maken", "UBL invoice export (NL)"], ["/nl", "Factuurprogramma (NL)"]]],
  ["Resources", [["/blog", "Invoicing guides"], ["/late-payment-scripts", "Late-payment scripts"], ["/blog/how-to-create-ubl-invoice-en16931", "UBL invoice guide"], ["/blog/how-to-create-professional-invoice", "Professional invoice guide"]]],
  ["Company", [["/ambassadors", "Ambassador program"], ["mailto:support@faturapro.app", "Contact support"], ["/privacy", "Privacy policy"], ["/terms", "Terms of service"], ["https://x.com/Faturapro", "Follow on X"]]],
];

const CURRENCIES = [["EUR", "€"], ["USD", "$"], ["GBP", "£"], ["AED", "د.إ"], ["SAR", "﷼"], ["QAR", "ر.ق"], ["KWD", "د.ك"], ["MAD", "د.م"], ["DZD", "دج"], ["TND", "د.ت"], ["EGP", "ج.م"], ["TRY", "₺"], ["JPY", "¥"], ["MYR", "RM"], ["IDR", "Rp"]];

const ICONS = {
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  undo: <><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
  code: <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />,
  chart: <><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></>,
  mobile: <><rect x="6" y="2.5" width="12" height="19" rx="2" /><path d="M11 18.5h2" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></>,
};
const Icon = ({ name }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);
// Decorative visuals for the large ("bento") feature cards. No text content.
const VIZ = {
  globe: <div className="cloud">{["EUR", "USD", "GBP", "AED", "SAR", "MAD", "TRY"].map((c) => <span key={c}>{c}</span>)}</div>,
  bell: <><div className="ring"><Icon name="bell" /></div><span className="bub b1" /><span className="bub b2" /></>,
  code: (
    <pre className="xml">
      {"<"}<span className="t">Invoice</span>{">"}{"\n"}
      {"  <"}<span className="t">cbc:ID</span>{">"}<span className="v">INV-014</span>{"</…>"}{"\n"}
      {"  <"}<span className="t">cbc:InvoiceTypeCode</span>{">"}<span className="v">380</span>{"</…>"}{"\n"}
      {"  <"}<span className="t">cac:LegalMonetaryTotal</span>{">"}{"\n"}
      {"    "}<span className="v">1452.00 EUR</span>{"\n"}
      {"</"}<span className="t">Invoice</span>{">"}
    </pre>
  ),
};
const WIDE = [0, 3, 4];

const Check = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 10.5l3.2 3L15 7" /></svg>;
const TAG = { free: ["tag", "Free"], essential: ["tag essential", "Essential"], advanced: ["tag advanced", "Advanced"] };

/* ─── PAGE ───────────────────────────────────────────────────── */
export default function LandingPage({ onOpenApp }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const canonical = "https://faturapro.app/";
    const cleanupSeo = applyPageSeo({
      title:"Multi-Currency Invoicing Software for Freelancers | Fatūra Pro",
      description:"Multi-currency invoicing software for freelancers and small businesses. Create invoices and quotes, track payments and expenses, and export UBL/XML. Start free.",
      canonical,
      language:"en",
      locale:"en_US",
      alternates:{
        en:canonical,
        nl:"https://faturapro.app/nl",
        es:"https://faturapro.app/es",
        fr:"https://faturapro.app/fr",
        ar:"https://faturapro.app/ar",
        "x-default":canonical,
      },
    });
    const params = new URLSearchParams(window.location.search);
    const referralCode = params.get("ref");
    if (storeReferralCode(referralCode)) {
      trackEvent("referral_link_landing_viewed", { campaign:"member_referral" });
    }
    if (params.get("utm_source") === "invoice") {
      trackEvent("invoice_referral_landing_viewed", {
        medium:(params.get("utm_medium") || "footer").slice(0, 40),
        campaign:(params.get("utm_campaign") || "made_with_fatura_pro").slice(0, 64),
      });
    }
    return cleanupSeo;
  }, []);

  useEffect(() => initLandingMotion(rootRef.current), []);

  // Sign-up links are real links (good for crawlers and "open in new tab"); a normal
  // click keeps the existing in-app flow, including the chosen trial plan.
  const signup = (source, plan) => (e) => {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) return;
    if (e) e.preventDefault();
    try {
      if (plan) localStorage.setItem("fatura_intent_plan", plan);
    } catch {}
    trackEvent(source.startsWith("pricing") ? "pricing_cta_clicked" : "landing_cta_clicked", { placement:source, plan:plan || "free" });
    onOpenApp({ signup:true, source });
  };
  const signupHref = (source, plan) => "/login?signup=1&source=" + source + (plan ? "&plan=" + plan : "");
  const signIn = (e) => { if (e) e.preventDefault(); onOpenApp(); };

  const plan = (key, featured, delay, btn) => {
    const p = PLANS[key];
    const trialPlan = key === "free" ? null : key;
    return (
      <article className={"plan reveal" + (featured ? " featured" : "")} style={delay ? { "--d": delay + "ms" } : undefined}>
        {featured && <span className="plan-badge">Best for freelancers</span>}
        <div className="plan-name">{p.name}</div>
        <p className="plan-desc">{p.desc}</p>
        <div className="price">€{p.price}{p.price > 0 && <small> / month</small>}</div>
        {p.price > 0 && <div className="tax-note">excl. VAT</div>}
        <ul>{p.items.map((x) => <li key={x}>{x}</li>)}</ul>
        {p.foot && <p className="plan-foot">{p.foot}</p>}
        <a className={"button block " + btn} href={signupHref("pricing_" + key, trialPlan)} onClick={signup("pricing_" + key, trialPlan)}>{p.cta}</a>
      </article>
    );
  };

  return (
    <>
      <div className="lv2 js" ref={rootRef}>
        <div className="progress" aria-hidden="true" />
        <a className="skip" href="#main">Skip to content</a>

        <header className="nav"><div className="wrap nav-inner">
          <a className="brand" href="/" aria-label="Fatūra Pro"><img src="/fatura-mark.svg" alt="" width="34" height="34" /><span>Fatura<b>Pro</b></span></a>
          <nav className="nav-links" aria-label="Page sections">
            <a href="#how">How it works</a><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="/invoice-generator">Free generator</a><a href="/blog">Guides</a>
          </nav>
          <LanguageLinks current="en" />
          <div className="nav-end">
            <a className="button ghost small" href="/login" onClick={signIn}>Sign in</a>
            <a className="button primary small" href={signupHref("nav")} onClick={signup("nav")}>Start free</a>
            <details className="menu">
              <summary aria-label="Menu"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg></summary>
              <div className="menu-panel">
                <a href="#how">How it works</a><a href="#features">Features</a><a href="#pricing">Pricing</a><a href="/invoice-generator">Free invoice generator</a><a href="/blog">Guides</a>
                <a href="/login" onClick={signIn}>Sign in</a>
                <a className="button primary block" href={signupHref("menu")} onClick={signup("menu")}>Start free</a>
              </div>
            </details>
          </div>
        </div></header>

        <main id="main">
          <section className="hero" id="top">
            <div className="aurora" aria-hidden="true"><i /><i /><i /></div>
            <div className="gridlines" aria-hidden="true" />
            <div className="wrap hero-grid">
              <div>
                <span className="kicker reveal"><span className="pulse" aria-hidden="true" />Invoicing software for freelancers &amp; small businesses</span>
                <h1><span className="line">Send professional invoices in minutes.</span> <span className="line"><em className="accent grad">Then follow up until you’re paid.</em></span></h1>
                <p className="lead reveal" style={{ "--d":"200ms" }}>Multi-currency invoicing software for freelancers: branded invoices, quotes, credit notes and payment reminders by email or WhatsApp, in 18 currencies.</p>
                <div className="actions reveal" style={{ "--d":"320ms" }}>
                  <a className="button primary" href={signupHref("hero_primary")} onClick={signup("hero_primary")}>Create your first invoice, free <span className="arrow" aria-hidden="true">→</span></a>
                  <a className="button ghost" href="#how">See how it works</a>
                </div>
                <ul className="trust reveal" style={{ "--d":"420ms" }}>{TRUST.map((t) => <li key={t}><Check />{t}</li>)}</ul>
                <p className="hero-links reveal" style={{ "--d":"480ms" }}>Invoicing <a href="/for-freelancers">for freelancers</a> · <a href="/for-agencies">for agencies &amp; small business</a></p>
              </div>
              <div className="stage stage-in">
                <figure className="shot" aria-label="Real screenshot of the Fatūra Pro dashboard" data-chips={JSON.stringify(HERO_CHIPS)}>
                  <div className="shot-frame"><div className="shot-inner"><img src="/hero-dashboard.png" width="1362" height="596" alt="Fatura Pro dashboard showing invoices, revenue, pending and overdue payments" fetchpriority="high" decoding="async" /></div></div>
                  {HERO_CHIPS.slice(0, 3).map(([dot, label], i) => (
                    <div key={i} className={"chip c" + (i + 1) + " p" + (i + 1)} aria-hidden="true"><span className="dot">{dot}</span><span className="lbl">{label}</span></div>
                  ))}
                  <figcaption>Real screenshot of the dashboard</figcaption>
                </figure>
              </div>
            </div>
          </section>

          <div className="marquee" aria-label="Examples of supported currencies"><div className="marquee-track">
            {CURRENCIES.map(([c, s]) => <span className="cur" key={c}><b>{c}</b><span>{s}</span></span>)}
            {CURRENCIES.map(([c, s]) => <span className="cur" key={c + "-2"} aria-hidden="true"><b>{c}</b><span>{s}</span></span>)}
          </div></div>

          <div className="facts" aria-label="Key facts"><div className="wrap"><ul>
            {FACTS.map(([v, t], i) => <li className="reveal" key={t} style={i ? { "--d": i * 80 + "ms" } : undefined}><strong data-count={/^\d+$/.test(v) ? v : undefined}>{v}</strong><span>{t}</span></li>)}
          </ul></div></div>

          <section id="how" className="section"><div className="wrap">
            <div className="section-head reveal"><span className="eyebrow">How it works</span><h2 className="section-title">From setup to sent invoice <em>in three clear steps.</em></h2><p>No accounting knowledge needed. You fill in the details; Fatūra does the maths and the layout.</p></div>
            <ol className="steps reveal">{STEPS.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}</ol>
          </div></section>

          <section className="section tight"><div className="wrap showcase">
            <div className="showcase-copy reveal">
              <span className="eyebrow">For international clients</span>
              <h2 className="section-title">Your workspace in English, <em>the invoice in your client’s language.</em></h2>
              <p className="lead">Invoicing a client in the Netherlands, France or the Gulf? Choose the document language and currency for each invoice, while your own workspace stays in the language you prefer.</p>
              <ul>{SHOWCASE_POINTS.map((t) => <li key={t}><Check />{t}</li>)}</ul>
            </div>
            <div className="demo reveal" style={{ "--d":"150ms" }} data-start="en">
              <div className="demo-ui">
                <small>Choose the invoice language:</small>
                <div className="lang-switch" role="group" aria-label="Language of the example invoice">
                  {["en", "nl", "fr", "es", "ar"].map((l) => <button type="button" key={l} data-lang={l} aria-pressed={l === "en" ? "true" : "false"}>{l.toUpperCase()}</button>)}
                </div>
              </div>
              <div className="invoice" aria-live="polite">
                <div className="inv-body" lang="en" dir="ltr">
                  <div className="inv-head"><div><div className="inv-title" data-k="invoice">Invoice</div><div className="inv-no">INV-2026-014</div></div><span className="inv-badge" data-k="paid">Paid</span></div>
                  <div className="inv-row"><span data-k="description">Description</span><span data-k="service">Website design</span></div>
                  <div className="inv-row"><span data-k="subtotal">Subtotal</span><span data-k="sub">€1,200.00</span></div>
                  <div className="inv-row"><span data-k="vat">VAT 21%</span><span data-k="vatv">€252.00</span></div>
                  <div className="inv-row total"><span data-k="total">Total due</span><span data-k="totalv">€1,452.00</span></div>
                </div>
              </div>
              <p className="demo-note">Example: the same invoice details, in your client’s language</p>
            </div>
          </div></section>

          <section id="features" className="section tight"><div className="wrap">
            <div className="section-head reveal"><span className="eyebrow">Features</span><h2 className="section-title">From “I should invoice them” <em>to paid and recorded.</em></h2><p>The everyday invoicing workflow, built around real clients, multiple currencies, deposits, reminders and repeat work.</p></div>
            <div className="features">
              {FEATURES.map(([tag, icon, h, p], i) => {
                const body = <><span className={TAG[tag][0]}>{TAG[tag][1]}</span><div className="icon"><Icon name={icon} /></div><h3>{h}</h3><p>{p}</p></>;
                const wide = WIDE.includes(i) && VIZ[icon];
                return (
                  <article className={"feature reveal" + (wide ? " wide" : "")} key={h} style={i % 3 ? { "--d": (i % 3) * 80 + "ms" } : undefined}>
                    {wide ? <><div className="copy">{body}</div><div className="viz" aria-hidden="true">{VIZ[icon]}</div></> : body}
                  </article>
                );
              })}
            </div>
          </div></section>

          <section id="solutions" className="section tight"><div className="wrap">
            <div className="section-head reveal"><span className="eyebrow">Built around your work</span><h2 className="section-title">Not accounting software <em>with invoicing buried inside.</em></h2></div>
            <div className="features">
              {AUDIENCES.map(([k, h, p, href, link], i) => (
                <article className="feature audience reveal" key={h} style={i ? { "--d": i * 80 + "ms" } : undefined}>
                  <span className="audience-kicker">{k}</span><h3>{h}</h3><p>{p}</p>
                  <a className="audience-link" href={href}>{link} <span className="arrow" aria-hidden="true">→</span></a>
                </article>
              ))}
            </div>
          </div></section>

          <section className="section tight"><div className="wrap">
            <div className="section-head reveal"><span className="eyebrow">Why Fatūra Pro</span><h2 className="section-title">Small details that prevent <em>expensive confusion.</em></h2></div>
            <div className="features why">
              {WHY.map(([h, p], i) => <article className="feature reveal" key={h} style={i % 2 ? { "--d":"80ms" } : undefined}><h3>{h}</h3><p>{p}</p></article>)}
            </div>
          </div></section>

          <section id="pricing" className="section tight"><div className="wrap">
            <div className="section-head reveal"><span className="eyebrow">Pricing</span><h2 className="section-title">Start free, <em>upgrade when you’re ready.</em></h2><p>Monthly plans, no contract, cancel anytime.</p></div>
            <div className="plans">{plan("free", false, 0, "ghost")}{plan("pro", true, 100, "primary")}{plan("business", false, 200, "ghost")}</div>
            <p className="pricing-note">Prices exclude VAT. Billed monthly through Stripe; cancel anytime.</p>
          </div></section>

          <section id="referrals" className="section tight"><div className="wrap"><div className="guide reveal">
            <div>
              <h2>Share good invoicing. Earn Essential together.</h2>
              <p>Your friend receives 7 extra Essential days after their first real invoice, and every three activated friends earn you 30 Essential days. Find your link in Settings → Earn Essential.</p>
              <p className="guide-link"><a href="/ambassadors" onClick={() => trackEvent("ambassador_program_clicked", { placement:"landing_referral_section" })}>Creator, consultant or community leader? Join the ambassador program →</a></p>
            </div>
            <a className="button ghost" href={signupHref("referral_program")} onClick={signup("referral_program")}>Start free &amp; get your link <span className="arrow" aria-hidden="true">→</span></a>
          </div></div></section>

          <section className="section tight"><div className="wrap"><div className="guide reveal">
            <div>
              <h2>Use Fatūra as a mobile app</h2>
              <p>No app store needed. On iPhone, open Fatūra in Safari and tap Share → Add to Home Screen. On Android, open it in Chrome and tap ⋮ → Add to Home Screen.</p>
            </div>
            <div className="icon big" aria-hidden="true"><Icon name="mobile" /></div>
          </div></div></section>

          <section id="faq" className="section tight"><div className="wrap">
            <div className="section-head reveal"><span className="eyebrow">FAQ</span><h2 className="section-title">Questions? <em>Clear answers.</em></h2></div>
            <div className="faq reveal">
              {FAQS.map(([q, a], i) => <details key={q} open={i === 0}><summary><h3>{q}</h3></summary><p>{a}</p></details>)}
            </div>
          </div></section>

          <section className="section tight"><div className="wrap"><div className="cta reveal">
            <h2 className="section-title">Your next invoice should take <em>minutes, not your evening.</em></h2>
            <p>Create an account, add a client and preview your first invoice. Free plan available, no credit card required.</p>
            <div className="actions">
              <a className="button primary" href={signupHref("final_cta")} onClick={signup("final_cta")}>Create your first invoice, free <span className="arrow" aria-hidden="true">→</span></a>
              <a className="button ghost" href={signupHref("final_advanced", "business")} onClick={signup("final_advanced", "business")}>Try Advanced free for 7 days</a>
            </div>
          </div></div></section>
        </main>

        <footer><div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="/"><img src="/fatura-mark.svg" alt="" width="30" height="30" /><span>Fatura<b>Pro</b></span></a>
              <p>Multi-currency invoicing software for freelancers, consultants and small service businesses working across borders.</p>
              <p className="legal-note">Account data hosted in the EU (Ireland) · UBL XML export · Not a Peppol access point</p>
            </div>
            {FOOTER_COLUMNS.map(([title, links]) => (
              <div className="foot-col" key={title}><h4>{title}</h4>
                {links.map(([href, label]) => <a key={href} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>{label}</a>)}
              </div>
            ))}
          </div>
          <div className="legal-note foot-bottom">© 2026 Fatūra Pro · Invoicing software for business without borders</div>
        </div></footer>
        <div className="sticky-cta" aria-hidden="true"><a className="button primary block" tabIndex={-1} href={signupHref("sticky")} onClick={signup("sticky")}>Create your first invoice, free <span className="arrow" aria-hidden="true">→</span></a></div>
      </div>
      <style>{CHAT_CSS}</style>
      <Chatbot />
    </>
  );
}
