// Pre-renders the English homepage (src/pages/Landing.jsx) into build/index.html,
// so crawlers that do not run JavaScript see the real content instead of an
// empty <div id="root">. Runs after `react-scripts build` (see package.json).
//
// What it writes:
//   build/app-shell.html  the untouched CRA page; every app route (/app, /login,
//                         /blog/...) is rewritten to it in vercel.json
//   build/index.html      the same page with the rendered homepage inside #root
//
// Visitors with JavaScript see no difference: a one-line script hides the
// pre-rendered copy until React replaces it (React's createRoot clears #root).
// Without JavaScript the copy is shown, without the "js" class, so no element
// waits for a scroll animation that will never run.
//
// Only uses packages that react-scripts already installs (@babel/core and its
// presets, react-dom/server). No Python, no browser, no temp files.
import fs from "fs";
import path from "path";
import Module, { createRequire } from "module";

const root = process.cwd();
const buildDir = path.join(root, "build");
const srcDir = path.join(root, "src");
const indexPath = path.join(buildDir, "index.html");
const shellPath = path.join(buildDir, "app-shell.html");
const require = createRequire(path.join(root, "package.json"));

if (!fs.existsSync(indexPath)) {
  console.error("prerender-home: build/index.html not found - run react-scripts build first");
  process.exit(1);
}

// 1) Keep the original page for all app routes. This happens first and always,
//    so the app keeps working even if the rendering step below fails.
const original = fs.readFileSync(indexPath, "utf8");
const alreadyDone = original.includes('data-prerender="home"');
const shell = alreadyDone ? fs.readFileSync(shellPath, "utf8") : original;
fs.writeFileSync(shellPath, shell);

// 2) Let Node load the React source: JSX/ESM through Babel, CSS ignored, and the
//    Supabase client and analytics replaced by stubs (they would try to connect).
const babel = require("@babel/core");
const presets = [
  [require.resolve("@babel/preset-env"), { targets: { node: "current" }, modules: "commonjs" }],
  [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
];
const stubs = {
  [path.join(srcDir, "supabase.js")]: { supabase: {} },
};
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
  if (request === "@vercel/analytics") return { track() {} };
  return originalLoad.call(this, request, parent, isMain);
};

let markup;
try {
  const React = require("react");
  const { renderToString } = require("react-dom/server");
  const Landing = require(path.join(srcDir, "pages", "Landing.jsx")).default;
  const noop = () => {};
  markup = renderToString(React.createElement(Landing, { onOpenApp: noop, onSignIn: noop }));
} catch (error) {
  console.error("prerender-home: rendering failed, homepage stays client-rendered:", error && error.message);
  fs.writeFileSync(indexPath, shell);
  process.exit(0);
}

// Without JavaScript nothing starts the reveal animations, so show everything.
markup = markup.replace('class="lv2 js"', 'class="lv2"');

// 3) Put the rendered page in #root, hidden only when JavaScript runs. If the app
//    crashes before React has replaced it, show the pre-rendered page instead of
//    leaving the visitor with a blank screen.
const bootHead = '<script>(function(d){d.documentElement.classList.add("prerender-boot");'
  + 'window.addEventListener("error",function(){if(d.querySelector("#root>[data-prerender]"))d.documentElement.classList.remove("prerender-boot")})})(document)</script>'
  + '<style>.prerender-boot #root>[data-prerender]{visibility:hidden}</style>';
if (!shell.includes('<div id="root"></div>') || !shell.includes("</head>")) {
  console.error("prerender-home: unexpected index.html layout, homepage stays client-rendered");
  fs.writeFileSync(indexPath, shell);
  process.exit(0);
}
const page = shell
  .replace("</head>", '<link data-prerender-head rel="canonical" href="https://faturapro.app/"/>' + bootHead + "</head>")
  .replace('<div id="root"></div>', '<div id="root"><div data-prerender="home">' + markup + "</div></div>");
fs.writeFileSync(indexPath, page);

const text = markup.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
console.log("prerender-home: homepage pre-rendered (" + Math.round(markup.length / 1024) + " KB HTML, " + text.split(" ").length + " words); app routes use app-shell.html");
