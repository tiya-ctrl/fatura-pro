import { useState, useRef, useEffect } from "react";

/* ─── FONTS & GLOBAL ─────────────────────────────────────────── */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
`;

const GLOBAL = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'DM Sans', sans-serif; background: #08080e; color: #e8e4dc; -webkit-text-size-adjust:100%; overflow-x:hidden; }
:root {
  --gold: #c9a84c; --gold-l: #e8c97a; --gold-dim: rgba(201,168,76,0.13);
  --bg: #08080e; --bg2: #0f0f17; --bg3: #16161f; --bg4: #1c1c27;
  --border: rgba(201,168,76,0.16); --border2: rgba(255,255,255,0.07);
  --text: #e8e4dc; --text2: #9a9690; --text3: #5a5750;
  --green: #4caf89; --red: #e05555; --radius: 14px;
}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
/* animations */
@keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes shimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
.fade-up { animation: fadeUp 0.6s ease both; }
.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.22s; }
.delay-3 { animation-delay: 0.34s; }
.delay-4 { animation-delay: 0.46s; }
/* nav */
nav.topnav {
  position: fixed; top:0; left:0; right:0; z-index:100;
  display:flex; align-items:center; justify-content:space-between;
  padding:16px 48px; transition: background 0.3s, backdrop-filter 0.3s;
}
nav.topnav.scrolled {
  background: rgba(8,8,14,0.88); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}
.nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
.nav-logo-icon { width:32px;height:32px;background:var(--gold);border-radius:8px;
  display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#000; }
.nav-logo-text { font-family:'Playfair Display',serif; font-size:20px; color:var(--gold); letter-spacing:0.3px; }
.nav-links { display:flex; gap:32px; list-style:none; }
.nav-links a { font-size:14px; font-weight:500; color:var(--text2); text-decoration:none; transition:color 0.2s; }
.nav-links a:hover { color:var(--text); }
.nav-cta { display:flex; gap:10px; align-items:center; }
.btn { display:inline-flex; align-items:center; gap:6px; padding:10px 22px; border-radius:9px;
  font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s;
  font-family:'DM Sans',sans-serif; text-decoration:none; white-space:nowrap; }
.btn-gold { background:var(--gold); color:#000; }
.btn-gold:hover { background:var(--gold-l); transform:translateY(-1px); box-shadow:0 6px 22px rgba(201,168,76,0.35); }
.btn-outline { background:transparent; color:var(--text); border:1px solid var(--border2); }
.btn-outline:hover { border-color:var(--gold); color:var(--gold); }
.btn-lg { padding:14px 32px; font-size:15px; border-radius:11px; }
.btn-xl { padding:16px 40px; font-size:16px; border-radius:12px; }
/* hero */
.hero {
  min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; padding:120px 24px 80px; position:relative; overflow:hidden;
}
.hero-grid {
  position:absolute; inset:0; opacity:0.04;
  background-image: linear-gradient(var(--border2) 1px, transparent 1px), linear-gradient(90deg, var(--border2) 1px, transparent 1px);
  background-size: 50px 50px;
}
.hero-glow {
  position:absolute; top:20%; left:50%; transform:translateX(-50%);
  width:700px; height:400px; border-radius:50%;
  background: radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%);
  pointer-events:none;
}

@media (max-width: 640px) {
  .hero-glow {
    width: 320px;
    height: 220px;
  }
}

.hero-tag {
  display:inline-flex; align-items:center; gap:8px; background:var(--gold-dim);
  border:1px solid var(--border); border-radius:100px; padding:6px 16px;
  font-size:12px; font-weight:600; color:var(--gold); letter-spacing:0.5px;
  margin-bottom:28px; text-transform:uppercase;
}
.hero-tag-dot { width:6px;height:6px;border-radius:50%;background:var(--gold);animation:pulse 2s infinite; }
.hero-title {
  font-family:'Playfair Display',serif; font-size:clamp(42px,7vw,84px);
  line-height:1.08; color:var(--text); margin-bottom:8px; font-weight:700;
}
.hero-title em { font-style:italic; color:var(--gold); }
.hero-sub {
  font-size:clamp(16px,2vw,20px); color:var(--text2); max-width:540px;
  margin:16px auto 40px; line-height:1.65; font-weight:300;
}
.hero-actions { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:64px; }
.hero-social-proof { display:flex; align-items:center; gap:16px; justify-content:center; flex-wrap:wrap; }
.proof-avatars { display:flex; }
.proof-avatar {
  width:34px;height:34px;border-radius:50%;border:2px solid var(--bg);
  background:var(--bg3); display:flex;align-items:center;justify-content:center;
  font-size:14px; margin-left:-10px;
}
.proof-avatar:first-child { margin-left:0; }
.proof-text { font-size:13px; color:var(--text2); }
.proof-text strong { color:var(--text); }
/* dashboard mockup */
.mockup-wrap { width:100%; max-width:900px; margin:0 auto; position:relative; }
.mockup-glow { position:absolute; bottom:-60px; left:50%; transform:translateX(-50%);
  width:80%; height:200px; background:radial-gradient(ellipse, rgba(201,168,76,0.18) 0%, transparent 70%); }
.mockup-frame {
  background:var(--bg2); border:1px solid var(--border); border-radius:16px;
  overflow:hidden; box-shadow:0 40px 80px rgba(0,0,0,0.6);
}
.mockup-bar { background:var(--bg3); padding:12px 16px; border-bottom:1px solid var(--border);
  display:flex; align-items:center; gap:8px; }
.mockup-dot { width:10px;height:10px;border-radius:50%; }
.mockup-body { display:flex; height:280px; }
.mockup-side { width:160px; background:var(--bg2); border-right:1px solid var(--border); padding:16px 12px; flex-shrink:0; }
.mockup-nav-item { height:30px; border-radius:7px; margin-bottom:6px; background:var(--bg3); }
.mockup-nav-item.active { background:var(--gold-dim); }
.mockup-content { flex:1; padding:16px; display:grid; grid-template-columns:repeat(4,1fr); gap:10px; align-content:start; }
.mockup-stat { background:var(--bg3); border:1px solid var(--border); border-radius:10px; padding:12px; }
.mockup-stat-val { height:18px; border-radius:4px; background:var(--bg4); margin-top:8px; width:70%; }
.mockup-stat-val.gold { background:var(--gold-dim); }
.mockup-row { grid-column:1/-1; background:var(--bg3); border:1px solid var(--border); border-radius:10px; padding:12px; display:flex; gap:10px; align-items:center; }
.mockup-row-bar { height:10px; border-radius:4px; background:var(--bg4); flex:1; }
.mockup-badge { width:52px; height:20px; border-radius:20px; background:rgba(76,175,137,0.2); flex-shrink:0; }
/* sections */
section { padding:100px 24px; }
.container { max-width:1100px; margin:0 auto; }
.section-tag { font-size:11px; font-weight:700; color:var(--gold); letter-spacing:2px; text-transform:uppercase; margin-bottom:14px; }
.section-title { font-family:'Playfair Display',serif; font-size:clamp(30px,4vw,48px); color:var(--text); line-height:1.15; margin-bottom:16px; }
.section-sub { font-size:17px; color:var(--text2); line-height:1.7; max-width:520px; }
/* features */
.features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:60px; }
.feat-card {
  background:var(--bg2); border:1px solid var(--border2); border-radius:var(--radius);
  padding:28px; transition:all 0.25s; position:relative; overflow:hidden;
}
.feat-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  background:linear-gradient(90deg, transparent, var(--gold), transparent);
  opacity:0; transition:opacity 0.3s;
}
.feat-card:hover { border-color:var(--border); transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.3); }
.feat-card:hover::before { opacity:1; }
.feat-icon { font-size:28px; margin-bottom:16px; display:block; animation:float 4s ease-in-out infinite; }
.feat-title { font-size:17px; font-weight:700; color:var(--text); margin-bottom:8px; }
.feat-desc { font-size:14px; color:var(--text2); line-height:1.65; }
.feat-pro { display:inline-block; font-size:10px; font-weight:700; color:var(--gold);
  background:var(--gold-dim); border:1px solid var(--border); border-radius:20px;
  padding:2px 8px; margin-top:10px; letter-spacing:0.5px; }
/* how it works */
.how-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; margin-top:60px; position:relative; }
.how-grid::before {
  content:''; position:absolute; top:32px; left:10%; right:10%; height:1px;
  background:linear-gradient(90deg, transparent, var(--border), var(--gold), var(--border), transparent);
}
.how-step { text-align:center; position:relative; z-index:1; }
.how-num {
  width:64px; height:64px; border-radius:50%; background:var(--bg2);
  border:2px solid var(--border); display:flex; align-items:center; justify-content:center;
  font-family:'Playfair Display',serif; font-size:22px; color:var(--gold);
  margin:0 auto 20px; font-weight:700;
}
.how-title { font-size:15px; font-weight:700; color:var(--text); margin-bottom:8px; }
.how-desc { font-size:13px; color:var(--text2); line-height:1.6; }
/* pricing */
.pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:60px; align-items:start; }
.price-card {
  background:var(--bg2); border:1px solid var(--border2); border-radius:var(--radius);
  padding:32px; position:relative; overflow:hidden;
}
.price-card.featured {
  background: linear-gradient(160deg, #16161f 0%, #1a1520 100%);
  border:1.5px solid var(--gold); box-shadow:0 0 40px rgba(201,168,76,0.12);
  transform:scale(1.04);
}
.price-badge {
  position:absolute; top:16px; right:16px; background:var(--gold); color:#000;
  font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase;
  border-radius:20px; padding:4px 12px;
}
.price-plan { font-size:12px; font-weight:700; color:var(--text2); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; }
.price-amount { display:flex; align-items:baseline; gap:4px; margin-bottom:6px; }
.price-currency { font-size:22px; font-weight:700; color:var(--text2); }
.price-num { font-family:'Playfair Display',serif; font-size:54px; color:var(--text); font-weight:700; line-height:1; }
.price-period { font-size:14px; color:var(--text2); }
.price-desc { font-size:13px; color:var(--text2); margin-bottom:24px; line-height:1.5; }
.price-divider { height:1px; background:var(--border2); margin:24px 0; }
.price-feature { display:flex; align-items:flex-start; gap:10px; font-size:13px; color:var(--text2); margin-bottom:11px; line-height:1.5; }
.price-feature-check { color:var(--green); font-size:14px; flex-shrink:0; margin-top:1px; }
.price-feature-x { color:var(--text3); font-size:14px; flex-shrink:0; margin-top:1px; }
.price-cta { width:100%; margin-top:28px; justify-content:center; }
/* testimonials */
.testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:60px; }
.testi-card { background:var(--bg2); border:1px solid var(--border2); border-radius:var(--radius); padding:28px; }
.testi-stars { color:var(--gold); font-size:14px; margin-bottom:14px; letter-spacing:2px; }
.testi-text { font-size:14px; color:var(--text); line-height:1.75; margin-bottom:20px; font-style:italic; }
.testi-author { display:flex; align-items:center; gap:12px; }
.testi-avatar { width:40px;height:40px;border-radius:50%;background:var(--bg4);
  display:flex;align-items:center;justify-content:center;font-size:18px;border:1px solid var(--border); }
.testi-name { font-size:13px; font-weight:700; color:var(--text); }
.testi-role { font-size:12px; color:var(--text2); }
/* faq */
.faq-list { max-width:700px; margin:48px auto 0; }
.faq-item { border-bottom:1px solid var(--border2); }
.faq-q { display:flex; justify-content:space-between; align-items:center; padding:20px 0;
  cursor:pointer; font-size:15px; font-weight:600; color:var(--text); transition:color 0.2s; }
.faq-q:hover { color:var(--gold); }
.faq-icon { color:var(--gold); font-size:18px; transition:transform 0.25s; flex-shrink:0; }
.faq-icon.open { transform:rotate(45deg); }
.faq-a { font-size:14px; color:var(--text2); line-height:1.75; padding-bottom:20px; }
/* cta section */
.cta-section {
  text-align:center; padding:120px 24px;
  background:radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%);
  border-top:1px solid var(--border);
}
/* footer */
footer {
  background:var(--bg2); border-top:1px solid var(--border2);
  padding:48px 48px 32px;
}
.footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:40px; margin-bottom:48px; }
.footer-brand p { font-size:13px; color:var(--text2); line-height:1.7; margin-top:12px; max-width:240px; }
.footer-col h4 { font-size:12px; font-weight:700; color:var(--text2); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:16px; }
.footer-col a { display:block; font-size:13px; color:var(--text2); text-decoration:none; margin-bottom:10px; transition:color 0.2s; }
.footer-col a:hover { color:var(--gold); }
.footer-bottom { border-top:1px solid var(--border2); padding-top:24px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text2); flex-wrap:wrap; gap:10px; }
/* chatbot */
.chat-btn {
  position:fixed; bottom:28px; right:28px; z-index:200;
  width:56px; height:56px; border-radius:50%; background:var(--gold);
  border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
  font-size:24px; box-shadow:0 6px 24px rgba(201,168,76,0.5);
  transition:transform 0.2s, box-shadow 0.2s; animation:float 4s ease-in-out infinite;
}
.chat-btn:hover { transform:scale(1.1); box-shadow:0 8px 32px rgba(201,168,76,0.6); }
.chat-window {
  position:fixed; bottom:96px; right:28px; z-index:200;
  width:360px; max-width:calc(100vw - 40px);
  background:var(--bg2); border:1px solid var(--border);
  border-radius:20px; box-shadow:0 24px 64px rgba(0,0,0,0.6);
  display:flex; flex-direction:column; overflow:hidden;
  animation:fadeUp 0.25s ease;
}
.chat-head {
  background:linear-gradient(135deg, var(--bg3) 0%, #1a1520 100%);
  padding:16px 18px; border-bottom:1px solid var(--border);
  display:flex; align-items:center; gap:12px;
}
.chat-head-avatar {
  width:38px;height:38px;border-radius:50%;background:var(--gold);
  display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#000;
  flex-shrink:0;
}
.chat-head-info { flex:1; }
.chat-head-name { font-size:14px; font-weight:700; color:var(--text); }
.chat-head-status { font-size:11px; color:var(--green); display:flex; align-items:center; gap:5px; }
.chat-head-dot { width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s infinite; }
.chat-close { background:none;border:none;color:var(--text2);cursor:pointer;font-size:18px;padding:4px; }
.chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; max-height:360px; min-height:200px; }
.chat-msg { max-width:85%; display:flex; flex-direction:column; gap:3px; }
.chat-msg.user { align-self:flex-end; align-items:flex-end; }
.chat-msg.bot  { align-self:flex-start; }
.chat-bubble {
  padding:10px 14px; border-radius:14px; font-size:13px; line-height:1.6;
}
.chat-msg.user .chat-bubble { background:var(--gold); color:#000; border-radius:14px 14px 4px 14px; }
.chat-msg.bot  .chat-bubble { background:var(--bg3); color:var(--text); border:1px solid var(--border2); border-radius:14px 14px 14px 4px; }
.chat-time { font-size:10px; color:var(--text3); padding:0 4px; }
.chat-typing { display:flex; gap:5px; padding:12px 14px; background:var(--bg3); border:1px solid var(--border2);
  border-radius:14px 14px 14px 4px; width:52px; }
.chat-typing span { width:7px;height:7px;border-radius:50%;background:var(--text2); animation:pulse 1.2s infinite; }
.chat-typing span:nth-child(2) { animation-delay:0.2s; }
.chat-typing span:nth-child(3) { animation-delay:0.4s; }
.chat-suggestions { padding:8px 16px 4px; display:flex; gap:6px; flex-wrap:wrap; }
.chat-sug { font-size:11px; background:var(--bg3); border:1px solid var(--border2);
  border-radius:20px; padding:5px 12px; cursor:pointer; color:var(--text2);
  transition:all 0.15s; white-space:nowrap; }
.chat-sug:hover { border-color:var(--gold); color:var(--gold); }
.chat-input-row { padding:12px 14px; border-top:1px solid var(--border2); display:flex; gap:8px; align-items:flex-end; }
.chat-input {
  flex:1; background:var(--bg3); border:1px solid var(--border2); border-radius:10px;
  color:var(--text); font-size:13px; padding:10px 12px; font-family:'DM Sans',sans-serif;
  outline:none; resize:none; max-height:100px; min-height:40px; transition:border-color 0.2s;
  line-height:1.5;
}
.chat-input:focus { border-color:var(--gold); }
.chat-send {
  width:38px;height:38px;border-radius:9px;background:var(--gold);border:none;
  cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;
  flex-shrink:0; transition:all 0.2s; color:#000;
}
.chat-send:hover { background:var(--gold-l); transform:scale(1.05); }
.chat-send:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
/* mobile */
@media(max-width:900px){
  nav.topnav { padding:14px 20px; }
  .nav-links { display:none; }
  .features-grid,.how-grid,.pricing-grid,.testi-grid { grid-template-columns:1fr; }
  .price-card.featured { transform:scale(1); }
  .footer-grid { grid-template-columns:1fr 1fr; }
  .hero-title { font-size:clamp(36px,8vw,60px); }
  .how-grid::before { display:none; }
}
@media(max-width:500px){
  section { padding:70px 18px; }
  .footer-grid { grid-template-columns:1fr; }
  footer { padding:36px 20px 24px; }
  .chat-window { right:14px; bottom:86px; width:calc(100vw - 28px); }
  .chat-btn { right:18px; bottom:20px; }
}
`;

