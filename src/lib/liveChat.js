// Fatura Pro - Live Chat via Crisp (Business plan only)
// يحمّل ويدجت الشات برمجياً فقط لمستخدمي Business

const CRISP_WEBSITE_ID = "599c316f-f49c-4201-a742-3e408381b44a";
let loaded = false;

export function loadLiveChat(userEmail) {
  if (loaded) return; // لا نحمله مرتين
  loaded = true;
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;
  const s = document.createElement("script");
  s.src = "https://client.crisp.chat/l.js";
  s.async = 1;
  document.head.appendChild(s);
  // نمرر إيميل المستخدم للشات عشان تعرفين مين يكلمك
  if (userEmail) window.$crisp.push(["set", "user:email", [userEmail]]);
}
