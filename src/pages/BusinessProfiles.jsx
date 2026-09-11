// Fatura Pro - Business profiles manager (Business plan)
import { useState } from "react";
import { saveProfile, deleteProfile, loadProfiles } from "../lib/businessProfiles";
import { getLocale } from "../lib/locale";

export default function BusinessProfiles({ profiles, setProfiles, userId }) {
  const ar = getLocale() === "ar";
  const ui = (english, arabic) => ar ? arabic : english;
  const [editing, setEditing] = useState(null); // null | "new" | profile

  const refresh = async () => setProfiles(await loadProfiles(userId));

  const handleDelete = async (p) => {
    if (!window.confirm(ui("Delete business profile \"" + p.name + "\"?", "حذف ملف النشاط «" + p.name + "»؟"))) return;
    await deleteProfile(p.id, userId);
    refresh();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div className="card-title">{ui("My Businesses", "أنشطتي التجارية")}</div>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>+ {ui("Add business", "إضافة نشاط")}</button>
      </div>

      {profiles.length === 0 && (
        <div style={{ color:"#999", fontSize:13, padding:"10px 0" }}>
          {ui("Add your business profiles here. When creating an invoice, pick which business it's from — seller details fill in automatically.", "أضف ملفات أنشطتك هنا. عند إنشاء فاتورة اختر النشاط المُصدر، وستُملأ بيانات البائع تلقائيًا.")}
        </div>
      )}

      {profiles.map((p) => (
        <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontWeight:700 }}>{p.name}</div>
            <div style={{ fontSize:12, color:"#999" }}>{p.seller_name || ""}{p.seller_email ? " · " + p.seller_email : ""}{p.currency ? " · " + p.currency : ""}</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>{ui("Edit", "تعديل")}</button>
            <button className="btn btn-ghost btn-sm" style={{ color:"#e05555" }} onClick={() => handleDelete(p)}>✕</button>
          </div>
        </div>
      ))}

      {editing && (
        <ProfileModal
          profile={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (p) => { await saveProfile(p, userId); setEditing(null); refresh(); }} ar={ar}
        />
      )}
    </div>
  );
}

function ProfileModal({ profile, onClose, onSave, ar }) {
  const ui = (english, arabic) => ar ? arabic : english;
  const isEdit = !!profile;
  const [form, setForm] = useState(profile || {
    name:"", seller_name:"", seller_email:"", seller_phone:"", seller_address:"", bank_info:"", currency:"EUR",
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    if (!form.name.trim()) { alert(ui("Business name is required", "اسم النشاط مطلوب")); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:520 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <div className="card-title">{isEdit ? ui("Edit ", "تعديل ") + profile.name : ui("New Business", "نشاط جديد")}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display:"grid", gap:10 }}>
          <input placeholder={ui("Business name * (e.g. Vyynd)", "اسم النشاط *")} value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input placeholder={ui("Seller name on invoices", "اسم البائع على الفواتير")} value={form.seller_name || ""} onChange={(e) => set("seller_name", e.target.value)} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <input type="email" placeholder={ui("Email", "البريد الإلكتروني")} value={form.seller_email || ""} onChange={(e) => set("seller_email", e.target.value)} />
            <input type="tel" placeholder={ui("Phone", "الهاتف")} value={form.seller_phone || ""} onChange={(e) => set("seller_phone", e.target.value)} />
          </div>
          <input placeholder={ui("Address", "العنوان")} value={form.seller_address || ""} onChange={(e) => set("seller_address", e.target.value)} />
          <textarea placeholder={ui("Bank info (IBAN etc.)", "بيانات البنك (IBAN وغيرها)")} value={form.bank_info || ""} onChange={(e) => set("bank_info", e.target.value)} />
          <input data-direction="ltr" placeholder={ui("Default currency (e.g. EUR)", "العملة الافتراضية (مثل EUR)")} value={form.currency || ""} onChange={(e) => set("currency", e.target.value)} />
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:16 }}>
          <button className="btn btn-ghost" onClick={onClose}>{ui("Cancel", "إلغاء")}</button>
          <button className="btn btn-primary" onClick={save}>{isEdit ? ui("Save changes", "حفظ التغييرات") : ui("Add business", "إضافة النشاط")}</button>
        </div>
      </div>
    </div>
  );
}
