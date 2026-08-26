/**
 * Razorpay redirect-mode callback.
 *
 * With `redirect: true`, Razorpay does a full-page form POST here when checkout
 * finishes, instead of invoking a JS callback in the page. That is deliberate:
 * a POST is a real navigation, and the app observes navigations even when the
 * WebView's JS context has been destroyed — which is exactly what happens when
 * iOS reclaims the content process while the user is away approving a UPI
 * mandate in GooglePay or PhonePe.
 *
 * This function exists only because a static host answers a POST with 405. It
 * translates the POST into a GET the app can read, and does nothing else.
 *
 * It deliberately does NOT verify the signature or grant anything. Entitlement
 * is written by the Razorpay webhook against the backend's own secret; this is
 * a UI hint. Treat everything in the body as untrusted.
 */

type VercelRequest = {
  method?: string;
  body?: Record<string, string> | string;
};

type VercelResponse = {
  redirect: (status: number, url: string) => void;
  status: (code: number) => { send: (body: string) => void };
};

const RESULT_PATH = 'https://camroopro.com/pay/result';

/** Razorpay sends application/x-www-form-urlencoded; some hosts hand it over
 *  already parsed, others as a raw string. Handle both. */
function readBody(body: VercelRequest['body']): Record<string, string> {
  if (!body) return {};
  if (typeof body === 'string') return Object.fromEntries(new URLSearchParams(body));
  return body;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const body = readBody(req.body);
  const subscriptionId = body.razorpay_subscription_id ?? '';
  const paymentId = body.razorpay_payment_id ?? '';

  // Razorpay only posts here on a completed authorization. Anything missing the
  // payment id is treated as a failure rather than optimistically as success.
  const status = paymentId ? 'success' : 'failed';

  const params = new URLSearchParams({ status });
  if (subscriptionId) params.set('subscription_id', subscriptionId);
  if (paymentId) params.set('payment_id', paymentId);

  // 303 so the browser turns the POST into a GET on the result page.
  res.redirect(303, `${RESULT_PATH}?${params.toString()}`);
}
