#!/usr/bin/env bash
# ============================================================
#  Fatura Pro - show "Custom logo & branding" on the Free plan
#  Logo upload is not gated in the code, so the free card now
#  says so. Business still sells the removal of the Fatura
#  footer, which is the real branding upsell.
#  Run AFTER fix-pricing-pdf.sh. Safe to run twice.
# ============================================================
set -e

if [ ! -f package.json ] || [ ! -f src/pages/Landing.jsx ]; then
  echo "ERROR: run this from the fatura-pro project root (where package.json is)."
  exit 1
fi

if ! grep -q 'text:"PDF export & print", ok:true' src/pages/Landing.jsx; then
  echo "ERROR: run fix-pricing-pdf.sh first - this script builds on it."
  exit 1
fi

# only the FIRST PDF line belongs to the Free card
if awk 'BEGIN{c=0} /text:"PDF export & print", ok:true/ { c++; if (c==1) { getline nxt; if (nxt ~ /Custom logo & branding/) found=1 } } END{ exit !found }' src/pages/Landing.jsx; then
  echo "Already applied - nothing to do."
  exit 0
fi

echo "-> backing up src/pages/Landing.jsx"
cp src/pages/Landing.jsx src/pages/Landing.jsx.backup3

echo "-> adding the logo line to the Free plan"
awk '/\{ text:"PDF export & print", ok:true \},/ && !d { print; print "      { text:\"Custom logo & branding\", ok:true },"; d=1; next } {print}' src/pages/Landing.jsx > src/pages/Landing.tmp && mv src/pages/Landing.tmp src/pages/Landing.jsx

echo
echo "-> verification"
awk 'BEGIN{c=0} /text:"PDF export & print", ok:true/ { c++; if (c==1) { getline nxt; if (nxt ~ /Custom logo & branding/) print "   OK  Free plan now lists the logo with a checkmark" } }' src/pages/Landing.jsx

echo
echo "DONE."
echo "  npm start   -> check the Free card in the pricing section"
echo "  git add -A && git commit -m \"Pricing: logo and branding included on the free plan\" && git push"
