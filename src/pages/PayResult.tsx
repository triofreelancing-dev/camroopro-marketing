import { useEffect } from 'react';
import { post } from '../lib/bridge';

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

  useEffect(() => {
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

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
      <h1 className="text-2xl font-bold">{copy.title}</h1>
      <p className="mt-3 text-sm opacity-70">{copy.body}</p>
    </main>
  );
}
