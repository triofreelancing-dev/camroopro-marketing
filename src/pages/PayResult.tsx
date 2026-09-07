import { useEffect } from 'react';
import { isInApp, post } from '../lib/bridge';
import { restoreNonce } from '../lib/handoff';
import { Muted, PrimaryButton, Shell, Spinner } from '../components/Shell';

/** Must match `scheme` in the app's app.json. */
const APP_SCHEME = 'camaroo://';

/**
 * Terminal state after Razorpay's redirect.
 *
 * Reached by a real page load (the /api/rzp-callback function 302s here), never
 * by a client-side route change: on iOS `onNavigationStateChange` fires only
 * from load start/finish, so a pushState would be invisible to the app and the
 * result would be silently lost.
 */
export default function PayResult() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status') ?? 'unknown';
  const subscriptionId = params.get('subscription_id') ?? '';
  const paymentId = params.get('payment_id') ?? undefined;

  const returnToApp = () => {
    const params = new URLSearchParams({ status });
    if (subscriptionId) params.set('subscription_id', subscriptionId);
    if (paymentId) params.set('payment_id', paymentId);
    window.location.href = `${APP_SCHEME}pay/return?${params.toString()}`;
  };

  useEffect(() => {
    // This is a separate document from /pay, so it needs the in-app treatment of
    // its own — it was previously the one page that kept browser scroll
    // behaviour mid-payment.
    document.body.classList.add('in-app');

    // MUST come first. This is a fresh document after Razorpay's redirect, so
    // the nonce set on /pay is gone; posting without it makes the app reject
    // every message here as a forgery and the user sits on this page forever.
    restoreNonce();

    /**
     * Browser mode: this document is in Safari, not a WebView, so there is no
     * postMessage channel — the app is reached by its custom scheme instead.
     *
     * `isInApp()` distinguishes the two: react-native-webview injects
     * ReactNativeWebView, real Safari has nothing. Attempted automatically, but
     * Safari can refuse a scheme navigation without a user gesture, which is why
     * the button below is rendered rather than being a fallback nobody sees.
     */
    if (!isInApp()) {
      returnToApp();
      return;
    }

    if (status === 'success') {
      post({ v: 1, type: 'PAY_SUCCESS', subscriptionId, paymentId });
    } else if (status === 'cancelled') {
      post({ v: 1, type: 'PAY_DISMISSED', subscriptionId });
    } else {
      post({
        v: 1,
        type: 'PAY_FAILED',
        description: params.get('description') ?? 'The payment did not go through.',
      });
    }
    // Intentionally fire-and-forget: the app treats this as advisory and
    // confirms with the server regardless.
     
  }, []);

  const copy = {
    success: {
      title: 'Payment received',
      body: 'Returning you to the app. Your plan activates in a moment.',
    },
    cancelled: {
      title: 'Payment cancelled',
      body: 'Nothing was charged. You can try again from the app.',
    },
    unknown: {
      title: "That didn't go through",
      body: 'No money has left your account. You can try again from the app.',
    },
  }[status === 'success' || status === 'cancelled' ? status : 'unknown'];

  /*
   * Composed to match the native PaymentConfirming screen this hands off to —
   * icon first, Outfit Bold title, muted body — so crossing from web to native
   * mid-payment does not look like a jump between two different apps.
   */
  return (
    <Shell>
      <div className="flex flex-col items-center text-center">
        {status === 'success' ? (
          <CheckIcon />
        ) : status === 'cancelled' ? (
          <Spinner className="h-10 w-10" />
        ) : (
          <AlertIcon />
        )}

        <h1 className="mt-6 text-xl font-bold">{copy.title}</h1>
        <Muted className="mt-3 text-sm leading-relaxed">{copy.body}</Muted>

        {/* Browser mode only. The automatic scheme navigation above can be
            refused without a user gesture, and a silent failure would strand
            someone on a web page having just paid — so this is always here,
            not a fallback that only appears once something has gone wrong. */}
        {!isInApp() ? (
          <div className="mt-8 w-full">
            <PrimaryButton onClick={returnToApp}>Return to Camaroo</PrimaryButton>
          </div>
        ) : null}
      </div>
    </Shell>
  );
}

/* Inline SVGs rather than an icon package: two glyphs do not justify a
   dependency inside a payment page, and these match the app's lucide sizing. */
function CheckIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D89A2F" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}
