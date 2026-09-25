// Motion for the redesigned landing page (same behaviour as public/landing-v2.js,
// scoped to one root element and fully cleaned up when the page unmounts).

const INVOICE_TEXT = {
  en: { dir: "ltr", invoice: "Invoice", paid: "Paid", description: "Description", service: "Website design", subtotal: "Subtotal", sub: "€1,200.00", vat: "VAT 21%", vatv: "€252.00", total: "Total due", totalv: "€1,452.00" },
  nl: { dir: "ltr", invoice: "Factuur", paid: "Betaald", description: "Omschrijving", service: "Websiteontwerp", subtotal: "Subtotaal", sub: "€ 1.200,00", vat: "Btw 21%", vatv: "€ 252,00", total: "Te betalen", totalv: "€ 1.452,00" },
  fr: { dir: "ltr", invoice: "Facture", paid: "Payée", description: "Description", service: "Conception de site web", subtotal: "Sous-total", sub: "1 200,00 €", vat: "TVA 21 %", vatv: "252,00 €", total: "Total dû", totalv: "1 452,00 €" },
  ar: { dir: "rtl", invoice: "فاتورة", paid: "مدفوعة", description: "الوصف", service: "تصميم موقع إلكتروني", subtotal: "المجموع الفرعي", sub: "1,200.00 €", vat: "ضريبة القيمة المضافة 21%", vatv: "252.00 €", total: "المبلغ المستحق", totalv: "1,452.00 €" },
};

export function initLandingMotion(root) {
  if (!root || typeof window === "undefined") return () => {};
  const cleanups = [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal sections and count up numbers when they scroll into view.
  const countUp = (el) => {
    const end = parseInt(el.getAttribute("data-count"), 10);
    if (!end || reduce) return;
    let start = null;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / 1100, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const items = root.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        e.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  // Header state, reading progress and the 3D dashboard settling as you scroll.
  const nav = root.querySelector(".nav"), bar = root.querySelector(".progress"), shot = root.querySelector(".shot");
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle("scrolled", y > 12);
    if (bar) bar.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    if (shot && !reduce) {
      const k = Math.max(0, 1 - y / 520);
      shot.style.setProperty("--rx", (12 * k).toFixed(2) + "deg");
      shot.style.setProperty("--ry", (10 * k).toFixed(2) + "deg");
      shot.style.setProperty("--rz", (-1.5 * k).toFixed(2) + "deg");
    }
    ticking = false;
  };
  const scrollHandler = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener("scroll", scrollHandler, { passive: true });
  cleanups.push(() => window.removeEventListener("scroll", scrollHandler));
  onScroll();

  // Feature bubbles around the product shot: one at a time moves to a free spot
  // and shows the next feature from the app.
  const shotEl = root.querySelector(".shot[data-chips]");
  if (shotEl && !reduce) {
    let feats = [];
    try { feats = JSON.parse(shotEl.getAttribute("data-chips") || "[]"); } catch { feats = []; }
    const chipEls = Array.from(shotEl.querySelectorAll(".chip"));
    const POS = ["p1", "p2", "p3", "p4", "p5"];
    const posOf = (el) => (el.className.match(/\bp\d\b/) || ["p1"])[0];
    let nextFeat = chipEls.length, turn = 0;
    const chipTimeouts = new Set();
    if (feats.length > chipEls.length) {
      const chipTimer = setInterval(() => {
        if (document.hidden) return;
        const mobile = window.innerWidth <= 720;
        const active = mobile ? chipEls.slice(0, 2) : chipEls;
        const slots = mobile ? ["p1", "p2", "p3", "p4"] : POS;
        const chip = active[turn % active.length]; turn += 1;
        const used = active.filter((x) => x !== chip).map(posOf);
        const free = slots.filter((p) => !used.includes(p) && p !== posOf(chip));
        const pos = free.length ? free[Math.floor(Math.random() * free.length)] : posOf(chip);
        const f = feats[nextFeat % feats.length]; nextFeat += 1;
        chip.classList.add("out");
        const id = setTimeout(() => {
          chipTimeouts.delete(id);
          POS.forEach((p) => chip.classList.remove(p));
          chip.classList.add(pos);
          chip.querySelector(".dot").textContent = f[0];
          chip.querySelector(".lbl").textContent = f[1];
          chip.classList.remove("out");
        }, 380);
        chipTimeouts.add(id);
      }, 2400);
      cleanups.push(() => { clearInterval(chipTimer); chipTimeouts.forEach(clearTimeout); });
    }
  }

  // Spotlight that follows the pointer on feature cards.
  root.querySelectorAll(".feature").forEach((card) => {
    const move = (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    };
    card.addEventListener("pointermove", move);
    cleanups.push(() => card.removeEventListener("pointermove", move));
  });

  // Example invoice that switches between the invoice languages the app supports.
  const demo = root.querySelector(".demo"), body = root.querySelector(".inv-body");
  if (demo && body) {
    const buttons = demo.querySelectorAll(".lang-switch button");
    const order = ["en", "nl", "fr", "ar"];
    let current = Math.max(0, order.indexOf(demo.getAttribute("data-start") || "en"));
    let timer = null, swapTimeout = null, touched = false;
    const paint = (lang) => {
      const t = INVOICE_TEXT[lang];
      body.setAttribute("lang", lang); body.setAttribute("dir", t.dir);
      body.querySelectorAll("[data-k]").forEach((el) => { const v = t[el.getAttribute("data-k")]; if (v) el.textContent = v; });
      buttons.forEach((b) => b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false"));
    };
    const show = (lang) => {
      if (!INVOICE_TEXT[lang]) return;
      if (reduce) { paint(lang); return; }
      body.classList.add("swap");
      swapTimeout = setTimeout(() => { paint(lang); body.classList.remove("swap"); }, 260);
    };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    paint(order[current]);
    buttons.forEach((b) => {
      const click = () => { touched = true; stop(); current = order.indexOf(b.getAttribute("data-lang")); show(b.getAttribute("data-lang")); };
      b.addEventListener("click", click);
      cleanups.push(() => b.removeEventListener("click", click));
    });
    if (!reduce && "IntersectionObserver" in window) {
      const demoObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !timer && !touched) timer = setInterval(() => { current = (current + 1) % order.length; show(order[current]); }, 2600);
          else if (!e.isIntersecting) stop();
        });
      }, { threshold: 0.4 });
      demoObserver.observe(demo);
      cleanups.push(() => demoObserver.disconnect());
    }
    cleanups.push(() => { stop(); if (swapTimeout) clearTimeout(swapTimeout); });
  }

  return () => cleanups.forEach((fn) => fn());
}
