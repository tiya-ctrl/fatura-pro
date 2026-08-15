import { useEffect, useState } from "react";

const KEY = "fatura_cookie_consent";
const ANALYTICS_ID = "xjcvo64scy";

function startAnalytics() {
  if (window.clarity || document.getElementById("analytics-tag")) return;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.id = "analytics-tag"; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", ANALYTICS_ID);
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let choice = null;
    try { choice = localStorage.getItem(KEY); } catch (e) {}
    if (choice === "yes") startAnalytics();
    else if (!choice) setShow(true);
  }, []);

  const decide = (accepted) => {
    try { localStorage.setItem(KEY, accepted ? "yes" : "no"); } catch (e) {}
    if (accepted) startAnalytics();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{ position:"fixed", left:12, right:12, bottom:12, zIndex:500, maxWidth:520, margin:"0 auto", background:"#111118", border:"1px solid rgba(201,168,76,0.35)", borderRadius:14, padding:"16px 18px", boxShadow:"0 12px 40px rgba(0,0,0,0.55)", fontFamily:"DM Sans, sans-serif" }}>
      <div style={{ color:"#e8e4dc", fontSize:14, fontWeight:600, marginBottom:6 }}>Cookies</div>
      <div style={{ color:"#9a9690", fontSize:13, lineHeight:1.7, marginBottom:14 }}>
        We use essential cookies to keep you signed in. With your permission we also measure how the site is used, so we can improve it. You can change your mind anytime.{" "}
        <a href="/privacy" style={{ color:"#c9a84c" }}>Privacy Policy</a>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={() => decide(true)} style={{ flex:1, padding:"10px", borderRadius:9, background:"#c9a84c", color:"#000", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"DM Sans, sans-serif" }}>Accept</button>
        <button onClick={() => decide(false)} style={{ flex:1, padding:"10px", borderRadius:9, background:"transparent", color:"#9a9690", border:"1px solid rgba(255,255,255,0.18)", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"DM Sans, sans-serif" }}>Essential only</button>
      </div>
    </div>
  );
}
