import { useEffect, useRef, useState } from 'react';
import { isInApp, post } from '../lib/bridge';
import { readHandoff, type Handoff } from '../lib/handoff';
import { loadCheckout, openCheckout } from '../lib/razorpay';

type State = 'loading' | 'ready' | 'opening' | 'unavailable' | 'error';

export default function Pay() {
  // Read once: readHandoff() deletes the injected global as a side effect, so a
  // second call in React's development double-render would find nothing.
  const handoffRef = useRef<Handoff | null | undefined>(undefined);
  if (handoffRef.current === undefined) handoffRef.current = readHandoff();
  const handoff = handoffRef.current;

  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.body.classList.add('in-app');

    if (!handoff) {
      setState('unavailable');
      return;
    }

    let cancelled = false;
    loadCheckout()
      .then(() => {
        if (cancelled) return;
        setState('ready');
        post({ v: 1, type: 'PAY_READY' });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState('error');
        setMessage(err.message);
        post({ v: 1, type: 'PAY_FATAL', description: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [handoff]);

  const handlePay = () => {
    if (!handoff) return;
    try {
      setState('opening');
      openCheckout(handoff);
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Could not start payment';
      setState('error');
      setMessage(description);
      post({ v: 1, type: 'PAY_FATAL', description });
    }
  };

  /* Opening a link would navigate away and destroy the checkout session, so
     hand the URL to the app and let it open natively instead. */
  const openLegal = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `https://camroopro.com${path}`;
    if (isInApp()) post({ v: 1, type: 'OPEN_EXTERNAL', url });
    else window.open(url, '_blank', 'noopener');
  };

  if (state === 'unavailable') {
    return (
      <Shell>
        <h1 className="text-xl font-bold">Open this from the Camaroo app</h1>
        <p className="mt-3 text-sm opacity-70">
          This checkout page is started by the app. Open Camaroo, go to Settings &rarr;
          Subscription, and choose a plan there.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs uppercase tracking-widest text-gold">Camaroo</p>
      <h1 className="mt-2 text-2xl font-bold">{handoff?.planName} Plan</h1>
      <p className="mt-1 text-3xl font-bold">
        ₹{handoff?.price}
        <span className="text-base font-normal opacity-60">/month</span>
      </p>

      <button
        type="button"
        onClick={handlePay}
        disabled={state !== 'ready'}
        className="mt-8 w-full rounded-xl bg-gold py-4 text-base font-bold text-white transition
                   enabled:active:bg-gold-dark disabled:opacity-45"
      >
        {state === 'loading' && 'Preparing…'}
        {state === 'ready' && `Pay ₹${handoff?.price}`}
        {state === 'opening' && 'Opening payment…'}
        {state === 'error' && 'Unavailable'}
      </button>

      {state === 'error' && <p className="mt-3 text-sm text-red-500">{message}</p>}

      {/* Same wording as the app's plans screen, so the commitment a user sees
          does not change depending on which platform they are on. */}
      <p className="mt-6 text-xs leading-relaxed opacity-60">
        Renews automatically each month. Cancel anytime from the app.
      </p>
      <p className="mt-4 text-xs leading-relaxed opacity-60">
        By paying you agree to our{' '}
        <a href="/terms" onClick={openLegal('/terms')} className="font-semibold text-gold">
          Terms of Use
        </a>{' '}
        and{' '}
        <a href="/privacy" onClick={openLegal('/privacy')} className="font-semibold text-gold">
          Privacy Policy
        </a>
        .
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      {children}
    </main>
  );
}