/* ─── DATA ───────────────────────────────────────────────────── */
const FEATURES = [
  { icon:"📄", title:"Smart Invoices", desc:"Create professional invoices in seconds. Add your logo, client details, line items, tax, and discounts. Multiple currencies supported.", pro:false },
  { icon:"🌍", title:"17 Currencies", desc:"Bill clients in EUR, USD, GBP, AED, SAR, MAD, DZD and more. Automatic formatting per locale.", pro:false },
  { icon:"🔔", title:"Payment Reminders", desc:"Auto-detect overdue invoices and send polite, firm or final payment reminders via Email or WhatsApp with one click.", pro:true },
  { icon:"📊", title:"Revenue Dashboard", desc:"Track paid, pending and overdue invoices at a glance. Know exactly where your money is at all times.", pro:false },
  { icon:"👥", title:"Client Management", desc:"Store all your client information, billing history, and contact details in one organised place.", pro:false },
  { icon:"🖨️", title:"PDF Export & Print", desc:"Generate print-ready, pixel-perfect invoices in PDF format. Share directly with clients or store for accounting.", pro:true },
  { icon:"✏️", title:"Invoice Editing", desc:"Mistakes happen. Edit any invoice any time — update amounts, dates, items, or client details instantly.", pro:false },
  { icon:"🏦", title:"Bank Details on Invoice", desc:"Add your IBAN, BIC/Swift, Wise or PayPal info to every invoice so clients always know how to pay.", pro:false },
  { icon:"📱", title:"Mobile Ready", desc:"Full-featured on phone, tablet and desktop. Create and manage invoices from anywhere.", pro:false },
];

