# Payments paused (October 2026)

No payment provider is connected (Stripe closed the account until the business is
registered). Two flags in `src/lib/businessPlan.js` control the app:

- `PAYMENTS_PAUSED = true`: paid checkout shows "Online payment available soon";
  "Connect Stripe" is hidden; the Stripe feature lines on the English landing page,
  the upgrade window and the assistant prompt are hidden.
- `ADVANCED_TRIAL_NO_CARD = true`: the Advanced trial starts without a card.

## When payments are back

1. Set both flags to `false` (or keep the no-card trial if wanted).
2. Remove the "TEMPORARY, IMPORTANT" paragraph in `src/lib/chatPrompts.js` and restore the
   "card required through Stripe" sentence in the first PLANS block.
3. Put these lines back in the static pages (removed by hand):

| File | Hero chip (data attribute) | Advanced plan list item |
|---|---|---|
| public/nl.html | `[&quot;€&quot;, &quot;Online betalen via Stripe&quot;]` | `<li>Online betalen via Stripe</li>` (after "Tot 5 teamleden…") |
| public/fr.html | `[&quot;€&quot;, &quot;Paiement en ligne via Stripe&quot;]` | `<li>Paiement en ligne via Stripe</li>` |
| public/es.html | `[&quot;€&quot;, &quot;Cobro online con Stripe&quot;]` | `<li>Cobro online con Stripe</li>` |
| public/ar.html | `["€","دفع إلكتروني عبر Stripe"]` | `<li>دفع العملاء بالبطاقة عبر Stripe حسب توفر الخدمة</li>` |
| public/for-agencies.html | n/a | `<li><strong>Card payments via Stripe</strong>, so a client can settle from the invoice itself.</li>` and ", connected Stripe client payments" in the Advanced paragraph |

4. Restore the Advanced "plan-foot" trial wording ("card via Stripe") in Landing.jsx and the
   nl/fr/es/ar pages if the trial goes back to Stripe.

If the new provider is not Stripe, replace the name in these lines instead of restoring them.
