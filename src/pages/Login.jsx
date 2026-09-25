import { useState, useEffect, useRef } from "react";
import { signIn, signUp, loginWithGoogle, needsEmailConfirmation, isEmailNotConfirmedError, resendConfirmationEmail } from "../auth";
import { trackEvent } from "../lib/tracking";
import { getLocale, localeHome, setLocale, tr } from "../lib/locale";
import { attributionEventProperties } from "../lib/attribution";

/* ─── CSS ─────────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');`;

const CSS = `
@keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }

* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'DM Sans',sans-serif; background:#08080e; color:#e8e4dc; }
:root {
  --gold:var(--brand-primary, #6366F1); --gold-l:var(--brand-highlight, #7C6CF2); --gold-dim:rgba(var(--brand-primary-rgb, 99,102,241),0.13);
  --bg:#08080e; --bg2:#0f0f17; --bg3:#16161f; --bg4:#1c1c27;
  --border:rgba(99,102,241,0.16); --border2:rgba(255,255,255,0.07);
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
  background:radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%);
  pointer-events:none;
}

@media (max-width: 640px) {
  .login-bg-glow {
    width: 300px;
    height: 300px;
  }

  .login-page {
    overflow: hidden;
  }
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
  width:36px; height:36px; object-fit:contain;
  display:flex; align-items:center; justify-content:center;
  font-size:17px; font-weight:800; color:#000;
}
.login-logo-text { font-family:'Plus Jakarta Sans',system-ui,sans-serif; font-weight:800; font-size:23px; letter-spacing:-0.02em; color:#EEF1F6; direction:ltr; }
.login-logo-text b { font-weight:800; color:#01C4B6; }
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
.login-btn:hover { background:var(--gold-l); transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,102,241,0.35); }
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

/* ─── COMPONENT ───────────────────────────────────────── */
export default function LoginPage({ onLogin, onBack, returnTo = "/app" }) {
  const locale = getLocale();
  const t = (key, fallback) => tr(key, fallback, locale);
  const [mode,     setMode]     = useState("login"); // "login" | "signup"
  const signupStartTracked = useRef(false);
  const signupSource = new URLSearchParams(window.location.search).get("source") || "login_tab";
  // Browser tab title in the visitor's language, instead of the landing page title.
  useEffect(() => {
    document.title = (mode === "signup" ? tr("sign_up", "Sign up", locale) : tr("sign_in", "Sign in", locale)) + " · FaturaPro";
  }, [mode, locale]);
  useEffect(() => {
    setLocale(locale);
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("signup")) {
      setMode("signup");
      if (!signupStartTracked.current) {
        signupStartTracked.current = true;
        trackEvent("signup_started", { method:"email", source:signupSource, ...attributionEventProperties() });
      }
    }
    const inv = sp.get("invited");
    if (inv) {
      setMode("signup");
      localStorage.removeItem("fatura_intent_plan");
      setForm(f => ({ ...f, email: inv }));
    }
  }, []);
  const [form,     setForm]     = useState({ name:"", email:"", password:"", confirm:"" });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [success,  setSuccess]  = useState(false);
  // Which free trial the visitor wants. Essential starts automatically (no card);
  // Advanced opens the Stripe checkout with its 7-day trial after sign-up
  // (InvoiceApp reads "fatura_intent_plan" and opens the upgrade window).
  const invited = Boolean(new URLSearchParams(window.location.search).get("invited"));
  const [trialChoice, setTrialChoice] = useState(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("plan");
    if (fromUrl === "business" || fromUrl === "pro") return fromUrl;
    try { return localStorage.getItem("fatura_intent_plan") === "business" ? "business" : "pro"; } catch { return "pro"; }
  });
  const chooseTrial = (choice) => {
    setTrialChoice(choice);
    try { localStorage.setItem("fatura_intent_plan", choice); } catch {}
  };
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("plan");
    if (!invited && (fromUrl === "business" || fromUrl === "pro")) {
      try { localStorage.setItem("fatura_intent_plan", fromUrl); } catch {}
    }
  }, [invited]);
  const [awaitingEmail, setAwaitingEmail] = useState(null); // { email, fromLogin } while waiting for email confirmation
  const [resendState,   setResendState]   = useState("idle"); // "idle" | "sending" | "sent" | "error"

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim())           e.name     = t("name_required", "Name is required");
    if (!form.email.includes("@"))                        e.email    = t("valid_email", "Enter a valid email");
    if (form.password.length < 6)                         e.password = t("password_min", "Min. 6 characters");
    if (mode === "signup" && form.password !== form.confirm) e.confirm = t("password_mismatch", "Passwords don't match");
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
      const res = await signIn(form.email, form.password);
      setSuccess(true);
      setTimeout(() => onLogin(res.user), 1200);
    } else {
      const res = await signUp(form.email, form.password, invited ? null : trialChoice);
      trackEvent("signup_completed", { method:"email", source:signupSource, ...attributionEventProperties() });
      if (needsEmailConfirmation(res)) {
        setAwaitingEmail({ email: form.email.trim(), fromLogin: false });
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => onLogin(res.user), 1200);
    }
  } catch (err) {
    if (mode === "login" && isEmailNotConfirmedError(err)) {
      setAwaitingEmail({ email: form.email.trim(), fromLogin: true });
      setLoading(false);
      return;
    }
    setErrors({ email: err.message });
    setLoading(false);
  }
};

  const resend = async () => {
    if (!awaitingEmail || resendState === "sending") return;
    setResendState("sending");
    try {
      await resendConfirmationEmail(awaitingEmail.email, invited ? null : trialChoice);
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  const switchMode = (m) => {
    setMode(m);
    if (m === "signup" && !signupStartTracked.current) {
      signupStartTracked.current = true;
      trackEvent("signup_started", { method:"email", source:signupSource, ...attributionEventProperties() });
    }
    setErrors({});
    setForm({ name:"", email:"", password:"", confirm:"" });
  };

  /* ── Check-your-email screen (only when Supabase requires email confirmation) ── */
  if (awaitingEmail) return (
    <div className="login-page">
      <style>{FONTS + CSS}</style>
      <div className="login-bg-glow" /><div className="login-bg-grid" />
      <div className="login-card" style={{ textAlign:"center" }} role="status" aria-live="polite">
        <div style={{ fontSize:52, marginBottom:14 }} aria-hidden="true">✉</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:"var(--gold)", marginBottom:10 }}>
          {t("check_email_title", "Check your email")}
        </div>
        {awaitingEmail.fromLogin && (
          <div style={{ color:"var(--text)", fontSize:14, marginBottom:10 }}>
            {t("email_not_confirmed", "Please confirm your email first, using the link we sent you.")}
          </div>
        )}
        <div style={{ color:"var(--text2)", fontSize:14, marginBottom:4 }}>
          {t("check_email_sent_to", "We sent a confirmation link to:")}
        </div>
        <div dir="ltr" style={{ color:"var(--text)", fontSize:15, fontWeight:600, marginBottom:14, wordBreak:"break-all" }}>
          {awaitingEmail.email}
        </div>
        <div style={{ color:"var(--text2)", fontSize:13, marginBottom:22 }}>
          {t("check_email_help", "Open the link to activate your account. If you don't see it, check your spam folder.")}
        </div>
        <button type="button" className="login-btn" onClick={resend} disabled={resendState === "sending" || resendState === "sent"}>
          {resendState === "sending" ? t("processing", "Processing...") : t("resend_confirmation", "Resend email")}
        </button>
        {resendState === "sent" && <div style={{ color:"var(--green)", fontSize:13, marginTop:12 }}>{t("confirmation_resent", "Sent again. Check your inbox.")}</div>}
        {resendState === "error" && <div className="login-error" style={{ marginTop:12 }}>{t("confirmation_resend_failed", "Could not send the email right now. Please try again in a minute.")}</div>}
        <button type="button" onClick={() => { const email = awaitingEmail.email; setAwaitingEmail(null); setResendState("idle"); setMode("login"); setErrors({}); setForm({ name:"", email, password:"", confirm:"" }); }}
          style={{ marginTop:18, background:"none", border:0, color:"var(--gold)", cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>
          {t("back_to_login", "Back to sign in")}
        </button>
      </div>
    </div>
  );

  /* ── Success screen ── */
  if (success) return (
    <div className="login-page">
      <style>{FONTS + CSS}</style>
      <div className="login-bg-glow" /><div className="login-bg-grid" />
      <div className="login-card" style={{ textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✔</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:"var(--gold)", marginBottom:8 }}>
          {mode === "login" ? t("welcome_back", "Welcome back!") : t("account_created", "Account created!")}
        </div>
        <div style={{ color:"var(--text2)", fontSize:14, marginBottom:24 }}>
          {t("opening_dashboard", "Taking you to your dashboard...")}
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

      {onBack && <button className="login-back" onClick={locale === "en" ? onBack : () => { window.location.href = localeHome(locale); }}>← {t("back_home", "Back to Home")}</button>}

      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <img className="login-logo-icon" src="/fatura-mark.svg" alt="" width="36" height="36" />
          <div className="login-logo-text">Fatura<b>Pro</b></div>
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:12, marginTop:-20, marginBottom:18, fontSize:12 }}>
          {["en","nl","fr","es","ar"].map(code => <button key={code} onClick={() => { setLocale(code); const params = new URLSearchParams(window.location.search); params.set("lang", code); if (mode === "signup") params.set("signup", "1"); else params.delete("signup"); window.location.search = params.toString(); }} title={{en:"English",nl:"Nederlands",fr:"Français",es:"Español",ar:"العربية"}[code]} style={{ border:0, background:"none", color:locale===code?"var(--gold)":"var(--text3)", fontWeight:locale===code?700:500, cursor:"pointer", minWidth:40, minHeight:40 }}>{code.toUpperCase()}</button>)}
        </div>

        {/* Badge */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div className="login-badge">
            <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--gold)", display:"inline-block" }} />
            {mode === "login" ? t("sign_in_account", "Sign in to your account") : t("create_free_account", "Create your free account")}
          </div>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <div className={`login-tab ${mode==="login" ? "active" : ""}`} onClick={() => switchMode("login")}>{t("sign_in", "Sign In")}</div>
          <div className={`login-tab ${mode==="signup" ? "active" : ""}`} onClick={() => switchMode("signup")}>{t("sign_up", "Sign Up")}</div>
        </div>

        {/* Name — signup only */}
        {mode === "signup" && (
          <div className="login-field">
            <label>{t("full_name", "Full Name")}</label>
            <input className={`login-input${errors.name ? " error" : ""}`}
              value={form.name} onChange={e => set("name", e.target.value)}
              onKeyDown={handleKey} placeholder="e.g. Sara Al-Rashidi" />
            {errors.name && <div className="login-error">{errors.name}</div>}
          </div>
        )}

        {/* Email */}
        <div className="login-field">
          <label>{t("email_address", "Email Address")}</label>
          <input className={`login-input${errors.email ? " error" : ""}`}
            type="email" value={form.email}
            onChange={e => set("email", e.target.value)}
            onKeyDown={handleKey} placeholder="you@example.com" />
          {errors.email && <div className="login-error">{errors.email}</div>}
        </div>

        {/* Password */}
        <div className="login-field">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <label>{t("password", "Password")}</label>
            {mode === "login" && (
              <span style={{ fontSize:12, color:"var(--gold)", cursor:"pointer" }} onClick={async () => { const email = document.querySelector("input[type=email]")?.value; if(!email) return alert(t("enter_email_first", "Enter your email first")); const { supabase } = await import("../supabase"); await supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://faturapro.app/reset-password" }); alert(t("reset_sent", "Password reset email sent!")); }}>{t("forgot_password", "Forgot password?")}</span>
            )}
          </div>
          <div style={{ position:"relative" }}>
            <input className={`login-input${errors.password ? " error" : ""}`}
              type={showPass ? "text" : "password"} value={form.password}
              onChange={e => set("password", e.target.value)} onKeyDown={handleKey}
              placeholder={mode === "signup" ? t("min_characters", "Min. 6 characters") : t("your_password", "Your password")}
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
            <label>{t("confirm_password", "Confirm Password")}</label>
            <input className={`login-input${errors.confirm ? " error" : ""}`}
              type={showPass ? "text" : "password"} value={form.confirm}
              onChange={e => set("confirm", e.target.value)} onKeyDown={handleKey}
              placeholder={t("repeat_password", "Repeat your password")} />
            {errors.confirm && <div className="login-error">{errors.confirm}</div>}
          </div>
        )}

        {/* Free trial choice — signup only (not for team invites) */}
        {mode === "signup" && !invited && (
          <div className="login-field" role="radiogroup" aria-label={t("trial_choice_label", "Choose your free trial")}>
            <label>{t("trial_choice_label", "Choose your free trial")}</label>
            <div style={{ display:"flex", gap:10 }}>
              {[
                { id:"pro", name:"Essential", note:t("trial_essential_note", "7 days free · no card needed") },
                { id:"business", name:"Advanced", note:t("trial_advanced_note", "7 days free · card via Stripe, cancel anytime") },
              ].map(option => (
                <button key={option.id} type="button" role="radio" aria-checked={trialChoice === option.id}
                  onClick={() => chooseTrial(option.id)}
                  style={{ flex:1, textAlign:"start", padding:"12px 12px", borderRadius:10, cursor:"pointer", fontFamily:"inherit",
                    background: trialChoice === option.id ? "var(--gold-dim)" : "var(--bg3)",
                    border: "1.5px solid " + (trialChoice === option.id ? "var(--gold)" : "var(--border2)"), color:"var(--text)" }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{option.name}</div>
                  <div style={{ fontSize:11.5, color:"var(--text2)", lineHeight:1.4 }}>{option.note}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <button className="login-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <span style={{ width:16, height:16, border:"2px solid #000", borderTopColor:"transparent",
                borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
              {t("processing", "Processing...")}
            </>
          ) : (
            mode === "login" ? t("sign_in", "Sign In") + " →" : t("create_account", "Create Account") + " →"
          )}
        </button>

        {/* Divider */}
        <div className="login-divider">
          <div className="login-divider-line" />
          <div className="login-divider-text">{t("continue_with", "or continue with")}</div>
          <div className="login-divider-line" />
        </div>

        {/* Social login */}
<div className="login-social">
  <button
    className="login-social-btn"
    onClick={async () => {
      try {
        setLoading(true);
        const res = await loginWithGoogle(returnTo);
        if (mode === "signup") trackEvent("signup_completed", { method:"google", source:signupSource, ...attributionEventProperties() });
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




        {/* Switch mode */}
        <div className="login-footer-text">
          {mode === "login"
            ? <>{t("no_account", "Don't have an account?")} <a onClick={() => switchMode("signup")}>{t("sign_up_free", "Sign up free")}</a></>
            : <>{t("have_account", "Already have an account?")} <a onClick={() => switchMode("login")}>{t("sign_in", "Sign in")}</a></>
          }
        </div>
      </div>
    </div>
  );
}
