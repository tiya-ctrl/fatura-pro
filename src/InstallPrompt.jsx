import { useEffect, useState } from "react";

const GOLD = "#c9a84c";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("fatura_install_dismissed")) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    if (standalone) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setTimeout(() => setShow(true), 20000);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const ua = window.navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    let t;
    if (isIos && isSafari) t = setTimeout(() => setShow(true), 25000);

    window.addEventListener("fatura-install", () => setShow(true));
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); if (t) clearTimeout(t); };
  }, []);

  const dismiss = () => {
    setShow(false);
    setIosHelp(false);
    localStorage.setItem("fatura_install_dismissed", "1");
  };

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) {}
      setDeferred(null);
      dismiss();
    } else {
      setIosHelp(true);
    }
  };

  if (!show) return null;

  return (
    <div style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 400, maxWidth: 460, margin: "0 auto", background: "#111118", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 14, padding: "14px 16px", boxShadow: "0 12px 40px rgba(0,0,0,0.55)", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: GOLD, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Playfair Display, serif", fontSize: 22, fontWeight: 700, flexShrink: 0 }}>F</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#e8e4dc", fontSize: 14, fontWeight: 600 }}>Add Fatūra to your home screen</div>
          <div style={{ color: "#9a9690", fontSize: 12.5, marginTop: 2 }}>Open it like an app — one tap, no download.</div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" style={{ background: "none", border: "none", color: "#9a9690", fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
      </div>

      {iosHelp ? (
        <div style={{ marginTop: 12, fontSize: 13, color: "#9a9690", lineHeight: 1.7, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
          Tap the <strong style={{ color: "#e8e4dc" }}>Share</strong> button in Safari, then choose <strong style={{ color: "#e8e4dc" }}>Add to Home Screen</strong>.
        </div>
      ) : (
        <button onClick={install} style={{ width: "100%", marginTop: 12, padding: "10px", borderRadius: 9, background: GOLD, color: "#000", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>Install</button>
      )}
    </div>
  );
}