const PLANS = [
  {
    name:"Free", price:0, desc:"Perfect for freelancers just getting started.",
    features:[
      { text:"5 invoices per month", ok:true },
      { text:"3 clients", ok:true },
      { text:"All currencies", ok:true },
      { text:"Dashboard & analytics", ok:true },
      { text:"Payment reminders", ok:false },
      { text:"PDF export", ok:false },
      { text:"Unlimited invoices", ok:false },
      { text:"Priority support", ok:false },
    ],
    cta:"Start Free", ctaStyle:"btn-outline",
  },
  {
    name:"Pro", price:9, desc:"For freelancers and small businesses growing fast.", featured:true,
    features:[
      { text:"Unlimited invoices", ok:true },
      { text:"Unlimited clients", ok:true },
      { text:"All currencies", ok:true },
      { text:"Dashboard & analytics", ok:true },
      { text:"Payment reminders (Email + WhatsApp)", ok:true },
      { text:"PDF export", ok:true },
      { text:"Custom logo & branding", ok:true },
      { text:"Priority support", ok:false },
    ],
    cta:"Start 7-day Trial", ctaStyle:"btn-gold",
  },
  {
    name:"Business", price:19, desc:"For agencies and teams managing multiple clients.", badge:"Coming Soon",
    features:[
      { text:"Everything in Pro", ok:true },
      { text:"Team members (up to 5)", ok:true },
      { text:"Multi-business profiles", ok:true },
      { text:"Advanced analytics & reports", ok:true },
      { text:"Stripe payment integration", ok:true },
      { text:"API access", ok:true },
      { text:"Accountant export (CSV/Excel)", ok:true },
      { text:"Priority + live chat support", ok:true },
    ],
    cta:"Join Waitlist", ctaStyle:"btn-outline",
  },
];

