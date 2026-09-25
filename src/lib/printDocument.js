// Print only one document (an invoice, a credit note or a quote) and nothing else.
//
// Everything that is not the document or one of its ancestors is removed from the
// print layout (display:none, so it takes no space and cannot push the document onto
// a second, empty page). The ancestors lose their screen sizing (min-height: 100vh,
// fixed/absolute positioning, padding) so the page is exactly as tall as the document.
//
// The page margin is 0: browsers then leave out their own header and footer (the
// page URL, the date and "1/2"). The document's own padding gives the white margin.
export function printOnlyCss(selector, padding = "12mm 14mm") {
  return `
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body, #root { height: auto !important; min-height: 0 !important; max-height: none !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; background: #fff !important; }
  body *:not(:has(${selector})):not(${selector}):not(${selector} *) { display: none !important; }
  body *:has(${selector}) { display: block !important; position: static !important; inset: auto !important; transform: none !important; margin: 0 !important; padding: 0 !important; width: auto !important; max-width: none !important; height: auto !important; min-height: 0 !important; max-height: none !important; overflow: visible !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: #fff !important; backdrop-filter: none !important; }
  ${selector} { margin: 0 auto !important; padding: ${padding} !important; max-width: 210mm !important; box-shadow: none !important; border: 0 !important; border-radius: 0 !important; background: #fff !important; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}`;
}

// Prints with a clear file name for "Save as PDF" (for example "Factuur-INV-001"),
// then puts the page title back.
export function printWithTitle(title) {
  const previous = document.title;
  if (title) document.title = String(title).replace(/[\\/:*?"<>|]+/g, "-");
  window.print();
  window.setTimeout(() => { document.title = previous; }, 800);
}
