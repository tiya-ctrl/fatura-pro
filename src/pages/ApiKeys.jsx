// Fatura Pro - API keys manager (Business plan)
import { useState } from "react";
import { supabase } from "../supabase";

export default function ApiKeys({ keys, setKeys, userId }) {
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
      else alert(d.error || "Could not generate key");
    } catch { alert("Could not generate key"); }
    setBusy(false);
  };

  const remove = async (k) => {
    if (!window.confirm("Delete key " + k.key_prefix + "? Apps using it will stop working immediately.")) return;
    await supabase.from("api_keys").delete().eq("id", k.id).eq("user_id", userId);
    refresh();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-title" style={{ marginBottom: 6 }}>API access</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 14 }}>
        Create invoices programmatically. Endpoint: <code>faturapro.app/api/v1/invoices</code> — send your key as <code>Authorization: Bearer fp_live_…</code>
      </div>

      {newKey && (
        <div style={{ padding: "14px 16px", background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 10, marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 6, color: "var(--gold)" }}>⚠️ COPY NOW — shown only once</div>
          <code style={{ fontSize: 12, wordBreak: "break-all", display: "block", marginBottom: 8 }}>{newKey}</code>
          <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(newKey); alert("Copied ✓"); }}>📋 Copy</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setNewKey(null)}>Done</button>
        </div>
      )}

      {keys.map((k) => (
        <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
          <div>
            <code style={{ fontWeight: 700 }}>{k.key_prefix}</code>
            <div style={{ fontSize: 12, color: "#999" }}>Created {k.created_at?.slice(0, 10)}{k.last_used_at ? " · last used " + k.last_used_at.slice(0, 10) : " · never used"}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: "#e05555" }} onClick={() => remove(k)}>✕</button>
        </div>
      ))}

      <button className="btn btn-primary btn-sm" disabled={busy || keys.length >= 3} style={{ marginTop: 12 }} onClick={generate}>
        {keys.length >= 3 ? "Limit reached (3)" : busy ? "Generating…" : "+ Generate API key"}
      </button>
    </div>
  );
}