const TESTIMONIALS = [
  { stars:"★★★★★", text:"Fatūra changed how I bill clients. I used to spend 30 minutes on each invoice — now it takes under 2 minutes and looks 10× more professional.", name:"Karim B.", role:"Freelance Designer · Morocco", avatar:"🇲🇦" },
  { stars:"★★★★★", text:"The reminder feature alone paid for the subscription. I recovered 3 overdue payments in the first week. Highly recommend for any freelancer.", name:"Sara M.", role:"Social Media Consultant · Netherlands", avatar:"🇳🇱" },
  { stars:"★★★★★", text:"As someone billing clients in both euros and GBP, the multi-currency support is a lifesaver. Clean, fast, and works perfectly on my phone.", name:"Mark H.", role:"E-commerce Consultant · Germany", avatar:"DE" },
];

const FAQS = [
  { q:"Do I need a business registration to use Fatūra?", a:"No. Anyone can use Fatūra — freelancers, solopreneurs, and small businesses alike. You don't need a registered company or VAT number to get started." },
  { q:"Can I send invoices in Arabic?", a:"You can enter all your content in Arabic including client names, company names, and notes. Full RTL invoice layout is on our roadmap for Q3." },
  { q:"How does the payment reminder work?", a:"Fatūra automatically detects when an invoice passes its due date. You can then send a pre-written reminder via Email or WhatsApp in one click — choose from Polite, Firm, or Final Reminder tone." },
  { q:"What payment methods does Stripe accept?", a:"Stripe accepts all major credit and debit cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and local methods depending on your region." },
  { q:"Is my data secure?", a:"All data is encrypted in transit (TLS) and at rest. We never sell or share your data with third parties. You can export or delete your data at any time." },
  { q:"Can I upgrade or cancel anytime?", a:"Yes, absolutely. No lock-in contracts. Upgrade, downgrade, or cancel at any time directly from your account settings." },
];

