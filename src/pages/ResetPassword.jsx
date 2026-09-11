import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { getLocale } from "../lib/locale";

export default function ResetPassword({ onDone }) {
  const ar = getLocale() === "ar";
  const copy = ar ? {
    mismatch:"كلمتا المرور غير متطابقتين", short:"يجب ألا تقل كلمة المرور عن 6 أحرف", updated:"تم تحديث كلمة المرور!",
    title:"تعيين كلمة مرور جديدة", subtitle:"اختر كلمة مرور قوية لحسابك.", password:"كلمة المرور الجديدة",
    confirm:"تأكيد كلمة المرور", updating:"جارٍ التحديث...", update:"تحديث كلمة المرور",
  } : {
    mismatch:"Passwords don't match", short:"Password must be at least 6 characters", updated:"Password updated!",
    title:"Set New Password", subtitle:"Choose a strong password for your account.", password:"New password",
    confirm:"Confirm password", updating:"Updating...", update:"Update Password",
  };
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    if (!password || password !== confirm) return setMsg(copy.mismatch);
    if (password.length < 6) return setMsg(copy.short);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setMsg(error.message); }
    else { setMsg(copy.updated); setTimeout(() => onDone(), 1500); }
    setLoading(false);
  };

  return (
    <div lang={ar ? "ar" : "en"} dir={ar ? "rtl" : "ltr"} style={{ minHeight:"100vh", background:"#0a0a0f", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#111118", border:"1px solid rgba(99,102,241,0.2)", borderRadius:16, padding:32, maxWidth:400, width:"100%" }}>
        <div style={{ fontFamily:ar ? "Noto Sans Arabic, Segoe UI, sans-serif" : "Playfair Display, serif", fontSize:22, color:"#e8e4dc", marginBottom:8 }}>{copy.title}</div>
        <div style={{ fontSize:13, color:"#9a9690", marginBottom:24 }}>{copy.subtitle}</div>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={copy.password} style={{ width:"100%", background:"#18181f", border:"1px solid rgba(99,102,241,0.18)", borderRadius:8, color:"#e8e4dc", fontSize:14, padding:"11px 14px", marginBottom:10, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={copy.confirm} style={{ width:"100%", background:"#18181f", border:"1px solid rgba(99,102,241,0.18)", borderRadius:8, color:"#e8e4dc", fontSize:14, padding:"11px 14px", marginBottom:16, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
        {msg && <div style={{ fontSize:13, color: msg === copy.updated ? "#4caf89" : "#e05555", marginBottom:12 }}>{msg}</div>}
        <button onClick={handleReset} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:8, background:"#6366F1", border:"none", color:"#fff", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
          {loading ? copy.updating : copy.update}
        </button>
      </div>
    </div>
  );
}
