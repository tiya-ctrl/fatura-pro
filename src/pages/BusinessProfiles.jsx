// Fatura Pro - Business profiles manager (Business plan)
import { useState } from "react";
import { saveProfile, deleteProfile, loadProfiles } from "../lib/businessProfiles";

export default function BusinessProfiles({ profiles, setProfiles, userId }) {
  const [editing, setEditing] = useState(null); // null | "new" | profile

  const refresh = async () => setProfiles(await loadProfiles(userId));

  const handleDelete = async (p) => {
    if (!window.confirm("Delete business profile \"" + p.name + "\"?")) return;
    await deleteProfile(p.id, userId);
    refresh();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div className="card-title">My Businesses</div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>+ Add business</button>
      </div>

      {profiles.length === 0 && (
        <div style={{ color:"#999", fontSize:13, padding:"10px 0" }}>
          Add your business profiles here. When creating an invoice, pick which business it's from — seller details fill in automatically.
        </div>
      )}

      {profiles.map((p) => (
        <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontWeight:700 }}>{p.name}</div>
            <div style={{ fontSize:12, color:"#999" }}>{p.seller_name || ""}{p.seller_email ? " · " + p.seller_email : ""}{p.currency ? " · " + p.currency : ""}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Edit</button>
            <button className="btn btn-ghost btn-sm" style={{ color:"#e05555" }} onClick={() => handleDelete(p)}>✕</button>
          </div>
        </div>
      ))}

      {editing && (
        <ProfileModal
          profile={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (p) => { await saveProfile(p, userId); setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function ProfileModal({ profile, onClose, onSave }) {
  const isEdit = !!profile;
  const [form, setForm] = useState(profile || {
    name:"", seller_name:"", seller_email:"", seller_phone:"", seller_address:"", bank_info:"", currency:"EUR",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    if (!form.name.trim()) { alert("Business name is required"); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:520 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div className="card-title">{isEdit ? "Edit " + profile.name : "New Business"}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display:"grid", gap:10 }}>
          <input placeholder="Business name * (e.g. Vyynd)" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input placeholder="Seller name on invoices" value={form.seller_name || ""} onChange={(e) => set("seller_name", e.target.value)} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <input placeholder="Email" value={form.seller_email || ""} onChange={(e) => set("seller_email", e.target.value)} />
            <input placeholder="Phone" value={form.seller_phone || ""} onChange={(e) => set("seller_phone", e.target.value)} />
          </div>
          <input placeholder="Address" value={form.seller_address || ""} onChange={(e) => set("seller_address", e.target.value)} />
          <textarea placeholder="Bank info (IBAN etc.)" value={form.bank_info || ""} onChange={(e) => set("bank_info", e.target.value)} />
          <input placeholder="Default currency (e.g. EUR)" value={form.currency || ""} onChange={(e) => set("currency", e.target.value)} />
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:16 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>{isEdit ? "Save changes" : "Add business"}</button>
        </div>
      </div>
    </div>
  );
}