const SYSTEM_PROMPT = `You are Fatūra's friendly support assistant. Fatūra is a professional SaaS invoicing platform.

Key facts about Fatūra:
- Creates professional invoices with logos, line items, tax, discounts
- Supports 17 currencies (EUR, USD, GBP, AED, SAR, MAD, DZD, YER, QAR, KWD, TND, EGP, TRY, JPY, CNY, KRW, MYR, IDR)
- Free plan: 5 invoices/month, 3 clients
- Pro plan: €9/month — unlimited invoices & clients, PDF export, payment reminders via Email & WhatsApp
- Business plan: €19/month — everything in Pro + team members, multi-business, Stripe integration, API access (coming soon)
- Payment reminders: 3 tones (Polite, Firm, Final) via Email or WhatsApp
- Mobile-first responsive design
- Stripe for payments (no business registration needed)
- Built for freelancers and small businesses, especially Arabic-speaking entrepreneurs in Europe and MENA

Answer questions helpfully and concisely in the same language the user writes in (Arabic or English). Keep replies short (2-4 sentences max). If asked about pricing, features, or how something works, be specific. If you don't know something, say so honestly and suggest emailing support@fatura.app`;

/* ─── HELPERS ────────────────────────────────────────────────── */
const timeStr = () => new Date().toLocaleTimeString("en", { hour:"2-digit", minute:"2-digit" });

/* ─── COMPONENTS ─────────────────────────────────────────────── */
function NavBar({ onOpenApp, onSignIn }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav className={`topnav ${scrolled ? "scrolled" : ""}`}>
      <a className="nav-logo" href="#top">
        <div className="nav-logo-icon">F</div>
        <span className="nav-logo-text">Fatūra</span>
      </a>
      <ul className="nav-links">
        {[["#features","Features"],["#pricing","Pricing"],["#how","How it works"],["#faq","FAQ"]].map(([h,l]) => (
          <li key={h}><a href={h}>{l}</a></li>
        ))}
      </ul>
      <div className="nav-cta">
        <a href="#pricing" className="btn btn-outline">Sign in</a>
        <button className="btn btn-gold" onClick={onOpenApp}>Try Free →</button>
      </div>
    </nav>
  );
}

