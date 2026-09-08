import { useEffect } from "react";
import { applyPageSeo, suspendBaseSiteSchema } from "../lib/pageSeo";

export default function NotFound() {
  useEffect(() => {
    const currentUrl = window.location.origin + window.location.pathname;
    const cleanupSeo = applyPageSeo({
      title: "Page Not Found | FaturaPro",
      description: "The page you requested could not be found. Return to FaturaPro or browse the invoicing guides.",
      canonical: currentUrl,
      language: "en",
      locale: "en_US",
      robots: "noindex,follow",
      alternates: { en: currentUrl, "x-default": currentUrl },
    });
    const restoreSiteSchema = suspendBaseSiteSchema();
    return () => { restoreSiteSchema(); cleanupSeo(); };
  }, []);

  return (
    <main style={{ minHeight:"100vh", background:"#08080e", color:"#e8e4dc", fontFamily:"DM Sans, sans-serif", display:"grid", placeItems:"center", padding:"32px" }}>
      <div style={{ maxWidth:560, textAlign:"center" }}>
        <div style={{ color:"#c9a84c", fontSize:13, fontWeight:700, letterSpacing:1.4, textTransform:"uppercase", marginBottom:14 }}>404 · Page not found</div>
        <h1 style={{ fontFamily:"Playfair Display, Georgia, serif", fontSize:"clamp(38px,7vw,64px)", lineHeight:1.08, margin:"0 0 18px" }}>This page is not here.</h1>
        <p style={{ color:"#9a9690", lineHeight:1.8, margin:"0 auto 28px" }}>The address may have changed, or the link may be incomplete. Continue to the product or browse practical invoicing guides.</p>
        <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
          <a href="/" style={{ background:"#c9a84c", color:"#0a0a0f", textDecoration:"none", padding:"12px 20px", borderRadius:9, fontWeight:700 }}>Go to FaturaPro</a>
          <a href="/blog" style={{ border:"1px solid #2a2930", color:"#e8e4dc", textDecoration:"none", padding:"12px 20px", borderRadius:9, fontWeight:700 }}>Browse guides</a>
        </div>
      </div>
    </main>
  );
}
