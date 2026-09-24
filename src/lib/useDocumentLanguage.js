import { useEffect, useState } from "react";

const current = () => (typeof document === "undefined" ? "en" : document.documentElement.getAttribute("lang") || "en");

// The language of the page being shown (<html lang>). Public pages set it to their
// content language and the app sets it to the interface language, so site-wide
// banners (cookies, install) follow whatever the visitor is actually reading.
export default function useDocumentLanguage() {
  const [language, setLanguage] = useState(current);
  useEffect(() => {
    const root = document.documentElement;
    setLanguage(current());
    const observer = new MutationObserver(() => setLanguage(current()));
    observer.observe(root, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, []);
  return language;
}
