const DEFAULT_IMAGE = "https://faturapro.app/hero-dashboard.png";

function setMeta(selector, attributes, cleanups) {
  let node = document.head.querySelector(selector);
  const created = !node;
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }

  const previous = {};
  Object.entries(attributes).forEach(([name, value]) => {
    previous[name] = node.getAttribute(name);
    node.setAttribute(name, value);
  });

  cleanups.push(() => {
    if (created) {
      node.remove();
      return;
    }
    Object.entries(previous).forEach(([name, value]) => {
      if (value == null) node.removeAttribute(name);
      else node.setAttribute(name, value);
    });
  });
}

function setCanonical(href, cleanups) {
  let node = document.head.querySelector('link[rel="canonical"]');
  const created = !node;
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    document.head.appendChild(node);
  }
  const previous = node.getAttribute("href");
  node.setAttribute("href", href);
  cleanups.push(() => {
    if (created) node.remove();
    else if (previous == null) node.removeAttribute("href");
    else node.setAttribute("href", previous);
  });
}

function setAlternates(alternates, cleanups) {
  const previous = Array.from(document.head.querySelectorAll('link[rel="alternate"][hreflang]'))
    .map((node) => node.cloneNode(true));
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((node) => node.remove());

  Object.entries(alternates || {}).forEach(([language, href]) => {
    const node = document.createElement("link");
    node.setAttribute("rel", "alternate");
    node.setAttribute("hreflang", language);
    node.setAttribute("href", href);
    node.setAttribute("data-page-seo", "true");
    document.head.appendChild(node);
  });

  cleanups.push(() => {
    document.head.querySelectorAll('link[data-page-seo="true"]').forEach((node) => node.remove());
    previous.forEach((node) => document.head.appendChild(node));
  });
}

export function applyPageSeo({
  title,
  description,
  canonical,
  language = "en",
  locale = "en_US",
  type = "website",
  image = DEFAULT_IMAGE,
  imageAlt = "Fatūra Pro invoicing dashboard",
  alternates,
}) {
  const cleanups = [];
  const previousTitle = document.title;
  const previousLanguage = document.documentElement.getAttribute("lang");

  document.title = title;
  document.documentElement.setAttribute("lang", language);
  cleanups.push(() => {
    document.title = previousTitle;
    if (previousLanguage == null) document.documentElement.removeAttribute("lang");
    else document.documentElement.setAttribute("lang", previousLanguage);
  });

  setMeta('meta[name="description"]', { name: "description", content: description }, cleanups);
  setMeta('meta[name="robots"]', { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" }, cleanups);
  setMeta('meta[property="og:title"]', { property: "og:title", content: title }, cleanups);
  setMeta('meta[property="og:description"]', { property: "og:description", content: description }, cleanups);
  setMeta('meta[property="og:type"]', { property: "og:type", content: type }, cleanups);
  setMeta('meta[property="og:url"]', { property: "og:url", content: canonical }, cleanups);
  setMeta('meta[property="og:image"]', { property: "og:image", content: image }, cleanups);
  setMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: imageAlt }, cleanups);
  setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Fatūra Pro" }, cleanups);
  setMeta('meta[property="og:locale"]', { property: "og:locale", content: locale }, cleanups);
  setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" }, cleanups);
  setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title }, cleanups);
  setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description }, cleanups);
  setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image }, cleanups);
  setCanonical(canonical, cleanups);
  setAlternates(alternates || { [language]: canonical, "x-default": canonical }, cleanups);

  return () => cleanups.reverse().forEach((cleanup) => cleanup());
}
