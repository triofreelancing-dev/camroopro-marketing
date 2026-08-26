# camroopro-web

Public website for Camaroo: landing page, legal pages, shared-link targets, and
the iOS checkout page the app opens in a WebView.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page. This is the App Store Connect / Play Console marketing URL. |
| `/terms`, `/privacy` | Legal pages. Also the hosted privacy URL both stores require. |
| `/pay` | Checkout, opened by the app's WebView on iOS. Not usable in a browser. |
| `/pay/result` | Terminal state, reached by redirect from `/api/rzp-callback`. |
| `/api/rzp-callback` | Serverless. Turns Razorpay's form POST into a GET on `/pay/result`. |
| `/portfolio/:id`, `/portfolio/invite` | Shared-link targets; open the app, or offer the store. |

## Before the first deploy

1. **`public/.well-known/apple-app-site-association`** — replace
   `REPLACE_WITH_APPLE_TEAM_ID` with the real Apple Team ID.
2. **`public/.well-known/assetlinks.json`** — replace
   `REPLACE_WITH_EAS_SHA256_FINGERPRINT` with the release signing fingerprint
   (`eas credentials`).
3. **Razorpay dashboard** — whitelist `camroopro.com` as a checkout domain, and
   register `https://camroopro.com/api/rzp-callback` as a redirect-mode callback
   URL. Both need a support request and have lead time.
4. Point `camroopro.com` at this Vercel project. Keep
   `camroo-launchpad-881298ae.vercel.app` alive and redirecting here — links
   already shared are in the wild.

## Two files that mirror the app

These have no shared package, so they drift silently. If you change one, change
the other:

- `src/lib/bridge.ts` &harr; `camaroo/types/payment.ts` — the message contract.
- `src/lib/razorpay.ts` (`config.display`) &harr;
  `camaroo/hooks/useSubscription.ts` — the payment rails offered. iOS and
  Android must offer the same ones.

`src/legal/*.ts` is **generated** from the app's `components/legal/*Content.tsx`.
Re-extract rather than editing by hand: the app's copy is what users actually
agreed to at sign-up.

## No secrets here

The page receives everything it needs from the app: the Razorpay subscription id
and the key id, both from `POST /subscription/buy`. It holds no JWT and makes no
authenticated API call, so there is no `.env` to configure.
