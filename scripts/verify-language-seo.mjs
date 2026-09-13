import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { JSDOM } = require("jsdom");
const read = (path) => fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
const languages = ["en", "nl", "fr", "es", "ar"];
const origin = "https://faturapro.app";
const paths = { en: "/", nl: "/nl", fr: "/fr", es: "/es", ar: "/ar" };
for (const lang of languages.slice(1)) {
  const document = new JSDOM(read("public/" + lang + ".html")).window.document;
  assert.equal(document.documentElement.lang, lang);
  assert.equal(document.querySelector('link[rel="canonical"]').href, origin + paths[lang]);
  for (const alternate of languages) {
    assert.equal(document.querySelector('link[hreflang="' + alternate + '"]').href, origin + paths[alternate]);
    assert.equal(document.querySelector('.language-links a[hreflang="' + alternate + '"]').getAttribute("href"), paths[alternate]);
  }
  assert.equal(document.querySelectorAll("h1").length, 1);
  assert.equal(document.querySelectorAll(".language-links a").length, 5);
  assert.equal(document.querySelectorAll(".language-links [aria-current='page']").length, 1);
  assert.equal([...document.querySelectorAll(".tax-note,.plan-tax-note")].filter(x => x.textContent === "excl. btw").length, 2);
  assert.equal(document.querySelectorAll(".plan").length, 3);
  for (const plan of document.querySelectorAll(".plan")) assert.ok(plan.querySelectorAll("li").length >= 5);
  for (const schema of document.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(schema.textContent);
}
const guidePath = "/ar/invoicing-netherlands-germany-belgium";
const guide = new JSDOM(read("public/ar-invoicing-europe.html")).window.document;
assert.equal(guide.documentElement.dir, "rtl");
assert.equal(guide.querySelector('link[rel="canonical"]').href, origin + guidePath);
assert.ok(guide.querySelectorAll("article h2").length >= 6);
assert.equal(guide.querySelectorAll(".language-links a").length, 5);
JSON.parse(guide.querySelector('script[type="application/ld+json"]').textContent);
const routes = JSON.parse(read("vercel.json"));
assert.ok(routes.rewrites.some(r => r.source === guidePath && r.destination === "/ar-invoicing-europe.html"));
const sitemap = new JSDOM(read("public/sitemap.xml"), { contentType: "application/xml" }).window.document;
assert.equal([...sitemap.querySelectorAll("loc")].filter(x => x.textContent === origin + guidePath).length, 1);
for (const link of guide.querySelectorAll('a[href^="#"]')) assert.ok(guide.getElementById(link.hash.slice(1)));
const app = read("src/pages/InvoiceApp.jsx");
const reminder = app.slice(app.indexOf("function ReminderModal("));
const expression = reminder.slice(reminder.indexOf("const TEMPLATES = ") + "const TEMPLATES = ".length, reminder.indexOf(";\n  const getBody"));
const templates = vm.runInNewContext("(" + expression + ")", {
  invoice: { client: "Test Client", id: "INV-TEST", amount: 75, due: "2026-09-01", sellerName: "Test Studio" },
  daysOverdue: 11, formatDate: () => "01/09/2026", f: (n) => "EUR " + n,
});
assert.deepEqual(Object.keys(templates).sort(), [...languages].sort());
for (const lang of languages) for (const tone of ["polite", "firm", "final"]) {
  for (const channel of ["bodies", "wa", "subjects"]) {
    const message = templates[lang][channel][tone];
    assert.ok(message.includes("INV-TEST"), lang + "/" + tone + "/" + channel);
    assert.ok(!/undefined|NaN/.test(message));
  }
  assert.ok(templates[lang].bodies[tone].includes("EUR 75"));
}
const locale = vm.runInNewContext(read("src/lib/locale.js").replaceAll("export ", "") + "\n({ SUPPORTED_LOCALES, tr })", {});
assert.deepEqual(Array.from(locale.SUPPORTED_LOCALES).sort(), [...languages].sort());
for (const lang of ["ar", "nl", "fr", "es"]) {
  for (const key of ["language", "payment_reminder", "polite", "firm", "final", "open_mail", "open_whatsapp"]) {
    assert.notEqual(locale.tr(key, "__MISSING__", lang), "__MISSING__", lang + ":" + key);
  }
}
console.log("PASS: 5 language choices, localized plan lists, SEO route/schema/sitemap, 45 reminder texts and reminder controls.");
