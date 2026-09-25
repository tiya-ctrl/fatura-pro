/* Fatūra Pro — shared landing behaviour for the NL / FR / ES pages */
(function () {
  // Campaign parameters are carried into the sign-up links.
  var allowed = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'];
  var incoming = new URLSearchParams(location.search);
  document.querySelectorAll('.js-campaign-link').forEach(function (link) {
    var url = new URL(link.getAttribute('href'), location.origin);
    allowed.forEach(function (key) { if (incoming.get(key)) url.searchParams.set(key, incoming.get(key)); });
    link.setAttribute('href', url.pathname + '?' + url.searchParams.toString());
  });
  document.querySelectorAll('.menu-panel a').forEach(function (link) {
    link.addEventListener('click', function () { var menu = link.closest('details'); if (menu) menu.removeAttribute('open'); });
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal sections and count up numbers when they scroll into view.
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10); if (!end || reduce) return;
    var start = null;
    function step(t) { if (!start) start = t; var p = Math.min((t - start) / 1100, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(e.target);
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  // Header state, reading progress and the 3D dashboard settling as you scroll.
  var nav = document.querySelector('.nav'), bar = document.querySelector('.progress'), shot = document.querySelector('.shot'), ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 12);
    if (bar) bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (shot && !reduce) {
      var k = Math.max(0, 1 - y / 520);
      shot.style.setProperty('--rx', (12 * k).toFixed(2) + 'deg');
      shot.style.setProperty('--ry', (10 * k).toFixed(2) + 'deg');
      shot.style.setProperty('--rz', (-1.5 * k).toFixed(2) + 'deg');
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Feature bubbles around the product shot: one at a time moves to a free spot
  // and shows the next feature from the app.
  var shotEl = document.querySelector('.shot[data-chips]');
  if (shotEl && !reduce) {
    var feats = [];
    try { feats = JSON.parse(shotEl.getAttribute('data-chips') || '[]'); } catch (err) { feats = []; }
    var chipEls = [].slice.call(shotEl.querySelectorAll('.chip'));
    var POS = ['p1', 'p2', 'p3', 'p4', 'p5'], nextFeat = chipEls.length, turn = 0;
    var posOf = function (el) { var m = el.className.match(/\bp\d\b/); return m ? m[0] : 'p1'; };
    if (feats.length > chipEls.length) {
      setInterval(function () {
        if (document.hidden) return;
        var mobile = window.innerWidth <= 720;
        var active = mobile ? chipEls.slice(0, 2) : chipEls;
        var slots = mobile ? ['p1', 'p2', 'p3', 'p4'] : POS;
        var chip = active[turn % active.length]; turn++;
        var used = active.filter(function (x) { return x !== chip; }).map(posOf);
        var free = slots.filter(function (p) { return used.indexOf(p) < 0 && p !== posOf(chip); });
        var pos = free.length ? free[Math.floor(Math.random() * free.length)] : posOf(chip);
        var f = feats[nextFeat % feats.length]; nextFeat++;
        chip.classList.add('out');
        setTimeout(function () {
          POS.forEach(function (p) { chip.classList.remove(p); });
          chip.classList.add(pos);
          chip.querySelector('.dot').textContent = f[0];
          chip.querySelector('.lbl').textContent = f[1];
          chip.classList.remove('out');
        }, 380);
      }, 2400);
    }
  }

  // Sticky call to action on phones: shown after the hero button scrolls away,
  // hidden again when the final call to action is on screen.
  var sticky = document.querySelector('.sticky-cta');
  var heroActions = document.querySelector('.hero .actions');
  var finalCta = document.querySelector('.cta');
  if (sticky && heroActions && 'IntersectionObserver' in window) {
    var heroVisible = true, finalVisible = false;
    var updateSticky = function () {
      var on = !heroVisible && !finalVisible;
      sticky.classList.toggle('show', on);
      sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
      var link = sticky.querySelector('a'); if (link) link.tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; updateSticky(); }).observe(heroActions);
    if (finalCta) new IntersectionObserver(function (en) { finalVisible = en[0].isIntersecting; updateSticky(); }).observe(finalCta);
  }

  // Spotlight that follows the pointer on feature cards.
  document.querySelectorAll('.feature').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Example invoice that switches between the invoice languages the app supports.
  var T = {
    en: { dir: 'ltr', invoice: 'Invoice', paid: 'Paid', description: 'Description', service: 'Website design', subtotal: 'Subtotal', sub: '€1,200.00', vat: 'VAT 21%', vatv: '€252.00', total: 'Total due', totalv: '€1,452.00' },
    nl: { dir: 'ltr', invoice: 'Factuur', paid: 'Betaald', description: 'Omschrijving', service: 'Websiteontwerp', subtotal: 'Subtotaal', sub: '€ 1.200,00', vat: 'Btw 21%', vatv: '€ 252,00', total: 'Te betalen', totalv: '€ 1.452,00' },
    fr: { dir: 'ltr', invoice: 'Facture', paid: 'Payée', description: 'Description', service: 'Conception de site web', subtotal: 'Sous-total', sub: '1 200,00 €', vat: 'TVA 21 %', vatv: '252,00 €', total: 'Total dû', totalv: '1 452,00 €' },
    ar: { dir: 'rtl', invoice: 'فاتورة', paid: 'مدفوعة', description: 'الوصف', service: 'تصميم موقع إلكتروني', subtotal: 'المجموع الفرعي', sub: '1,200.00 €', vat: 'ضريبة القيمة المضافة 21%', vatv: '252.00 €', total: 'المبلغ المستحق', totalv: '1,452.00 €' }
  };
  var demo = document.querySelector('.demo'), body = document.querySelector('.inv-body'), buttons = document.querySelectorAll('.lang-switch button');
  if (!demo || !body) return;
  var order = ['en', 'nl', 'fr', 'ar'], current = Math.max(0, order.indexOf(demo.getAttribute('data-start') || 'en')), timer = null;
  function paint(lang) {
    var t = T[lang];
    body.setAttribute('lang', lang); body.setAttribute('dir', t.dir);
    body.querySelectorAll('[data-k]').forEach(function (el) { var v = t[el.getAttribute('data-k')]; if (v) el.textContent = v; });
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
  }
  function show(lang) {
    if (!T[lang]) return;
    if (reduce) { paint(lang); return; }
    body.classList.add('swap');
    setTimeout(function () { paint(lang); body.classList.remove('swap'); }, 260);
  }
  paint(order[current]);
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { demo.dataset.touched = '1'; stop(); current = order.indexOf(b.getAttribute('data-lang')); show(b.getAttribute('data-lang')); });
  });
  if (!reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !timer && demo.dataset.touched !== '1') {
          timer = setInterval(function () { current = (current + 1) % order.length; show(order[current]); }, 2600);
        } else if (!e.isIntersecting) { stop(); }
      });
    }, { threshold: .4 }).observe(demo);
  }
})();
