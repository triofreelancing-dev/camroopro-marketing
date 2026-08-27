import type { ReactNode } from 'react';

/**
 * The surface every in-app page sits on.
 *
 * Shared so `/pay`, `/pay/result` and `/manage` are visually one screen rather
 * than three loosely related web pages — the user crosses all three in a single
 * payment, and any difference between them reads as the app breaking.
 *
 * `pb-[env(safe-area-inset-bottom)]` matters: the native screen reserves the top
 * inset but the bottom belongs to this document, so without it content sits
 * under the home indicator.
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10"
      style={{ paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
    >
      {children}
    </main>
  );
}

/**
 * A card matching the app's, e.g. the plan cards on its subscription screen:
 * `rounded-2xl` with a slate border in light and #1E3A5F in dark.
 */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-ink-line dark:bg-ink ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * The app's primary button, copied from its sticky subscribe CTA:
 * `w-full py-4 rounded-2xl bg-gold` with the label in Outfit Bold white.
 */
export function PrimaryButton({
  children,
  onClick,
  disabled,
  busy,
  tone = 'gold',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  tone?: 'gold' | 'danger';
}) {
  const fill =
    tone === 'danger'
      ? 'bg-red-500 enabled:active:bg-red-600'
      : 'bg-gold enabled:active:bg-gold-dark';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold
                  text-white transition disabled:opacity-45 ${fill}`}
    >
      {busy ? <Spinner className="h-5 w-5 border-white/40 border-t-white" /> : null}
      {children}
    </button>
  );
}

/** The app shows a gold ActivityIndicator while it waits; this is its analogue. */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-slate-300 border-t-gold
                  dark:border-ink-line dark:border-t-gold ${className || 'h-8 w-8'}`}
    />
  );
}

/** Secondary text, in the app's slate pair rather than an opacity fudge. */
export function Muted({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-slate-500 dark:text-slate-400 ${className}`}>{children}</p>
  );
}
