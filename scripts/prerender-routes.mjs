// Pre-renders the public React pages (blog, guides, legal, generator) into their
// own HTML files, so crawlers that do not run JavaScript get each page's real
// title, description, canonical, hreflang, structured data and text instead of
// the homepage's metadata and an empty <div id="root">. Runs after
// prerender-home.mjs (see package.json).
//
// Which pages: every rewrite in vercel.json whose destination starts with /p/.
// Each one is written to build/<destination> from build/app-shell.html.
//
// Safety:
//   - Every destination is first written as a plain copy of app-shell.html, so a
//     route can never 404 even if rendering fails; a page that fails to render
//     simply stays client-rendered, as before.
//   - The page is rendered in jsdom with the real components, so the metadata is
//     exactly what applyPageSeo sets in the browser.
//   - Head tags added here carry data-prerender-head and are removed by
//     src/index.js before React starts, so the page adds them once, as before.
//     A base schema the page suspends is written as type="text/plain" with
//     data-prerender-suspended, and src/index.js turns it back on.
//   - The rendered body sits in #root hidden until React replaces it (the same
//     boot script as the homepage), and is shown if the app crashes first.
//   - The build never fails because of this script: it always exits 0.
import fs from "fs";
import path from "path";
import Module, { createRequire } from "module";

const root = process.cwd();
const buildDir = path.join(root, "build");
const srcDir = path.join(root, "src");
const shellPath = path.join(buildDir, "app-shell.html");
const require = createRequire(path.join(root, "package.json"));
const SITE = "https://faturapro.app";

function done(message) {
  console.log("prerender-routes: " + message);
  process.exit(0);
}
process.on("uncaughtException", (error) => done("stopped, pages stay client-rendered: " + (error && error.message)));
process.on("unhandledRejection", (error) => done("stopped, pages stay client-rendered: " + (error && error.message)));

if (!fs.existsSync(shellPath)) done("build/app-shell.html not found, nothing to do");
const shell = fs.readFileSync(shellPath, "utf8");
if (!shell.includes('<div id="root"></div>') || !shell.includes("</head>")) done("unexpected app-shell.html layout, nothing to do");

const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const routes = (vercel.rewrites || [])
  .filter((rewrite) => rewrite.destination.startsWith("/p/") && !rewrite.source.includes(":"))
  .map((rewrite) => ({ route: rewrite.source, file: path.join(buildDir, rewrite.destination) }));

// 1) Every destination exists before anything else can go wrong.
for (const { file } of routes) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, shell);
}

