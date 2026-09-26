# QuickCart

QuickCart is a demo e-commerce site built around one core idea: **checkout should be usable by everyone, including visually impaired shoppers** — without making sensitive payment data any less secure.

Built for BitNBuild '26 — UAE Regional Qualifying Round.

## Problem statement / category

This project is submitted under the **Open Category**. Rather than solving one of the drawn problem statements directly, we built an original idea centered on accessible e-commerce: a shopping and checkout flow with a built-in spoken activity recap and a biometric-gated voice readout for sensitive payment details.

## The problem it solves

Most "accessible" checkout flows rely entirely on a generic screen reader to narrate a page. That works, but it puts the burden on the user to catch every change as it happens — and it offers no safe way to have truly sensitive fields (card number, CVV, PIN) read aloud, since a screen reader will happily speak them to anyone standing nearby.

QuickCart addresses both problems:

- **"What Did I Miss?"** — a floating button that recaps everything that changed since the user last checked, spoken aloud, so nothing silently slips by (price updates, discounts applied, payment status changes, delivery details).
- **Fingerprint-gated sensitive readout** — card number, CVV, and PIN are never spoken automatically. On the checkout page, the same "What Did I Miss?" flow offers to read them back only after a fingerprint verification step, so the convenience of voice doesn't come at the cost of security.

## Features

- Product listing page with a product grid and an "Add to Cart" flow
- Cart and discount logic, persisted across pages via `localStorage`
- Dedicated checkout page with:
- Order summary pulled from the cart
- Delivery details form (phone number, country, and a dependent state/emirate dropdown)
- Payment form (cardholder name, card number, expiry, CVV, PIN)
- A simulated multi-step "Proceed to Payment" flow (processing → verifying → result)
- Full text-to-speech feedback on every major action, using the browser's built-in Web Speech API (no external service, fully offline)
- An activity log that powers the "What Did I Miss?" recap button
- A simulated fingerprint verification modal that gates the sensitive parts of the readout (card number, CVV, PIN)

## Important note on the fingerprint check

The fingerprint verification in this demo is **simulated** (a tap-to-scan animation), not a real biometric check. A website cannot verify an actual fingerprint on its own — genuine biometric verification happens at the OS/device level via the WebAuthn API, which can trigger the real fingerprint or Face ID prompt on supported hardware. This project demonstrates the *interaction pattern* — gating sensitive data behind a biometric step — as a proof of concept for accessible, secure checkout design. It is not production-grade security and is not intended to be.

No real payment processing happens anywhere in this project. All data stays in the browser and is never sent anywhere.

## Tech stack

- HTML5
- CSS3 (custom properties / design tokens, no framework)
- Vanilla JavaScript (no build step, no dependencies)
- Web Speech API (`speechSynthesis`) for text-to-speech
- `localStorage` for cart persistence between pages

## Project structure

```
QuickCart/
├── index.html # Product listing page (Page 1)
├── checkout.html # Checkout / payment page (Page 2)
├── style.css # Shared styling for both pages
├── script.js # Shared logic: cart, speech, activity log, fingerprint gate
└── README.md
```

## Running it locally

No build tools, no dependencies, no installation needed.

1. Clone the repository:
```
git clone https://github.com/linahlinathere1427-web/QuickCart
cd QuickCart
```
2. Open `index.html` directly in a browser (double-click it, or right-click → Open With → your browser).
3. Browse products, add items to the cart, then click "Go to Checkout" to reach the payment flow.

That's it — everything runs client-side.

## Roadmap / what we'd add with more time

- Real biometric verification via the WebAuthn API on supported devices
- Multi-item quantities and a full multi-product cart editor
- More countries/regions in the delivery dropdown
- Persisting orders (not just cart contents) for an order history page
