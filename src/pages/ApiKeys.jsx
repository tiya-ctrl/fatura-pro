// Fatura Pro - API keys manager (Business plan)
import { useState } from "react";
import { supabase } from "../supabase";
import { getLocale } from "../lib/locale";

export default function ApiKeys({ keys, setKeys, userId }) {
  const ar = getLocale() === "ar";
  const ui = (english, arabic) => ar ? arabic : english;
  const [newKey, setNewKey] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.from("api_keys").select("id, key_prefix, label, last_used_at, created_at").eq("user_id", userId).order("created_at", { ascending: true });
    setKeys(data || []);
  };

  const generate = async () => {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch("/api/generate-api-key", { method: "POST", headers: { Authorization: "Bearer " + (session?.access_token || "") } });
      const d = await r.json();
      if (d.key) { setNewKey(d.key); refresh(); }
      else alert(d.error || ui("Could not generate key", "تعذر إنشاء المفتاح"));
    } catch { alert(ui("Could not generate key", "تعذر إنشاء المفتاح")); }
    setBusy(false);
  };

  const remove = async (k) => {
    if (!window.confirm(ui("Delete key " + k.key_prefix + "? Apps using it will stop working immediately.", "حذف المفتاح " + k.key_prefix + "؟ ستتوقف التطبيقات التي تستخدمه فورًا."))) return;
    await supabase.from("api_keys").delete().eq("id", k.id).eq("user_id", userId);
    refresh();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-title" style={{ marginBottom: 6 }}>{ui("API access", "الوصول عبر API")}</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 14 }}>
        {ui("Create invoices programmatically. Endpoint:", "أنشئ الفواتير برمجيًا. نقطة الاتصال:")} <code>faturapro.app/api/v1/invoices</code> — {ui("send your key as", "أرسل مفتاحك بصيغة")} <code>Authorization: Bearer fp_live_…</code>
      </div>

      {newKey && (
        <div style={{ padding: "14px 16px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 10, marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6, color: "var(--gold)" }}>⚠️ {ui("COPY NOW — shown only once", "انسخه الآن — سيظهر مرة واحدة فقط")}</div>
          <code style={{ fontSize: 12, wordBreak: "break-all", display: "block", marginBottom: 8 }}>{newKey}</code>
          <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(newKey); alert(ui("Copied ✓", "تم النسخ ✓")); }}>📋 {ui("Copy", "نسخ")}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setNewKey(null)}>{ui("Done", "تم")}</button>
        </div>
      )}

      {keys.map((k) => (
        <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
          <div>
            <code style={{ fontWeight: 700 }}>{k.key_prefix}</code>
            <div style={{ fontSize: 12, color: "#999" }}>{ui("Created", "أُنشئ")} {k.created_at?.slice(0, 10)}{k.last_used_at ? " · " + ui("last used", "آخر استخدام") + " " + k.last_used_at.slice(0, 10) : " · " + ui("never used", "لم يُستخدم")}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: "#e05555" }} onClick={() => remove(k)}>✕</button>
        </div>
      ))}

      <button className="btn btn-primary btn-sm" disabled={busy || keys.length >= 3} style={{ marginTop: 12 }} onClick={generate}>
        {keys.length >= 3 ? ui("Limit reached (3)", "بلغت الحد (3)") : busy ? ui("Generating…", "جارٍ الإنشاء…") : "+ " + ui("Generate API key", "إنشاء مفتاح API")}
      </button>
    </div>
  );
}
