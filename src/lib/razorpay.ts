import { post } from './bridge';
import type { Handoff } from './handoff';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Built from the origin actually being served, not a hardcoded camroopro.com.
 *
 * Razorpay redirects the WebView to whatever these say, so a hardcoded
 * production URL would send a dev-tunnel session to a domain that does not exist
 * yet and lose the result.
 */
const callbackUrl = () => `${window.location.origin}/api/rzp-callback`;
const cancelUrl = () => `${window.location.origin}/pay/result?status=cancelled`;

let loading: Promise<void> | null = null;

export function loadCheckout(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Razorpay checkout'));
    document.head.appendChild(script);
  });
  return loading;
}

export function openCheckout(handoff: Handoff) {
  if (!window.Razorpay) throw new Error('Razorpay checkout not loaded');

  const methods = handoff.methods?.length ? handoff.methods : (['upi', 'card'] as const);
  const blocks: Record<string, unknown> = {};
  const sequence: string[] = [];
  // Kept in the app's order — UPI first — because UPI Autopay is the dominant
  // recurring rail in India and cards need an RBI e-mandate that a meaningful
  // share of Indian debit cards fail to register.
  if (methods.includes('upi')) {
    blocks.upi = { name: 'Pay via UPI', instruments: [{ method: 'upi' }] };
    sequence.push('block.upi');
  }
  if (methods.includes('card')) {
    blocks.cards = { name: 'Pay via Cards', instruments: [{ method: 'card' }] };
    sequence.push('block.cards');
  }

  /**
   * The id echoed back to the app on every message.
   *
   * The contract field is named `subscriptionId` for historical reasons; for a
   * course it carries the order id instead. Either way it is advisory — the app
   * confirms entitlement against the server and never trusts this.
   */
  const referenceId = handoff.razorpaySubscriptionId ?? handoff.orderId ?? '';

  // Razorpay identifies a recurring plan and a one-off purchase differently, and
  // rejects options carrying both.
  const target =
    (handoff.mode ?? 'subscription') === 'order'
      ? { order_id: handoff.orderId, amount: handoff.amount, currency: handoff.currency ?? 'INR' }
      : { subscription_id: handoff.razorpaySubscriptionId };

  const base = {
    key: handoff.keyId,
    ...target,
    name: 'Camaroo',
    description:
      (handoff.mode ?? 'subscription') === 'order'
        ? handoff.planName
        : `${handoff.planName} Plan · Monthly`,
    theme: { color: '#D89A2F' },
    /**
     * MIRROR OF: camaroo/hooks/useSubscription.ts (`config.display`).
     * iOS and Android must offer the same payment rails, so this block and that
     * one have to stay in step. Two repos, no shared package — if you change one,
     * change the other.
     */
    config: {
      display: { blocks, sequence, preferences: { show_default_blocks: false } },
    },
  };

  /**
   * `redirect` is what production uses.
   *
   * On completion Razorpay does a full-page POST to `callback_url` instead of
   * invoking a callback, so the result reaches the app as a NAVIGATION. That
   * survives the one failure the JS handler cannot: the OS reclaiming the
   * WebView's content process while the user is away in a UPI app, which
   * destroys the JS context and with it any pending callback.
   *
   * `handler` exists only for hosts Razorpay's servers cannot POST back to — a
   * plain-http LAN address during local testing. Lower fidelity by exactly the
   * failure above, so prefer a tunnel and stay on `redirect` where possible.
   */
  const options =
    (handoff.resultMode ?? 'redirect') === 'redirect'
      ? {
          ...base,
          redirect: true,
          callback_url: callbackUrl(),
          cancel_url: cancelUrl(),
        }
      : {
          ...base,
          redirect: false,
          handler: (response: { razorpay_payment_id?: string }) =>
            post({
              v: 1,
              type: 'PAY_SUCCESS',
              subscriptionId: referenceId,
              paymentId: response?.razorpay_payment_id,
            }),
          modal: {
            ondismiss: () =>
              post({
                v: 1,
                type: 'PAY_DISMISSED',
                subscriptionId: referenceId,
              }),
          },
        };

  const rzp = new window.Razorpay(options);

  rzp.on('payment.failed', (response: unknown) => {
    const err = (response as { error?: { code?: string; description?: string } })?.error;
    post({
      v: 1,
      type: 'PAY_FAILED',
      code: err?.code,
      description: err?.description ?? 'Payment failed',
    });
  });

  rzp.open();
  post({ v: 1, type: 'PAY_OPENED', subscriptionId: referenceId });
}