function Hero({ onOpenApp }) {
  return (
    <section className="hero" id="top">
      <div className="hero-grid" />
      <div className="hero-glow" />
      <div className="fade-up">
        <div className="hero-tag">
          <span className="hero-tag-dot" />
          No business registration needed
        </div>
      </div>
      <h1 className="hero-title fade-up delay-1">
        Invoice like a<br /><em>professional.</em>
      </h1>
      <p className="hero-sub fade-up delay-2">
        Create, send and track professional invoices in minutes. The #1 invoicing app for freelancers and entrepreneurs across Europe and MENA — supports EUR, USD, AED, MAD and 14 more currencies.
      </p>
      <div className="hero-actions fade-up delay-3">
        <button className="btn btn-gold btn-xl" onClick={onOpenApp}>Start for Free →</button>
        <a href="#features" className="btn btn-outline btn-lg">See Features</a>
      </div>
      <div className="hero-social-proof fade-up delay-4">
        <div className="proof-avatars">
          {["🇲🇦","🇩🇿","🇳🇱","🇫🇷","🇦🇪"].map((f,i) => <div key={i} className="proof-avatar">{f}</div>)}
        </div>
        <p className="proof-text"><strong>2,400+</strong> freelancers already billing smarter</p>
      </div>
      <div className="mockup-wrap fade-up delay-4" style={{ marginTop:64 }}>
        <div className="mockup-glow" />
        <div className="mockup-frame">
          <div className="mockup-bar">
            <div className="mockup-dot" style={{ background:"#ff5f57" }} />
            <div className="mockup-dot" style={{ background:"#febc2e" }} />
            <div className="mockup-dot" style={{ background:"#28c840" }} />
            <div style={{ flex:1, height:20, background:"var(--bg4)", borderRadius:6, marginLeft:12 }} />
          </div>
          <div className="mockup-body">
            <div className="mockup-side">
              {[1,0,0,0,0].map((a,i) => <div key={i} className={`mockup-nav-item ${a ? "active" : ""}`} />)}
            </div>
            <div className="mockup-content">
              {["gold","","",""].map((c,i) => (
                <div key={i} className="mockup-stat">
                  <div style={{ height:8, width:"60%", background:"var(--bg4)", borderRadius:4 }} />
                  <div className={`mockup-stat-val ${c}`} />
                </div>
              ))}
              {[1,2,3,4].map(i => (
                <div key={i} className="mockup-row">
                  <div className="mockup-row-bar" style={{ width:`${[80,60,90,50][i-1]}%` }} />
                  <div className="mockup-badge" style={{ background: i===1 ? "rgba(76,175,137,0.2)":i===2 ? "rgba(224,154,69,0.2)":"rgba(224,85,85,0.2)" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" style={{ background:"var(--bg2)", borderTop:"1px solid var(--border2)", borderBottom:"1px solid var(--border2)" }}>
      <div className="container">
        <div className="section-tag">Features</div>
        <h2 className="section-title">The smartest way to invoice.<br /><em style={{ fontStyle:"italic", color:"var(--gold)" }}>Built for how you work.</em></h2>
        <p className="section-sub">Built specifically for freelancers and entrepreneurs who need professional invoicing without the complexity.</p>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card" style={{ animationDelay:`${i*0.07}s` }}>
              <span className="feat-icon" style={{ animationDelay:`${i*0.3}s` }}>{f.icon}</span>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
              {f.pro && <div className="feat-pro">✦ PRO</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstallApp() {
  return (
    <section style={{ background:"var(--bg)", borderTop:"1px solid var(--border2)" }}>
      <div className="container" style={{ textAlign:"center", padding:"80px 24px" }}>
        <div className="section-tag" style={{ justifyContent:"center", display:"flex" }}>📲 Mobile App</div>
        <h2 className="section-title">Use Fatūra as a<br /><em style={{ color:"var(--gold)", fontStyle:"italic" }}>mobile app.</em></h2>
        <p className="section-sub" style={{ maxWidth:520, margin:"0 auto 48px" }}>
          No App Store needed. Install Fatūra directly from your browser in seconds — works on iPhone and Android.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:20, maxWidth:700, margin:"0 auto 48px" }}>
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"24px 20px" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🍎</div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:12, color:"var(--text)" }}>iPhone (Safari)</div>
            <ol style={{ textAlign:"left", paddingLeft:18, color:"var(--text2)", fontSize:13, lineHeight:2 }}>
              <li>Open Fatūra in Safari</li>
              <li>Tap the <strong style={{ color:"var(--text)" }}>Share</strong> button (□↑)</li>
              <li>Scroll down and tap <strong style={{ color:"var(--text)" }}>Add to Home Screen</strong></li>
              <li>Tap <strong style={{ color:"var(--text)" }}>Add</strong> — done! ✓</li>
            </ol>
          </div>
          <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:14, padding:"24px 20px" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🤖</div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:12, color:"var(--text)" }}>Android (Chrome)</div>
            <ol style={{ textAlign:"left", paddingLeft:18, color:"var(--text2)", fontSize:13, lineHeight:2 }}>
              <li>Open Fatūra in Chrome</li>
              <li>Tap the <strong style={{ color:"var(--text)" }}>⋮ menu</strong> (top right)</li>
              <li>Tap <strong style={{ color:"var(--text)" }}>Add to Home Screen</strong></li>
              <li>Tap <strong style={{ color:"var(--text)" }}>Add</strong> — done! ✓</li>
            </ol>
          </div>
        </div>
        <p style={{ color:"var(--text2)", fontSize:13 }}>Opens full-screen · No ads · Works offline · Free forever</p>
      </div>
    </section>
  );
}

function HowItWorks({ onOpenApp }) {
  const steps = [
    { n:"1", icon:"🏢", title:"Set up your profile", desc:"Add your company name, logo, address, and banking details once. It'll appear on every invoice." },
    { n:"2", icon:"👤", title:"Add your client", desc:"Enter client details or pick from your saved contacts. Phone, email, address — all stored securely." },
    { n:"3", icon:"📋", title:"Add line items", desc:"List your services or products with quantity and price. Fatūra calculates tax and discounts automatically." },
    { n:"4", icon:"✉️", title:"Send & get paid", desc:"Preview the invoice, send it by email, or share the PDF. Then track whether it's been paid." },
  ];
  return (
    <section id="how">
      <div className="container">
        <div style={{ textAlign:"center", marginBottom:0 }}>
          <div className="section-tag" style={{ justifyContent:"center", display:"flex" }}>How it works</div>
          <h2 className="section-title">From zero to sent invoice<br />in <em style={{ color:"var(--gold)", fontStyle:"italic" }}>under 3 minutes.</em></h2>
        </div>
        <div className="how-grid">
          {steps.map((s, i) => (
            <div key={i} className="how-step">
              <div className="how-num">{s.n}</div>
              <div style={{ fontSize:26, marginBottom:14 }}>{s.icon}</div>
              <div className="how-title">{s.title}</div>
              <div className="how-desc">{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:56 }}>
          <button className="btn btn-gold btn-lg" onClick={onOpenApp}>Create Your First Invoice →</button>
        </div>
      </div>
    </section>
  );
}

function Pricing({ onOpenApp }) {
  const [annual, setAnnual] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [waitEmail, setWaitEmail] = useState("");
  const [waitStatus, setWaitStatus] = useState("");
  const handleWaitlist = async () => {
    if (!waitEmail.includes("@")) return;
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);
    const { error } = await sb.from("waitlist").insert({ email: waitEmail });
    if (error && error.code === "23505") { setWaitStatus("already"); }
    else if (error) { setWaitStatus("error"); }
    else { setWaitStatus("success"); }
  };
  return (
    <section id="pricing" style={{ background:"var(--bg2)", borderTop:"1px solid var(--border2)", borderBottom:"1px solid var(--border2)" }}>
      <div className="container">
        <div style={{ textAlign:"center" }}>
          <div className="section-tag" style={{ justifyContent:"center", display:"flex" }}>Pricing</div>
          <h2 className="section-title">Simple, honest pricing.</h2>
          <p className="section-sub" style={{ margin:"0 auto" }}>No hidden fees. Cancel anytime. Start free, upgrade when you're ready.</p>
          <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center", marginTop:24 }}>
            <span style={{ fontSize:13, color: annual ? "var(--text2)" : "var(--text)", fontWeight:600 }}>Monthly</span>
            <div onClick={() => setAnnual(a => !a)} style={{
              width:44, height:24, borderRadius:12, background: annual ? "var(--gold)" : "var(--bg4)",
              cursor:"pointer", position:"relative", transition:"background 0.2s", border:"1px solid var(--border)"
            }}>
              <div style={{ position:"absolute", top:3, left: annual ? 22 : 2, width:16, height:16,
                borderRadius:50, background:"#fff", transition:"left 0.2s" }} />
            </div>
            <span style={{ fontSize:13, color: annual ? "var(--text)" : "var(--text2)", fontWeight:600 }}>
              Annual <span style={{ color:"var(--green)", fontSize:11 }}>save 20%</span>
            </span>
          </div>
        </div>
        <div className="pricing-grid">
          {PLANS.map((p, i) => (
            <div key={i} className={`price-card ${p.featured ? "featured" : ""}`}>
              {p.badge && <div className="price-badge">{p.badge}</div>}
              <div className="price-plan">{p.name}</div>
              <div className="price-amount">
                {p.price > 0 ? <>
                  <span className="price-currency">€</span>
                  <span className="price-num">{annual ? Math.round(p.price * 0.8) : p.price}</span>
                  <span className="price-period">/ mo</span>
                </> : <span className="price-num" style={{ fontSize:42 }}>Free</span>}
              </div>
              {p.price > 0 && annual && <div style={{ fontSize:12, color:"var(--green)", marginBottom:4 }}>Billed €{Math.round(p.price * 0.8 * 12)}/year</div>}
              <div className="price-desc">{p.desc}</div>
              <div className="price-divider" />
              {p.features.map((f, j) => (
                <div key={j} className="price-feature">
                  <span className={f.ok ? "price-feature-check" : "price-feature-x"}>{f.ok ? "✓" : "—"}</span>
                  <span style={{ color: f.ok ? "var(--text)" : "var(--text3)" }}>{f.text}</span>
                </div>
              ))}
              <button className={`btn ${p.ctaStyle} price-cta`} onClick={p.cta === "Join Waitlist" ? () => setShowWaitlist(true) : onOpenApp}>{p.cta}</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:36, fontSize:13, color:"var(--text2)" }}>
          🔒 Payments powered by Stripe · TLS encrypted · Cancel anytime
        </div>
        {showWaitlist && <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}><div style={{ background:"#111118", border:"1px solid rgba(201,168,76,0.18)", borderRadius:16, padding:32, maxWidth:440, width:"100%", maxHeight:"90vh", overflowY:"auto" }}><div style={{ fontFamily:"Playfair Display, serif", fontSize:22, marginBottom:8, color:"#e8e4dc" }}>Business Plan — Coming Soon</div><div style={{ fontSize:13, color:"#9a9690", marginBottom:16, lineHeight:1.6 }}>Join the waitlist and be the first to know when we launch.</div>{waitStatus === "success" ? <div style={{ textAlign:"center", padding:"16px 0" }}><div style={{ color:"#4caf89", fontSize:15, fontWeight:600, marginBottom:8 }}>You are on the list!</div><div style={{ color:"#9a9690", fontSize:13, lineHeight:1.6, marginBottom:16 }}>Thank you! We will notify you when Business Plan launches. Meanwhile, enjoy Pro free for 7 days.</div><button onClick={() => setShowWaitlist(false)} style={{ padding:"10px 24px", borderRadius:8, background:"#c9a84c", border:"none", color:"#000", fontWeight:600, cursor:"pointer" }}>Continue with Pro</button></div> : <div><input value={waitEmail} onChange={e => setWaitEmail(e.target.value)} placeholder="your@email.com" style={{ width:"100%", background:"#18181f", border:"1px solid rgba(201,168,76,0.18)", borderRadius:8, color:"#e8e4dc", fontSize:14, padding:"11px 14px", marginBottom:12, fontFamily:"DM Sans, sans-serif", outline:"none", boxSizing:"border-box" }} />{waitStatus === "already" && <div style={{ fontSize:12, color:"#c9a84c", marginBottom:8 }}>Already on the waitlist!</div>}<div style={{ display:"flex", gap:10 }}><button onClick={() => setShowWaitlist(false)} style={{ flex:1, padding:"10px", borderRadius:8, background:"#18181f", border:"1px solid rgba(255,255,255,0.07)", color:"#9a9690", cursor:"pointer" }}>Cancel</button><button onClick={handleWaitlist} style={{ flex:1, padding:"10px", borderRadius:8, background:"#c9a84c", border:"none", color:"#000", fontWeight:600, cursor:"pointer" }}>Notify Me</button></div></div>}</div></div>}
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section>
      <div className="container">
        <div style={{ textAlign:"center" }}>
          <div className="section-tag" style={{ justifyContent:"center", display:"flex" }}>Testimonials</div>
          <h2 className="section-title">Trusted by freelancers<br />across <em style={{ color:"var(--gold)", fontStyle:"italic" }}>3 continents.</em></h2>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testi-card">
              <div className="testi-stars">{t.stars}</div>
              <p className="testi-text">"{t.text}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.avatar}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" style={{ background:"var(--bg2)", borderTop:"1px solid var(--border2)" }}>
      <div className="container">
        <div style={{ textAlign:"center" }}>
          <div className="section-tag" style={{ justifyContent:"center", display:"flex" }}>FAQ</div>
          <h2 className="section-title">Questions? We've got answers.</h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <span className={`faq-icon ${open === i ? "open" : ""}`}>+</span>
              </div>
              {open === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ onOpenApp }) {
  return (
    <div className="cta-section">
      <div className="container">
        <div className="hero-tag" style={{ justifyContent:"center", margin:"0 auto 24px" }}>
          <span className="hero-tag-dot" /> Start today — free forever
        </div>
        <h2 className="section-title" style={{ textAlign:"center", fontSize:"clamp(32px,5vw,56px)" }}>
          Ready to get paid<br /><em style={{ color:"var(--gold)", fontStyle:"italic" }}>faster?</em>
        </h2>
        <p style={{ textAlign:"center", color:"var(--text2)", fontSize:17, marginTop:16, marginBottom:40 }}>
          Join 2,400+ freelancers who stopped chasing payments.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn btn-gold btn-xl" onClick={onOpenApp}>Create Free Account →</button>
          <a href="#pricing" className="btn btn-outline btn-lg">View Pricing</a>
        </div>
      </div>
    </div>
  );
}

function Footer({ onOpenApp }) {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className="nav-logo-icon">F</div>
            <span className="nav-logo-text">Fatūra</span>
          </div>
          <p>Professional invoicing software for freelancers, consultants, and entrepreneurs in MENA and Europe. Create and send invoices in EUR, USD, AED, MAD and 14 currencies. No business registration needed.</p>
          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:4 }}>
            <span style={{ fontSize:12, color:"var(--text2)" }}>📧 support@faturapro.app</span>
            <span style={{ fontSize:12, color:"var(--text2)" }}>🌍 Serving NL · MA · DZ · AE · FR & more</span>
          </div>
        </div>
        <div className="footer-col">
          <h4>Product</h4>
          {[["#features","Invoice Features"],["#pricing","Pricing Plans"],["#how","How It Works"],["#top","Install as App"]].map(([h,l]) => <a key={h} href={h}>{l}</a>)}
        </div>
        <div className="footer-col">
          <h4>Use Cases</h4>
          {[["#top","Freelancer Invoicing"],["#top","Multi-currency Billing"],["#top","MENA Invoicing"],["#top","EU Invoicing"]].map(([h,l]) => <a key={l} href={h}>{l}</a>)}
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <p style={{fontSize:12,color:"var(--text2)",lineHeight:1.8}}>Fatūra Pro is GDPR compliant and does not sell your data. All invoices and client data are encrypted and stored securely in the EU.<br/><br/>For privacy inquiries: support@faturapro.app</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Fatūra Pro · Professional Invoicing for Freelancers · faturapro.app</span>
        <span style={{ display:"flex", gap:16 }}>
          <a href="https://x.com" target="_blank" rel="noreferrer" style={{ color:"var(--text2)", fontSize:18, textDecoration:"none" }}>𝕏</a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color:"var(--text2)", fontSize:18, textDecoration:"none" }}>in</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color:"var(--text2)", fontSize:18, textDecoration:"none" }}>📸</a>
        </span>
      </div>
    </footer>
  );
}

