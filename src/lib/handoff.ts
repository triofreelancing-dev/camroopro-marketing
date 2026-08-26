import { post, setNonce } from './bridge';

export type Handoff = {
  /** The Razorpay subscription (`sub_…`) the app already created for this attempt. */
  razorpaySubscriptionId: string;
  /** Razorpay key id, taken from POST /subscription/buy so it cannot disagree
   *  with the merchant account that minted the subscription above. */
  keyId: string;
  planName: string;
  price: number;
  /** Lets the app fall back to cards-only without an App Store release if
   *  UPI-in-WebView turns out to be unreliable on real devices. */
  methods?: ('upi' | 'card')[];
  nonce?: string;
};

const REQUIRED: (keyof Handoff)[] = ['razorpaySubscriptionId', 'keyId', 'planName'];

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
  const missing = REQUIRED.filter((k) => !candidate[k]);
  if (missing.length) {
    post({ v: 1, type: 'PAY_FATAL', description: `Handoff missing: ${missing.join(', ')}` });
    return null;
  }
  if (!String(candidate.razorpaySubscriptionId).startsWith('sub_')) {
    post({ v: 1, type: 'PAY_FATAL', description: 'Handoff is not a subscription id' });
    return null;
  }

  const handoff = { price: 0, ...candidate } as Handoff;
  setNonce(handoff.nonce ?? null);
  return handoff;
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
