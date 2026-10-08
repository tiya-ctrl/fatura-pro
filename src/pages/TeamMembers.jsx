// Fatura Pro - Team members manager (Business plan)
import { useState } from "react";
import { loadTeam, inviteMember, removeMember, setMemberRole, TEAM_LIMIT } from "../lib/team";
import { getLocale } from "../lib/locale";

export default function TeamMembers({ team, setTeam, userId }) {
  const ar = getLocale() === "ar";
  const ui = (english, arabic) => ar ? arabic : english;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState("viewer");

  const refresh = async () => setTeam(await loadTeam(userId));

  const invite = async () => {
    setBusy(true);
    const r = await inviteMember(email, userId, team.length);
    setBusy(false);
    if (r.error) { alert(r.error); return; }
    if (role === "editor") {
      const list = await loadTeam(userId);
      const added = list.find((m) => m.member_email === email.trim().toLowerCase());
      if (added) await setMemberRole(added.id, "editor");
    }
    setEmail("");
    refresh();
    alert(ui("Invite created ✓\nAsk them to sign up (or log in) to Fatūra Pro with this email — they'll join your team automatically.", "تم إنشاء الدعوة ✓\nاطلب منه التسجيل أو الدخول إلى FaturaPro بهذا البريد لينضم إلى فريقك تلقائيًا."));
  };

  const changeRole = async (m, next) => {
    if (!(await setMemberRole(m.id, next))) { alert(ui("Could not change the role. Please try again.", "تعذّر تغيير الصلاحية. حاول مرة أخرى.")); return; }
    refresh();
  };

  const remove = async (m) => {
    if (!window.confirm(ui("Remove " + m.member_email + " from your team?", "إزالة " + m.member_email + " من فريقك؟"))) return;
    await removeMember(m.id, userId);
    refresh();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-title" style={{ marginBottom: 6 }}>{ui("Team members", "أعضاء الفريق")}</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 14 }}>
        {ui(`Invite up to ${TEAM_LIMIT} people. "View only" is right for your accountant: they see invoices, clients, quotes, expenses and receipts but cannot change anything. "Can edit" is for someone who helps with your administration. Settings, payments and analytics stay owner-only.`, `ادعُ حتى ${TEAM_LIMIT} أشخاص. صلاحية "مشاهدة فقط" مناسبة لمحاسبك: يرى الفواتير والعملاء وعروض الأسعار والمصروفات والإيصالات دون أن يغيّر شيئًا. صلاحية "تعديل" لمن يساعدك في إدارة الحسابات. تبقى الإعدادات والمدفوعات والتحليلات للمالك فقط.`)}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input placeholder="accountant@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label={ui("Role", "الصلاحية")}>
          <option value="viewer">{ui("View only", "مشاهدة فقط")}</option>
          <option value="editor">{ui("Can edit", "تعديل")}</option>
        </select>
        <button className="btn btn-primary btn-sm" disabled={busy || team.length >= TEAM_LIMIT} onClick={invite}>
          {team.length >= TEAM_LIMIT ? ui("Limit reached", "بلغت الحد") : "+ " + ui("Invite", "دعوة")}
        </button>
      </div>

      {team.map((m) => (
        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700 }}>{m.member_email}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{ui("Invited", "تمت الدعوة")} {m.created_at ? m.created_at.slice(0, 10) : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select value={m.role === "editor" ? "editor" : "viewer"} onChange={(e) => changeRole(m, e.target.value)} aria-label={ui("Role", "الصلاحية")} style={{ fontSize: 12 }}>
              <option value="viewer">{ui("View only", "مشاهدة فقط")}</option>
              <option value="editor">{ui("Can edit", "تعديل")}</option>
            </select>
            <span style={{ fontSize: 11, fontWeight: 800, color: m.status === "active" ? "#2d8c65" : "var(--gold)" }}>
              {m.status === "active" ? ui("ACTIVE", "نشط") : ui("INVITED", "مدعو")}
            </span>
            <button className="btn btn-ghost btn-sm" style={{ color: "#e05555" }} onClick={() => remove(m)}>✕</button>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 12, color: "#999", marginTop: 10 }}>{team.length}/{TEAM_LIMIT} {ui("seats used", "مقاعد مستخدمة")}</div>
    </div>
  );
}
