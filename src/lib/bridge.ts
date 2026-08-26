/**
 * The web -> app message contract.
 *
 * MIRROR OF: camaroo/types/payment.ts. There is no shared package, so any
 * change here must be made there too.
 *
 * Versioned from day one because this site deploys continuously while app
 * binaries live for months — old binaries will hit new site code forever. The
 * app is required to ignore `type` values it does not recognise, so adding a
 * new message is safe; changing the meaning of an existing one is not.
 */
export type WebToAppMessage =
  | { v: 1; type: 'PAY_READY' }
  | { v: 1; type: 'PAY_OPENED'; subscriptionId: string }
  | { v: 1; type: 'PAY_SUCCESS'; subscriptionId: string; paymentId?: string }
  | { v: 1; type: 'PAY_PENDING'; subscriptionId: string; reason: 'upi_await' | 'mandate_pending' }
  | { v: 1; type: 'PAY_FAILED'; code?: string; description: string }
  | { v: 1; type: 'PAY_DISMISSED'; subscriptionId?: string }
  | { v: 1; type: 'PAY_FATAL'; description: string }
  | { v: 1; type: 'OPEN_EXTERNAL'; url: string }
  | { v: 1; type: 'LOG'; level: 'info' | 'warn' | 'error'; msg: string };

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (data: string) => void };
    Razorpay?: new (options: unknown) => { open: () => void; on: (e: string, cb: (a: unknown) => void) => void };
    __CAMAROO_HANDOFF__?: unknown;
    __camarooReceive?: (msg: unknown) => void;
  }
}

/** True when this page is running inside the app's WebView rather than a browser. */
export const isInApp = () => typeof window.ReactNativeWebView?.postMessage === 'function';

let nonce: string | null = null;

/** The app sends a nonce in the handoff; every message echoes it back so the
 *  app can reject anything that did not originate from this page load. */
export const setNonce = (value: string | null) => {
  nonce = value;
};

export function post(message: WebToAppMessage) {
  const payload = JSON.stringify(nonce ? { ...message, nonce } : message);
  if (!isInApp()) {
    // Browser testing: log rather than throw, so /pay is still inspectable.
    console.info('[bridge] (not in app)', payload);
    return;
  }
  window.ReactNativeWebView!.postMessage(payload);
}
