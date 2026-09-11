import { useEffect } from "react";
import { applyPageSeo, suspendBaseSiteSchema } from "../lib/pageSeo";
import { getLocale, localeHome } from "../lib/locale";

export default function NotFound() {
  const locale = getLocale();
  const ar = locale === "ar";
  useEffect(() => {
    const currentUrl = window.location.origin + window.location.pathname;
    const cleanupSeo = applyPageSeo({
      title: ar ? "الصفحة غير موجودة | FaturaPro" : "Page Not Found | FaturaPro",
      description: ar ? "تعذّر العثور على الصفحة المطلوبة. ارجع إلى FaturaPro أو تصفّح أدلة الفوترة." : "The page you requested could not be found. Return to FaturaPro or browse the invoicing guides.",
      canonical: currentUrl,
      language: ar ? "ar" : "en",
      locale: ar ? "ar_AR" : "en_US",
      robots: "noindex,follow",
      alternates: ar ? { ar: currentUrl, "x-default": currentUrl } : { en: currentUrl, "x-default": currentUrl },
    });
    const restoreSiteSchema = suspendBaseSiteSchema();
    return () => { restoreSiteSchema(); cleanupSeo(); };
  }, [ar]);

  return (
    <main dir={ar ? "rtl" : "ltr"} lang={ar ? "ar" : "en"} style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:ar ? "Noto Sans Arabic, Segoe UI, sans-serif" : "DM Sans, sans-serif", display:"grid", placeItems:"center", padding:"32px" }}>
      <div style={{ maxWidth:560, textAlign:"center" }}>
        <div style={{ color:"#6366F1", fontSize:13, fontWeight:700, letterSpacing:1.4, textTransform:"uppercase", marginBottom:14 }}>404 · {ar ? "الصفحة غير موجودة" : "Page not found"}</div>
        <h1 style={{ fontFamily:ar ? "inherit" : "Playfair Display, Georgia, serif", fontSize:"clamp(38px,7vw,64px)", lineHeight:1.08, margin:"0 0 18px" }}>{ar ? "هذه الصفحة غير موجودة." : "This page is not here."}</h1>
        <p style={{ color:"#9a9690", lineHeight:1.8, margin:"0 auto 28px" }}>{ar ? "ربما تغيّر العنوان أو أن الرابط غير مكتمل. ارجع إلى التطبيق أو تصفّح أدلة الفوترة العملية." : "The address may have changed, or the link may be incomplete. Continue to the product or browse practical invoicing guides."}</p>
        <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
          <a href={localeHome(locale)} style={{ background:"#6366F1", color:"#0a0a0f", textDecoration:"none", padding:"12px 20px", borderRadius:9, fontWeight:700 }}>{ar ? "العودة إلى FaturaPro" : "Go to FaturaPro"}</a>
          <a href="/blog" style={{ border:"1px solid #2a2930", color:"#e8e4dc", textDecoration:"none", padding:"12px 20px", borderRadius:9, fontWeight:700 }}>{ar ? "تصفّح الأدلة" : "Browse guides"}</a>
        </div>
      </div>
    </main>
  );
}
