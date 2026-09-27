(function () {
  if (!window.va) {
    window.va = function () {
      window.vaq = window.vaq || [];
      window.vaq.push(Array.prototype.slice.call(arguments));
    };
  }

  // The site owner's own browser is not counted (same rule as src/lib/ownVisits.js):
  // ?analytics=off marks this browser, ?analytics=on removes the mark.
  function ownBrowser() {
    try {
      var value = new URLSearchParams(window.location.search).get("analytics");
      if (value === "off") localStorage.setItem("va-disable", "1");
      if (value === "on") localStorage.removeItem("va-disable");
      return !!localStorage.getItem("va-disable");
    } catch (_) { return false; }
  }
  var own = ownBrowser();
  window.va("beforeSend", function (event) { return own ? null : event; });

  if (!document.head.querySelector('script[src*="/_vercel/insights/script.js"]')) {
    var analytics = document.createElement("script");
    analytics.src = "/_vercel/insights/script.js";
    analytics.defer = true;
    analytics.dataset.sdkn = "@vercel/analytics";
    analytics.dataset.sdkv = "2.0.1";
    document.head.appendChild(analytics);
  }

  function send(name, data) {
    if (own) return;
    try {
      window.va("event", { name: name, data: data });
    } catch (_) {}
  }

  function ready() {
    var page = document.body.dataset.seoPage || window.location.pathname;
    var language = document.body.dataset.seoLanguage || document.documentElement.lang || "en";
    send("seo_page_viewed", { page: page, language: language });

    document.addEventListener("click", function (event) {
      var target = event.target.closest('[data-track],a[href^="/login"],a[href^="/register"]');
      if (!target) return;
      send(target.dataset.track || "seo_cta_clicked", {
        page: page,
        language: language,
        placement: target.dataset.placement || "unknown",
        destination: target.dataset.destination || target.getAttribute("href") || "unknown",
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
