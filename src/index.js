import ReactDOM from "react-dom/client";
import App from "./App";
import "./theme.css";
import "./index.css";

// Pre-rendered pages (scripts/prerender-routes.mjs) carry their own head tags for
// crawlers; the page adds them again when it renders, so start from the base head.
document.querySelectorAll("[data-prerender-head]").forEach((node) => node.remove());
document.querySelectorAll("script[data-prerender-suspended]").forEach((node) => {
  node.type = "application/ld+json";
  node.removeAttribute("data-prerender-suspended");
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
