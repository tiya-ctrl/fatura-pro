import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/* Public marketing pages only — never inside the app, login or payment pages */
const PUBLIC_PATHS = ["/", "/blog", "/invoice-generator", "/api-docs", "/privacy", "/terms"];

function isPublicPage(pathname) {
  if (pathname === "/late-payment-scripts") return false; /* already there */
  if (pathname.startsWith("/blog")) return true;
  return PUBLIC_PATHS.includes(pathname);
}

const STYLE_ID = "fatura-topbar-style";
const CSS = `
body.fatura-topbar-on { padding-top: var(--fatura-topbar-h, 40px); }
body.fatura-topbar-on nav.topnav { top: var(--fatura-topbar-h, 40px); }
.fatura-topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 300;
  background: linear-gradient(90deg, #c9a84c 0%, #e8c97a 50%, #c9a84c 100%);
  color: #14110a;
  font-family: 'DM Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 10px 44px 10px 16px;
  padding-top: max(10px, env(safe-area-inset-top));
  font-size: 13.5px; font-weight: 600; line-height: 1.45; text-align: center;
  box-shadow: 0 2px 14px rgba(0,0,0,0.35);
}
.fatura-topbar a.fatura-topbar-link {
  color: #14110a; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
}
.fatura-topbar a.fatura-topbar-link u { text-underline-offset: 3px; }
.fatura-topbar-tag {
  background: #14110a; color: #e8c97a; border-radius: 5px;
  padding: 2px 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase;
}
.fatura-topbar-x {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: #14110a; opacity: 0.55;
  font-size: 17px; line-height: 1; cursor: pointer; padding: 6px;
}
.fatura-topbar-x:hover { opacity: 1; }
@media (max-width: 640px) {
  .fatura-topbar { font-size: 12.5px; padding: 9px 38px 9px 12px; gap: 7px; }
  .fatura-topbar-tag { display: none; }
}
`;

export default function TopBar() {
  const location = useLocation();
  const barRef = useRef(null);
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("fatura_topbar_dismissed") === "1"; } catch { return false; }
  });

  const visible = !dismissed && isPublicPage(location.pathname);

  /* inject stylesheet once */
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);

  /* measure height, offset the page, clean up when hidden */
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      document.body.classList.remove("fatura-topbar-on");
      root.style.removeProperty("--fatura-topbar-h");
      return;
    }
    const measure = () => {
      const h = barRef.current ? barRef.current.offsetHeight : 40;
      root.style.setProperty("--fatura-topbar-h", h + "px");
    };
    measure();
    document.body.classList.add("fatura-topbar-on");
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      document.body.classList.remove("fatura-topbar-on");
      root.style.removeProperty("--fatura-topbar-h");
    };
  }, [visible]);

  if (!visible) return null;

  const close = () => {
    try { localStorage.setItem("fatura_topbar_dismissed", "1"); } catch {}
    setDismissed(true);
  };

  return (
    <div className="fatura-topbar" ref={barRef}>
      <span className="fatura-topbar-tag">Free</span>
      <a className="fatura-topbar-link" href="/late-payment-scripts">
        <span>Copy-paste scripts to chase late payments — get paid without the awkward message <u>Get them →</u></span>
      </a>
      <button className="fatura-topbar-x" onClick={close} aria-label="Close">✕</button>
    </div>
  );
}
