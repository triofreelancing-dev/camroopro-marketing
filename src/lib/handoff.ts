import { post, setNonce } from './bridge';

export type Handoff = {
  /**
   * What this page should do.
   *
   * `subscription` — pay for a recurring plan.
   * `order` — pay for a one-off course. Razorpay treats the two as different
   *   products and needs different checkout options for each.
   * `manage` — no payment: show the current plan and offer to cancel it. The
   *   only mode where the page talks to the backend itself.
   *
   * Optional so a build of the app that predates courses still works; it
   * defaults to `subscription`.
   */
  mode?: 'subscription' | 'order' | 'manage';
  /**
   * `manage` only — the app's bearer token.
   *
   * Injected, never taken from the URL: a URL would put a 30-day non-refreshable
   * JWT into WebView history, into every access log on the way, and possibly
   * into a `Referer` sent onward to Razorpay or a bank's 3-D Secure page.
   */
  token?: string;
  /** `manage` only — which backend to call. Passed by the app so the page
   *  follows it to a dev tunnel instead of hardcoding production. */
  apiBaseUrl?: string;
  /** Which palette to render, taken from the app's theme rather than the OS. */
  theme?: 'light' | 'dark';
  /** The Razorpay subscription (`sub_…`) the app already created. Subscriptions only. */
  razorpaySubscriptionId?: string;
  /** The Razorpay order (`order_…`) the app already created. Orders only. */
  orderId?: string;
  /** Order amount in paise, as Razorpay expects it. Orders only. */
  amount?: number;
  currency?: string;
  /** Razorpay key id, taken from POST /subscription/buy so it cannot disagree
   *  with the merchant account that minted the subscription above. Absent in
   *  `manage` mode, which never opens checkout. */
  keyId?: string;
  planName: string;
  price: number;
  /** Lets the app fall back to cards-only without an App Store release if
   *  UPI-in-WebView turns out to be unreliable on real devices. */
  methods?: ('upi' | 'card')[];
  /**
   * How Razorpay reports the result. Defaults to `redirect`, which is what
   * production uses; the app sends `handler` only when pointing at a host
   * Razorpay's servers cannot POST back to, i.e. a plain-http LAN address.
   */
  resultMode?: 'redirect' | 'handler';
  nonce?: string;
};

/**
 * Required per mode. `manage` needs credentials but no Razorpay key; the paying
 * modes need the key but no credentials.
 */
const REQUIRED_BY_MODE: Record<string, (keyof Handoff)[]> = {
  subscription: ['keyId', 'planName'],
  order: ['keyId', 'planName'],
  manage: ['token', 'apiBaseUrl'],
};

/**
 * Reads the payload the app injected before this document loaded.
 *
 * Deliberately a global rather than sessionStorage: the app's injected script is
 * a WKUserScript that re-runs on EVERY main-frame load in that WebView's
 * lifetime — including navigations to Razorpay and to bank 3-D Secure pages — so
 * anything written to storage would be written into those origins too. A global
 * dies with the document, and we delete it on first read.
 */
export function readHandoff(): Handoff | null {
  const raw = window.__CAMAROO_HANDOFF__ ?? fromQueryString();
  try {
    delete window.__CAMAROO_HANDOFF__;
  } catch {
    /* non-configurable in some engines; harmless */
  }

  if (!raw || typeof raw !== 'object') return null;

  const candidate = raw as Partial<Handoff>;
  const mode = candidate.mode ?? 'subscription';

  const missing = (REQUIRED_BY_MODE[mode] ?? REQUIRED_BY_MODE.subscription).filter(
    (k) => !candidate[k]
  );
  if (missing.length) {
    post({ v: 1, type: 'PAY_FATAL', description: `Handoff missing: ${missing.join(', ')}` });
    return null;
  }

  // `manage` carries no Razorpay object, so the id checks below do not apply.
  if (mode === 'manage') {
    const managed = { price: 0, planName: '', ...candidate } as Handoff;
    setNonce(managed.nonce ?? null);
    if (managed.nonce) rememberNonce(managed.nonce);
    return managed;
  }

  // Validate the id against the mode. Getting this wrong is worth catching here
  // rather than letting Razorpay reject it with a message about an id that does
  // not exist, which reads like a backend fault.
  if (mode === 'order') {
    if (!String(candidate.orderId).startsWith('order_')) {
      post({ v: 1, type: 'PAY_FATAL', description: 'Handoff is not an order id' });
      return null;
    }
    if (!Number.isFinite(Number(candidate.amount)) || Number(candidate.amount) <= 0) {
      post({ v: 1, type: 'PAY_FATAL', description: 'Handoff order has no amount' });
      return null;
    }
  } else if (!String(candidate.razorpaySubscriptionId).startsWith('sub_')) {
    post({ v: 1, type: 'PAY_FATAL', description: 'Handoff is not a subscription id' });
    return null;
  }

  const handoff = { price: 0, ...candidate } as Handoff;
  setNonce(handoff.nonce ?? null);
  if (handoff.nonce) rememberNonce(handoff.nonce);
  return handoff;
}

const NONCE_KEY = 'camaroo.checkout.nonce';

/**
 * Keeps the nonce available across the redirect.
 *
 * Unlike the rest of the handoff this is safe to store: it is an anti-forgery
 * echo, not a credential, sessionStorage is same-origin so Razorpay's pages
 * cannot read it, and the app checks the message origin independently.
 */
function rememberNonce(value: string) {
  try {
    sessionStorage.setItem(NONCE_KEY, value);
  } catch {
    /* private mode or blocked storage — restoreNonce falls back to the global */
  }
}

/**
 * Restores the nonce on a document that is not `/pay`.
 *
 * Razorpay's redirect lands on a NEW document, where the module-level nonce is
 * back to null. Without this the result page posts PAY_SUCCESS unsigned, the
 * app's `parseWebMessage` rejects it for a nonce mismatch, and the payment
 * appears to succeed on screen while the app never leaves the WebView.
 *
 * Prefers the freshly injected global; falls back to sessionStorage because on
 * Android the injection is an async `evaluateJavascript` at `onPageStarted` and
 * can lose the race against this page's own scripts.
 */
export function restoreNonce(): void {
  const injected = window.__CAMAROO_HANDOFF__;
  if (injected && typeof injected === 'object') {
    const value = (injected as Partial<Handoff>).nonce;
    if (value) {
      setNonce(value);
      return;
    }
  }
  try {
    const stored = sessionStorage.getItem(NONCE_KEY);
    if (stored) setNonce(stored);
  } catch {
    /* nothing more to try: the app's poll is the backstop */
  }
}

/** Browser-testing fallback only. The app never uses the query string. */
function fromQueryString(): Partial<Handoff> | null {
  const q = new URLSearchParams(window.location.search);
  const sub = q.get('sub');
  if (!sub) return null;
  return {
    razorpaySubscriptionId: sub,
    keyId: q.get('key') ?? '',
    planName: q.get('plan') ?? 'Premium',
    price: Number(q.get('price') ?? 0),
  };
}
