#!/usr/bin/env bash
# ============================================================
#  Fatura Pro - make the pricing page match reality on PDF export
#   - Free plan now shows "PDF export & print" WITH a checkmark
#   - free list gains a real locked item: client card payments
#   - PDF feature card loses its PRO badge (it is on every plan)
#   - landing chatbot prompt + signup plan chooser updated
#  Safe to run twice. Creates .backup copies.
# ============================================================
set -e

if [ ! -f package.json ] || [ ! -f src/pages/Landing.jsx ]; then
  echo "ERROR: run this from the fatura-pro project root (where package.json is)."
  exit 1
fi

if grep -q 'text:"PDF export & print", ok:true' src/pages/Landing.jsx && grep -q "PDF export · free forever" src/pages/Login.jsx; then
  echo "Already applied - nothing to do."
  exit 0
fi

echo "-> backing up"
cp src/pages/Landing.jsx src/pages/Landing.jsx.backup2
cp src/pages/Login.jsx src/pages/Login.jsx.backup2

echo "-> rewriting the Free plan feature list"
awk '/\{ text:"Payment reminders", ok:false \},/ && !d {
  print "      { text:\"PDF export & print\", ok:true },";
  print "      { text:\"Payment reminders (Email + WhatsApp)\", ok:false },";
  print "      { text:\"Unlimited invoices & clients\", ok:false },";
  print "      { text:\"Client card payments (Stripe)\", ok:false },";
  print "      { text:\"Priority support\", ok:false },";
  d=1; skip=3; next }
skip>0 { skip--; next } {print}' src/pages/Landing.jsx > src/pages/Landing.tmp && mv src/pages/Landing.tmp src/pages/Landing.jsx

echo "-> relabelling PDF on the Pro card"
awk -v old='{ text:"PDF export", ok:true },' -v new='{ text:"PDF export & print", ok:true },' '{ if(!d){i=index($0,old); if(i>0){$0=substr($0,1,i-1) new substr($0,i+length(old)); d=1}} print }' src/pages/Landing.jsx > src/pages/Landing.tmp && mv src/pages/Landing.tmp src/pages/Landing.jsx

echo "-> removing the PRO badge from the PDF feature card"
awk -v old='desc:"Generate print-ready, pixel-perfect invoices in PDF format. Share directly with clients or store for accounting.", pro:true },' -v new='desc:"Generate print-ready, pixel-perfect invoices in PDF format. Included on every plan, including Free. Share directly with clients or store for accounting.", pro:false },' '{ if(!d){i=index($0,old); if(i>0){$0=substr($0,1,i-1) new substr($0,i+length(old)); d=1}} print }' src/pages/Landing.jsx > src/pages/Landing.tmp && mv src/pages/Landing.tmp src/pages/Landing.jsx

echo "-> updating the landing chatbot knowledge"
awk -v old='- Free plan: 20 invoices and 5 clients, free forever, no credit card needed' -v new='- Free plan: 20 invoices and 5 clients, PDF export and print included, free forever, no credit card needed' '{ if(!d){i=index($0,old); if(i>0){$0=substr($0,1,i-1) new substr($0,i+length(old)); d=1}} print }' src/pages/Landing.jsx > src/pages/Landing.tmp && mv src/pages/Landing.tmp src/pages/Landing.jsx

echo "-> updating the signup plan chooser"
awk -v old='desc:"20 invoices · 5 clients · free forever"' -v new='desc:"20 invoices · 5 clients · PDF export · free forever"' '{ if(!d){i=index($0,old); if(i>0){$0=substr($0,1,i-1) new substr($0,i+length(old)); d=1}} print }' src/pages/Login.jsx > src/pages/Login.tmp && mv src/pages/Login.tmp src/pages/Login.jsx

echo
echo "-> verification"
grep -q 'text:"PDF export & print", ok:true' src/pages/Landing.jsx   && echo "   OK  Free card shows PDF with a checkmark"
grep -q 'Client card payments (Stripe)' src/pages/Landing.jsx        && echo "   OK  new locked item added"
grep -q 'Included on every plan' src/pages/Landing.jsx               && echo "   OK  PRO badge removed from the PDF card"
grep -q 'PDF export and print included' src/pages/Landing.jsx        && echo "   OK  chatbot prompt updated"
grep -q 'PDF export · free forever' src/pages/Login.jsx              && echo "   OK  signup plan chooser updated"

echo
echo "DONE. Run this AFTER enable-generator-pdf.sh, then:"
echo "  npm start   -> check the pricing section on the home page"
echo "  git add -A && git commit -m \"Pricing: PDF export included on the free plan\" && git push"