/* ─── CHATBOT ────────────────────────────────────────────────── */
const SUGGESTIONS = ["What's in the Pro plan?", "كيف تشتغل؟", "Do I need a company?", "Stripe payments?"];
const INIT_MSG = { role:"bot", text:"Hey! 👋 I'm Fatūra's assistant. Ask me anything about features, pricing, or how to get started.", time: timeStr() };

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([INIT_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role:"user", text: text.trim(), time: timeStr() };
    setMsgs(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...msgs.filter(m => m.role !== "bot" || m !== INIT_MSG), userMsg]
        .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response. Please try again.";
      setMsgs(m => [...m, { role: "bot", text: reply, time: timeStr() }]);
    } catch {
      setMsgs(m => [...m, { role:"bot", text:"Something went wrong. Please try again in a moment.", time: timeStr() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <>
      {open && (
        <div className="chat-window">
          <div className="chat-head">
            <div className="chat-head-avatar">F</div>
            <div className="chat-head-info">
              <div className="chat-head-name">Fatūra Assistant</div>
              <div className="chat-head-status"><span className="chat-head-dot" />Online · Replies instantly</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="chat-bubble">{m.text}</div>
                <div className="chat-time">{m.time}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <div className="chat-typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {msgs.length <= 2 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <div key={i} className="chat-sug" onClick={() => send(s)}>{s}</div>
              ))}
            </div>
          )}
          <div className="chat-input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything..."
              rows={1}
            />
            <button className="chat-send" onClick={() => send(input)} disabled={loading || !input.trim()}>
              {loading ? <span style={{ width:14,height:14,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite" }} /> : "↑"}
            </button>
          </div>
        </div>
      )}
      <button className="chat-btn" onClick={() => setOpen(o => !o)} title="Chat with us">
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}

export default function LandingPage({ onOpenApp, onSignIn }) {
  return (
    <>
      <style>{FONTS + GLOBAL}</style>
      <NavBar onOpenApp={onOpenApp} onSignIn={onSignIn} />
      <Hero onOpenApp={onOpenApp} />
      <Features />
      <InstallApp />
      <HowItWorks onOpenApp={onOpenApp} />
      <Pricing onOpenApp={onOpenApp} />
      <Testimonials />
      <FAQ />
      <CTASection onOpenApp={onOpenApp} />
      <Footer onOpenApp={onOpenApp} />
      <Chatbot />
    </>
  );
}