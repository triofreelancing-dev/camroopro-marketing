import { post } from './bridge';
import type { Handoff } from './handoff';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
export const CALLBACK_URL = 'https://camroopro.com/api/rzp-callback';
export const CANCEL_URL = 'https://camroopro.com/pay/result?status=cancelled';

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

  const rzp = new window.Razorpay({
    key: handoff.keyId,
    subscription_id: handoff.razorpaySubscriptionId,
    name: 'Camaroo',
    description: `${handoff.planName} Plan · Monthly`,
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
    /**
     * redirect:true, not a JS handler.
     *
     * On completion Razorpay does a full-page POST to `callback_url` instead of
     * invoking a callback, so the result reaches the app as a NAVIGATION. That
     * survives the one failure the JS handler cannot: iOS reclaiming the
     * WebView's content process while the user is away in a UPI app, which
     * destroys the JS context and with it any pending callback.
     */
    redirect: true,
    callback_url: CALLBACK_URL,
    cancel_url: CANCEL_URL,
  });

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
  post({ v: 1, type: 'PAY_OPENED', subscriptionId: handoff.razorpaySubscriptionId });
}