// 2) A browser-like environment, created before React DOM is loaded.
const { JSDOM } = require("jsdom");
const dom = new JSDOM(shell, { url: SITE + "/", pretendToBeVisual: true });
const { window } = dom;
const globals = ["window", "document", "navigator", "location", "localStorage", "sessionStorage", "HTMLElement", "Element", "Node", "Event", "CustomEvent", "KeyboardEvent", "MouseEvent", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "DOMParser", "MutationObserver"];
for (const name of globals) {
  try { Object.defineProperty(globalThis, name, { value: window[name], configurable: true, writable: true }); } catch (e) {}
}
class NoopObserver { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
window.IntersectionObserver = globalThis.IntersectionObserver = NoopObserver;
window.ResizeObserver = globalThis.ResizeObserver = NoopObserver;
window.matchMedia = () => ({ matches: false, media: "", addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
window.scrollTo = () => {};
window.fetch = globalThis.fetch = () => new Promise(() => {});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const quiet = console.error;
console.error = () => {};

// 3) Load the React source like prerender-home.mjs: Babel for JSX, CSS ignored,
//    Supabase and analytics stubbed.
const babel = require("@babel/core");
const presets = [
  [require.resolve("@babel/preset-env"), { targets: { node: "current" }, modules: "commonjs" }],
  [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
];
const stubs = { [path.join(srcDir, "supabase.js")]: { supabase: {} } };
const defaultJs = Module._extensions[".js"];
const compile = (module, filename) => {
  if (stubs[filename]) { module.exports = stubs[filename]; return; }
  if (!filename.startsWith(srcDir)) return defaultJs(module, filename);
  const { code } = babel.transformSync(fs.readFileSync(filename, "utf8"), { filename, presets, babelrc: false, configFile: false });
  module._compile(code, filename);
};
Module._extensions[".js"] = compile;
Module._extensions[".jsx"] = compile;
Module._extensions[".css"] = (module) => { module.exports = {}; };
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "@vercel/analytics" || request === "@vercel/analytics/react") return { track() {}, Analytics: () => null };
  return originalLoad.call(this, request, parent, isMain);
};

const React = require("react");
const { createRoot } = require("react-dom/client");
const { MemoryRouter, Routes, Route } = require("react-router-dom");
const page = (name) => require(path.join(srcDir, "pages", name));
const Legal = page("Legal.jsx").default;
const { BlogIndex, BlogPost } = page("Blog.jsx");
const pages = {
  "/privacy": () => React.createElement(Legal, { page: "privacy" }),
  "/terms": () => React.createElement(Legal, { page: "terms" }),
  "/ambassador-terms": () => React.createElement(Legal, { page: "ambassador-terms" }),
  "/blog": () => React.createElement(BlogIndex),
  "/blog/:slug": () => React.createElement(BlogPost),
  "/api-docs": () => React.createElement(page("ApiDocs.jsx").default),
  "/late-payment-scripts": () => React.createElement(page("LatePaymentScripts.jsx").default),
  "/ambassadors": () => React.createElement(page("Ambassadors.jsx").default),
  "/invoice-generator": () => React.createElement(page("InvoiceGenerator.jsx").default),
  "/nl/factuur-maken": () => React.createElement(page("InvoiceGenerator.jsx").default, { lang: "nl" }),
};

const escapeAttr = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escapeText = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const bootHead = '<script>(function(d){d.documentElement.classList.add("prerender-boot");'
  + 'window.addEventListener("error",function(){if(d.querySelector("#root>[data-prerender]"))d.documentElement.classList.remove("prerender-boot")})})(document)</script>'
  + '<style>.prerender-boot #root>[data-prerender]{visibility:hidden}</style>';
const shellDoc = new JSDOM(shell).window.document;
const shellMeta = new Map([...shellDoc.head.querySelectorAll("meta[name],meta[property]")]
  .map((node) => [node.getAttribute("name") ? "name=" + node.getAttribute("name") : "property=" + node.getAttribute("property"), node.getAttribute("content")]));
const shellScripts = new Set([...shellDoc.head.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.id || node.textContent));

function renderRoute(route) {
  window.document.head.innerHTML = shellDoc.head.innerHTML;
  window.document.documentElement.setAttribute("lang", "en");
  window.document.documentElement.removeAttribute("dir");
  window.document.documentElement.removeAttribute("data-page-language");
  window.history.replaceState(null, "", route);
  const container = window.document.getElementById("root");
  container.innerHTML = "";
  const pattern = Object.keys(pages).find((key) => key === route) || (route.startsWith("/blog/") ? "/blog/:slug" : null);
  if (!pattern) throw new Error("no page for " + route);
  const app = createRoot(container);
  React.act(() => {
    app.render(React.createElement(MemoryRouter, { initialEntries: [route] },
      React.createElement(Routes, null, React.createElement(Route, { path: pattern, element: pages[pattern]() }))));
  });
  const head = window.document.head;
  const html = window.document.documentElement;
  const result = {
    markup: container.innerHTML,
    title: window.document.title,
    lang: html.getAttribute("lang") || "en",
    dir: html.getAttribute("dir"),
    meta: [...head.querySelectorAll("meta[name],meta[property]")].map((node) => ({
      key: node.getAttribute("name") ? "name=" + node.getAttribute("name") : "property=" + node.getAttribute("property"),
      attr: node.getAttribute("name") ? "name" : "property",
      name: node.getAttribute("name") || node.getAttribute("property"),
      content: node.getAttribute("content") || "",
    })),
    canonical: head.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    alternates: [...head.querySelectorAll('link[rel="alternate"][hreflang]')].map((node) => [node.getAttribute("hreflang"), node.getAttribute("href")]),
    schemas: [...head.querySelectorAll('script[type="application/ld+json"]')].filter((node) => !shellScripts.has(node.id || node.textContent)).map((node) => ({ id: node.id, text: node.textContent })),
    siteSchemaSuspended: !head.querySelector("#site-schema"),
  };
  React.act(() => app.unmount());
  return result;
}

function buildPage(route, r) {
  if (!r.title || !r.canonical || r.canonical !== SITE + route) throw new Error("unexpected canonical " + r.canonical);
  if (r.markup.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length < 50) throw new Error("rendered page is almost empty");
  let html = shell;
  html = html.replace(/<html lang="[^"]*"/, '<html lang="' + escapeAttr(r.lang) + '"' + (r.dir === "rtl" ? ' dir="rtl"' : ""));
  html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + escapeText(r.title) + "</title>");
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>/g, "");
  const added = [];
  for (const m of r.meta) {
    if (shellMeta.get(m.key) === m.content) continue;
    const pattern = new RegExp('<meta ' + m.attr + '="' + m.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '" content="[^"]*"\\s*/?>');
    const tag = '<meta ' + m.attr + '="' + escapeAttr(m.name) + '" content="' + escapeAttr(m.content) + '"/>';
    if (shellMeta.has(m.key) && pattern.test(html)) html = html.replace(pattern, tag);
    else added.push(tag.replace("<meta ", "<meta data-prerender-head "));
  }
  added.push('<link data-prerender-head rel="canonical" href="' + escapeAttr(r.canonical) + '"/>');
  for (const [language, href] of r.alternates) added.push('<link data-prerender-head rel="alternate" hreflang="' + escapeAttr(language) + '" href="' + escapeAttr(href) + '"/>');
  for (const s of r.schemas) added.push('<script data-prerender-head type="application/ld+json"' + (s.id ? ' id="' + escapeAttr(s.id) + '"' : "") + ">" + s.text.replace(/</g, "\\u003c") + "</script>");
  if (r.siteSchemaSuspended) html = html.replace('<script id="site-schema" type="application/ld+json">', '<script id="site-schema" type="text/plain" data-prerender-suspended>');
  html = html.replace("</head>", added.join("") + bootHead + "</head>");
  html = html.replace('<div id="root"></div>', '<div id="root"><div data-prerender="' + escapeAttr(route) + '">' + r.markup + "</div></div>");
  return html;
}

let ok = 0;
const failed = [];
for (const { route, file } of routes) {
  try {
    fs.writeFileSync(file, buildPage(route, renderRoute(route)));
    ok++;
  } catch (error) {
    fs.writeFileSync(file, shell);
    failed.push(route + " (" + (error && error.message) + ")");
  }
}
console.error = quiet;
done(ok + " of " + routes.length + " pages pre-rendered" + (failed.length ? "; client-rendered: " + failed.join(", ") : ""));
