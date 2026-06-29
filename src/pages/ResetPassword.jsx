import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    if (!password || password !== confirm) return setMsg("Passwords don't match");
    if (password.length < 6) return setMsg("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setMsg(error.message); }
    else { setMsg("Password updated!"); setTimeout(() => onDone(), 1500); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#111118", border:"1px solid rgba(201,168,76,0.2)", borderRadius:16, padding:32, maxWidth:400, width:"100%" }}>
        <div style={{ fontFamily:"Playfair Display, serif", fontSize:22, color:"#e8e4dc", marginBottom:8 }}>Set New Password</div>
        <div style={{ fontSize:13, color:"#9a9690", marginBottom:24 }}>Choose a strong password for your account.</div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" style={{ width:"100%", background:"#18181f", border:"1px solid rgba(201,168,76,0.18)", borderRadius:8, color:"#e8e4dc", fontSize:14, padding:"11px 14px", marginBottom:10, fontFamily:"DM Sans, sans-serif", outline:"none", boxSizing:"border-box" }} />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" style={{ width:"100%", background:"#18181f", border:"1px solid rgba(201,168,76,0.18)", borderRadius:8, color:"#e8e4dc", fontSize:14, padding:"11px 14px", marginBottom:16, fontFamily:"DM Sans, sans-serif", outline:"none", boxSizing:"border-box" }} />
        {msg && <div style={{ fontSize:13, color: msg.includes("updated") ? "#4caf89" : "#e05555", marginBottom:12 }}>{msg}</div>}
        <button onClick={handleReset} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:8, background:"#c9a84c", border:"none", color:"#000", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"DM Sans, sans-serif" }}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}
