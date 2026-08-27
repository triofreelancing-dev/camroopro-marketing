import { useEffect, useRef, useState } from 'react';
import { isInApp, post } from '../lib/bridge';
import { readHandoff, type Handoff } from '../lib/handoff';
import { loadCheckout, openCheckout } from '../lib/razorpay';
import { applyTheme } from '../lib/theme';
import { Card, Muted, PrimaryButton, Shell, Spinner } from '../components/Shell';

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
    applyTheme(handoff?.theme);

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
        <Muted className="mt-3 text-sm leading-relaxed">
          This checkout page is started by the app. Open Camaroo, go to Settings &rarr;
          Subscription, and choose a plan there.
        </Muted>
      </Shell>
    );
  }

  const isCourse = handoff?.mode === 'order';

  return (
    <Shell>
      <Card>
        <p className="text-xs font-medium uppercase tracking-widest text-gold">Camaroo</p>

        {/* The native header deliberately shows only "Secure payment", so this is
            the single place the thing being bought is named. */}
        <h1 className="mt-2 text-2xl font-bold leading-tight">
          {handoff?.planName}
          {isCourse ? '' : ' Plan'}
        </h1>

        <p className="mt-3 text-3xl font-bold">
          ₹{handoff?.price}
          {isCourse ? null : (
            <span className="text-base font-normal text-slate-500 dark:text-slate-400">/month</span>
          )}
        </p>

        <div className="mt-5 border-t border-slate-100 pt-5 dark:border-ink-card">
          <PrimaryButton onClick={handlePay} disabled={state !== 'ready'} busy={state === 'opening'}>
            {state === 'loading' && 'Preparing…'}
            {state === 'ready' && `Pay ₹${handoff?.price}`}
            {state === 'opening' && 'Opening payment…'}
            {state === 'error' && 'Unavailable'}
          </PrimaryButton>

          {state === 'loading' ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Spinner className="h-4 w-4" />
              <Muted className="text-xs">Setting up secure payment…</Muted>
            </div>
          ) : null}

          {state === 'error' && (
            <p className="mt-3 text-sm text-red-500 dark:text-red-400">{message}</p>
          )}
        </div>
      </Card>

      {/* Same wording as the app's plans screen, so the commitment a user sees
          does not change depending on which platform they are on. */}
      {isCourse ? null : (
        <Muted className="mt-6 text-xs leading-relaxed">
          Renews automatically each month. Cancel anytime from Settings &rarr; Subscription.
        </Muted>
      )}
      <Muted className="mt-4 text-xs leading-relaxed">
        By paying you agree to our{' '}
        <a href="/terms" onClick={openLegal('/terms')} className="font-bold text-gold">
          Terms of Use
        </a>{' '}
        and{' '}
        <a href="/privacy" onClick={openLegal('/privacy')} className="font-bold text-gold">
          Privacy Policy
        </a>
        .
      </Muted>
    </Shell>
  );
}
