import { useState } from "react";
import { loginUser, registerUser } from "../auth";
import { loginWithGoogle } from "../auth";

/* ─── CSS ─────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
@keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }

* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'DM Sans',sans-serif; background:#08080e; color:#e8e4dc; }
:root {
  --gold:#c9a84c; --gold-l:#e8c97a; --gold-dim:rgba(201,168,76,0.13);
  --bg:#08080e; --bg2:#0f0f17; --bg3:#16161f; --bg4:#1c1c27;
  --border:rgba(201,168,76,0.16); --border2:rgba(255,255,255,0.07);
  --text:#e8e4dc; --text2:#9a9690; --text3:#5a5750;
  --green:#4caf89; --red:#e05555;
}

.login-page {
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  background:var(--bg); position:relative; overflow:hidden; padding:20px;
}
.login-bg-glow {
  position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  width:600px; height:600px; border-radius:50%;
  background:radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%);
  pointer-events:none;
}
.login-bg-grid {
  position:absolute; inset:0; opacity:0.03;
  background-image:linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px);
  background-size:40px 40px;
}
.login-card {
  background:var(--bg2); border:1px solid var(--border);
  border-radius:20px; padding:40px 44px; width:100%; max-width:420px;
  position:relative; z-index:1;
  box-shadow:0 24px 64px rgba(0,0,0,0.5);
  animation:fadeUp 0.5s ease both;
}
.login-logo { display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:32px; }
.login-logo-icon {
  width:36px; height:36px; background:var(--gold); border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  font-size:17px; font-weight:800; color:#000;
}
.login-logo-text { font-family:'Playfair Display',serif; font-size:22px; color:var(--gold); }
.login-badge {
  display:inline-flex; align-items:center; gap:6px; background:var(--gold-dim);
  border:1px solid var(--border); border-radius:100px; padding:5px 14px;
  font-size:11px; font-weight:700; color:var(--gold); letter-spacing:0.5px;
  margin-bottom:20px;
}
.login-tabs { display:flex; background:var(--bg3); border-radius:10px; padding:4px; margin-bottom:24px; }
.login-tab {
  flex:1; padding:9px; text-align:center; border-radius:7px; font-size:13px;
  font-weight:600; cursor:pointer; transition:all 0.2s; color:var(--text2);
}
.login-tab.active { background:var(--gold); color:#000; }
.login-field { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
.login-field label { font-size:12px; font-weight:700; color:var(--text2); letter-spacing:0.3px; }
.login-input {
  background:var(--bg3); border:1.5px solid var(--border); border-radius:10px;
  color:var(--text); font-size:14px; padding:12px 14px;
  font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; width:100%;
}
.login-input:focus { border-color:var(--gold); }
.login-input.error { border-color:var(--red); }
.login-error { font-size:12px; color:var(--red); margin-top:3px; }
.login-btn {
  width:100%; padding:14px; background:var(--gold); color:#000; border:none;
  border-radius:10px; font-size:15px; font-weight:700; cursor:pointer;
  font-family:'DM Sans',sans-serif; margin-top:6px; transition:all 0.2s;
  display:flex; align-items:center; justify-content:center; gap:8px;
}
.login-btn:hover { background:var(--gold-l); transform:translateY(-1px); box-shadow:0 6px 20px rgba(201,168,76,0.35); }
.login-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
.login-divider { display:flex; align-items:center; gap:12px; margin:18px 0; }
.login-divider-line { flex:1; height:1px; background:var(--border2); }
.login-divider-text { font-size:12px; color:var(--text3); white-space:nowrap; }
.login-social { display:flex; gap:10px; }
.login-social-btn {
  flex:1; padding:11px; background:var(--bg3); border:1px solid var(--border2);
  border-radius:10px; font-size:13px; font-weight:600; color:var(--text2);
  cursor:pointer; font-family:'DM Sans',sans-serif; display:flex;
  align-items:center; justify-content:center; gap:8px; transition:all 0.2s;
}
.login-social-btn:hover { border-color:var(--gold); color:var(--gold); }
.login-footer-text { font-size:12px; color:var(--text2); text-align:center; margin-top:18px; }
.login-footer-text a { color:var(--gold); cursor:pointer; font-weight:600; text-decoration:none; }
.login-back {
  position:absolute; top:20px; left:20px; background:none; border:none;
  color:var(--text2); cursor:pointer; font-size:13px; display:flex; align-items:center;
  gap:6px; font-family:'DM Sans',sans-serif; transition:color 0.2s; z-index:2;
}
.login-back:hover { color:var(--gold); }
@media(max-width:480px){
  .login-card { padding:28px 20px; }
}
`;

/* ─── DEMO ACCOUNTS ───────────────────────────────────── */
// Replace with Supabase auth in production
const DEMO_USERS = [
  { email: "demo@fatura.app", password: "demo1234", name: "Demo User",  plan: "pro"  },
  { email: "free@fatura.app", password: "free1234", name: "Free User",  plan: "free" },
];

