import React from "react";
import { useLocation } from "react-router-dom";

export const SITE_LANGUAGES = [
  ["en", "/", "English"], ["nl", "/nl", "Nederlands"], ["fr", "/fr", "Français"],
  ["es", "/es", "Español"], ["ar", "/ar", "العربية"],
];

// These are language homepages, not alternate translations of every guide.
export default function LanguageLinks({ current = "" }) {
  return <div className="language-links" role="group" aria-label="Website language">
    {SITE_LANGUAGES.map(([code, href, label]) => <a key={code} href={href} hrefLang={code}
      lang={code} title={label} aria-label={label}
      aria-current={current === code ? "page" : undefined}>{code.toUpperCase()}</a>)}
  </div>;
}

export function PublicLanguageFooter() {
  const { pathname } = useLocation();
  const publicPage = ["/privacy", "/terms", "/ambassador-terms", "/api-docs", "/late-payment-scripts", "/ambassadors", "/invoice-generator", "/blog"].includes(pathname) || pathname.startsWith("/blog/");
  if (!publicPage) return null;
  return <div className="public-language-footer"><LanguageLinks /></div>;
}
