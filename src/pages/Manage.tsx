import { useEffect, useRef, useState } from 'react';
import { post } from '../lib/bridge';
import { readHandoff, type Handoff } from '../lib/handoff';
import { applyTheme } from '../lib/theme';
import { cancelSubscription, getMe, type MeSubscription } from '../lib/api';
import { Card, Muted, PrimaryButton, Shell, Spinner } from '../components/Shell';

type State = 'loading' | 'ready' | 'confirming' | 'cancelling' | 'done' | 'unavailable' | 'error';

export default function Manage() {
  // Read once — readHandoff() deletes the injected global as a side effect.
  const handoffRef = useRef<Handoff | null | undefined>(undefined);
  if (handoffRef.current === undefined) handoffRef.current = readHandoff();
  const handoff = handoffRef.current;

  const [state, setState] = useState<State>('loading');
  const [subscription, setSubscription] = useState<MeSubscription | null>(null);
  const [message, setMessage] = useState('');

  const token = handoff?.token;
  const apiBaseUrl = handoff?.apiBaseUrl;

  useEffect(() => {
    document.body.classList.add('in-app');
    applyTheme(handoff?.theme);

    if (!token || !apiBaseUrl) {
      setState('unavailable');
      return;
    }

    let cancelled = false;
    getMe(apiBaseUrl, token)
      .then((me) => {
        if (cancelled) return;
        setSubscription(me?.subscription ?? null);
        setState('ready');
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState('error');
        setMessage(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [token, apiBaseUrl, handoff?.theme]);

  const planName = subscription?.subscriptionId?.name ?? 'your plan';

  const handleCancel = async () => {
    if (!token || !apiBaseUrl || !subscription?._id) return;
    setState('cancelling');
    try {
      await cancelSubscription(apiBaseUrl, token, subscription._id);
      setState('done');
      post({ v: 1, type: 'SUB_CANCEL_REQUESTED', userSubscriptionId: subscription._id });
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Could not cancel the subscription.';
      setState('error');
      setMessage(description);
      post({ v: 1, type: 'SUB_CANCEL_FAILED', description });
    }
  };

  // Opened in a plain browser, or by a build of the app that does not send
  // credentials. Deliberately renders no cancel affordance at all.
  if (state === 'unavailable') {
    return (
      <Shell>
        <h1 className="text-xl font-bold">Open this from the Camaroo app</h1>
        <Muted className="mt-3 text-sm leading-relaxed">
          Subscriptions are managed from the app. Open Camaroo and go to Settings &rarr;
          Subscription.
        </Muted>
      </Shell>
    );
  }

  if (state === 'loading') {
    return (
      <Shell>
        <div className="flex flex-col items-center">
          <Spinner />
          <Muted className="mt-4 text-sm">Loading your plan…</Muted>
        </div>
      </Shell>
    );
  }

  if (state === 'done') {
    /*
     * "Requested", never "cancelled".
     *
     * For a Razorpay-backed plan the backend only calls Razorpay and writes
     * nothing locally — the row flips when the subscription.cancelled webhook
     * lands. Claiming it is already done would contradict what the app shows on
     * the very next screen. Same wording as the app's own toast.
     */
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10B981"
            strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <h1 className="mt-6 text-xl font-bold">Cancellation requested</h1>
          <Muted className="mt-3 text-sm leading-relaxed">
            Your plan will update shortly. You can close this and carry on in the app.
          </Muted>
        </div>
      </Shell>
    );
  }

  const isPaid = !!subscription && subscription.isFree === false;

  return (
    <Shell>
      <Card>
        <p className="text-xs font-medium uppercase tracking-widest text-gold">Current plan</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">
          {subscription?.subscriptionId?.name ?? 'Free'}
        </h1>

        {subscription?.isCancelled ? (
          <Muted className="mt-2 text-sm">Already cancelled — access continues until it expires.</Muted>
        ) : isPaid ? (
          <Muted className="mt-2 text-sm">Renews automatically each month.</Muted>
        ) : (
          <Muted className="mt-2 text-sm">You are on the free plan.</Muted>
        )}

        {isPaid && !subscription?.isCancelled ? (
          <div className="mt-5 border-t border-slate-100 pt-5 dark:border-ink-card">
            {/* `cancelling` must keep the confirm block mounted — otherwise the
                request flips the UI back to the idle button and the busy state
                is never seen. */}
            {state === 'confirming' || state === 'cancelling' ? (
              <>
                {/* Same words as the app's native confirm dialog. */}
                <p className="text-sm font-medium leading-relaxed">
                  Are you sure you want to cancel your {planName} plan? You will lose access to
                  premium features immediately.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  <PrimaryButton
                    tone="danger"
                    onClick={handleCancel}
                    busy={state === 'cancelling'}
                  >
                    Cancel plan
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => setState('ready')}
                    className="w-full rounded-2xl border border-slate-200 py-4 text-base font-bold
                               text-slate-500 dark:border-ink-line dark:text-slate-400"
                  >
                    Keep plan
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setState('confirming')}
                className="w-full rounded-2xl border border-slate-200 py-4 text-base font-bold
                           text-red-500 dark:border-ink-line dark:text-red-400"
              >
                Cancel plan
              </button>
            )}
          </div>
        ) : null}

        {state === 'error' && (
          <p className="mt-4 text-sm text-red-500 dark:text-red-400">{message}</p>
        )}
      </Card>

      <Muted className="mt-6 text-xs leading-relaxed">
        Cancelling stops the next renewal. You are not charged again, and nothing already paid is
        refunded.
      </Muted>
    </Shell>
  );
}
