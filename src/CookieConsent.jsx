import { useEffect, useState } from "react";
import useDocumentLanguage from "./lib/useDocumentLanguage";

const KEY = "fatura_cookie_consent";
const ANALYTICS_ID = "xjcvo64scy";

function loadClarity() {
  /** @type {any} */
  const clarity = window["clarity"] || function () {
    (clarity.q = clarity.q || []).push(arguments);
  };
  window["clarity"] = clarity;

  if (!document.getElementById("analytics-tag")) {
    const script = document.createElement("script");
    script.async = true;
    script.id = "analytics-tag";
    script.src = `https://www.clarity.ms/tag/${ANALYTICS_ID}`;
    document.head.appendChild(script);
  }
}

function setClarityConsent(accepted) {
  loadClarity();
  window["clarity"]("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: accepted ? "granted" : "denied",
  });
}

export default function CookieConsent() {
  // Follow the language of the page on screen, not only the saved interface language.
  const ar = useDocumentLanguage() === "ar";
  const [show, setShow] = useState(false);

  useEffect(() => {
    let choice = null;
    try { choice = localStorage.getItem(KEY); } catch (e) {}
    setClarityConsent(choice === "yes");
    if (!choice) setShow(true);
  }, []);

  const decide = (accepted) => {
    try { localStorage.setItem(KEY, accepted ? "yes" : "no"); } catch (e) {}
    setClarityConsent(accepted);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div dir={ar ? "rtl" : "ltr"} style={{ position:"fixed", left:12, right:12, bottom:12, zIndex:500, maxWidth:520, margin:"0 auto", background:"#111118", border:"1px solid rgba(99,102,241,0.35)", borderRadius:14, padding:"16px 18px", boxShadow:"0 12px 40px rgba(0,0,0,0.55)", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ color:"#e8e4dc", fontSize:14, fontWeight:600, marginBottom:6 }}>{ar ? "ملفات تعريف الارتباط" : "Cookies"}</div>
      <div style={{ color:"#9a9690", fontSize:13, lineHeight:1.7, marginBottom:14 }}>
        {ar ? "نستخدم ملفات ضرورية للحفاظ على تسجيل دخولك، وقياسًا محدودًا بلا ملفات تعريف ارتباط. وبموافقتك تربط ملفات التحليلات الصفحات ضمن جلسة واحدة حتى نتمكن من تحسين المنتج. يمكنك تغيير قرارك في أي وقت. " : "We use essential cookies to keep you signed in, plus limited cookieless measurement. With your permission, analytics cookies connect pages into one session so we can improve the product. You can change your mind anytime. "}
        <a href="/privacy" style={{ color:"var(--brand-primary)" }}>{ar ? "سياسة الخصوصية" : "Privacy Policy"}</a>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={() => decide(true)} style={{ flex:1, padding:"10px", borderRadius:9, background:"var(--brand-primary)", color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{ar ? "موافقة" : "Accept"}</button>
        <button onClick={() => decide(false)} style={{ flex:1, padding:"10px", borderRadius:9, background:"transparent", color:"#9a9690", border:"1px solid rgba(255,255,255,0.18)", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{ar ? "الضرورية فقط" : "Essential only"}</button>
      </div>
    </div>
  );
}
