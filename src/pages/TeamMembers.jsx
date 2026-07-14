// Fatura Pro - Team members manager (Business plan)
import { useState } from "react";
import { loadTeam, inviteMember, removeMember, TEAM_LIMIT } from "../lib/team";

export default function TeamMembers({ team, setTeam, userId }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => setTeam(await loadTeam(userId));

  const invite = async () => {
    setBusy(true);
    const r = await inviteMember(email, userId, team.length);
    setBusy(false);
    if (r.error) { alert(r.error); return; }
    setEmail("");
    refresh();
    alert("Invite created ✓\nAsk them to sign up (or log in) to Fatūra Pro with this email — they'll join your team automatically.");
  };

  const remove = async (m) => {
    if (!window.confirm("Remove " + m.member_email + " from your team?")) return;
    await removeMember(m.id, userId);
    refresh();
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-title" style={{ marginBottom: 6 }}>Team members</div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 14 }}>
        Invite up to {TEAM_LIMIT} people to work on your invoices, clients, quotes and expenses. Settings, payments and analytics stay owner-only.
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input placeholder="colleague@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <button className="btn btn-primary btn-sm" disabled={busy || team.length >= TEAM_LIMIT} onClick={invite}>
          {team.length >= TEAM_LIMIT ? "Limit reached" : "+ Invite"}
        </button>
      </div>

      {team.map((m) => (
        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700 }}>{m.member_email}</div>
            <div style={{ fontSize: 12, color: "#999" }}>Invited {m.created_at ? m.created_at.slice(0, 10) : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: m.status === "active" ? "#2d8c65" : "var(--gold)" }}>
              {m.status === "active" ? "ACTIVE" : "INVITED"}
            </span>
            <button className="btn btn-ghost btn-sm" style={{ color: "#e05555" }} onClick={() => remove(m)}>✕</button>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 12, color: "#999", marginTop: 10 }}>{team.length}/{TEAM_LIMIT} seats used</div>
    </div>
  );
}