/* ─── COMPONENT ───────────────────────────────────────── */
export default function LoginPage({ onLogin, onBack }) {
  const [mode,     setMode]     = useState("login"); // "login" | "signup"
  const [form,     setForm]     = useState({ name:"", email:"", password:"", confirm:"" });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [success,  setSuccess]  = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim())           e.name     = "Name is required";
    if (!form.email.includes("@"))                        e.email    = "Enter a valid email";
    if (form.password.length < 6)                         e.password = "Min. 6 characters";
    if (mode === "signup" && form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const handleSubmit = async () => {
  const e = validate();
  if (Object.keys(e).length) {
    setErrors(e);
    return;
  }

  setLoading(true);

  try {
    if (mode === "login") {
      const res = await loginUser(form.email, form.password);
      setSuccess(true);
      setTimeout(() => onLogin(res.user), 1200);
    } else {
      const res = await registerUser(form.email, form.password);
      setSuccess(true);
      setTimeout(() => onLogin(res.user), 1200);
    }
  } catch (err) {
    setErrors({ email: err.message });
    setLoading(false);
  }
};

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  const switchMode = (m) => { setMode(m); setErrors({}); setForm({ name:"", email:"", password:"", confirm:"" }); };

  /* ── Success screen ── */
  if (success) return (
    <div className="login-page">
      <style>{FONTS + CSS}</style>
      <div className="login-bg-glow" /><div className="login-bg-grid" />
      <div className="login-card" style={{ textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✔</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:"var(--gold)", marginBottom:8 }}>
          {mode === "login" ? "Welcome back!" : "Account created!"}
        </div>
        <div style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>
          Taking you to your dashboard...
        </div>
        <div style={{ width:40, height:40, border:"3px solid var(--gold)", borderTopColor:"transparent",
          borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
      </div>
    </div>
  );

  /* ── Main form ── */
  return (
    <div className="login-page">
      <style>{FONTS + CSS}</style>
      <div className="login-bg-glow" />
      <div className="login-bg-grid" />

      {onBack && <button className="login-back" onClick={onBack}>← Back to Home</button>}

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">F</div>
          <div className="login-logo-text">Fatūra</div>
        </div>

        {/* Badge */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div className="login-badge">
            <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold)", display:"inline-block" }} />
            {mode === "login" ? "Sign in to your account" : "Create your free account"}
          </div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <div className={`login-tab ${mode==="login" ? "active" : ""}`} onClick={() => switchMode("login")}>Sign In</div>
          <div className={`login-tab ${mode==="signup" ? "active" : ""}`} onClick={() => switchMode("signup")}>Sign Up</div>
        </div>

        {/* Name — signup only */}
        {mode === "signup" && (
          <div className="login-field">
            <label>Full Name</label>
            <input className={`login-input${errors.name ? " error" : ""}`}
              value={form.name} onChange={e => set("name", e.target.value)}
              onKeyDown={handleKey} placeholder="e.g. Sara Al-Rashidi" />
            {errors.name && <div className="login-error">{errors.name}</div>}
          </div>
        )}

        {/* Email */}
        <div className="login-field">
          <label>Email Address</label>
          <input className={`login-input${errors.email ? " error" : ""}`}
            type="email" value={form.email}
            onChange={e => set("email", e.target.value)}
            onKeyDown={handleKey} placeholder="you@example.com" />
          {errors.email && <div className="login-error">{errors.email}</div>}
        </div>

        {/* Password */}
        <div className="login-field">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <label>Password</label>
            {mode === "login" && (
              <span style={{ fontSize:12, color:"var(--gold)", cursor:"pointer" }}>Forgot password?</span>
            )}
          </div>
          <div style={{ position:"relative" }}>
            <input className={`login-input${errors.password ? " error" : ""}`}
              type={showPass ? "text" : "password"} value={form.password}
              onChange={e => set("password", e.target.value)} onKeyDown={handleKey}
              placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
              style={{ paddingRight:44 }} />
            <button onClick={() => setShowPass(s => !s)}
              style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", color:"var(--text2)", fontSize:16 }}>
              {showPass ? "🙈" : "👁"}
            </button>
          </div>
          {errors.password && <div className="login-error">{errors.password}</div>}
        </div>

        {/* Confirm — signup only */}
        {mode === "signup" && (
          <div className="login-field">
            <label>Confirm Password</label>
            <input className={`login-input${errors.confirm ? " error" : ""}`}
              type={showPass ? "text" : "password"} value={form.confirm}
              onChange={e => set("confirm", e.target.value)} onKeyDown={handleKey}
              placeholder="Repeat your password" />
            {errors.confirm && <div className="login-error">{errors.confirm}</div>}
          </div>
        )}

        {/* Submit */}
        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <span style={{ width:16, height:16, border:"2px solid #000", borderTopColor:"transparent",
                borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
              Processing...
            </>
          ) : (
            mode === "login" ? "Sign In →" : "Create Account →"
          )}
        </button>

        {/* Divider */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <div className="login-divider-text">or continue with</div>
          <div className="login-divider-line" />
        </div>

        {/* Social login */}
<div className="login-social">
  <button
    className="login-social-btn"
    onClick={async () => {
      try {
        setLoading(true);
        const res = await loginWithGoogle();
        setSuccess(true);
        setTimeout(() => onLogin(res.user), 1200);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    }}
  >
    <span style={{ fontWeight: 800, color: "#4285f4" }}>G</span> Google
  </button>
</div>


        {/* Demo hint */}
        <div style={{ marginTop:18, padding:"10px 14px", background:"var(--bg3)", borderRadius:10,
          border:"1px solid var(--border2)", fontSize:12, color:"var(--text2)", lineHeight:1.8 }}>
          <strong style={{ color:"var(--gold)" }}>Demo credentials:</strong><br />
          📧 demo@fatura.app &nbsp; 🔑 demo1234
        </div>

        {/* Switch mode */}
        <div className="login-footer-text">
          {mode === "login"
            ? <>Don't have an account? <a onClick={() => switchMode("signup")}>Sign up free</a></>
            : <>Already have an account? <a onClick={() => switchMode("login")}>Sign in</a></>
          }
        </div>
      </div>
    </div>
  );
}