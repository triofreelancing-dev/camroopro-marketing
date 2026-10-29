import { useRef, useState } from 'react';

/**
 * Where enquiries are sent. Falls back to production rather than failing
 * closed: this form is the site's only conversion path, and a Vercel project
 * created without the variable would otherwise silently stop collecting
 * enquiries with nothing in the UI to show for it. Override for staging.
 */
const CONTACT_ENDPOINT =
  import.meta.env.VITE_CONTACT_API_URL ?? 'https://api.camroopro.com/api/v1/contact';

const FALLBACK_MAILBOX = 'camrooproofficial@gmail.com';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Opens the visitor's mail client with the message pre-filled.
 *
 * Kept from the original handoff as the failure path only: if the API is
 * unreachable, a visitor who has typed a message should not lose it, so the
 * form degrades to the behaviour the static page always had.
 */
function composeMail(name: string, email: string, message: string) {
  const subject = encodeURIComponent('CAMROO website inquiry from ' + name);
  const body = encodeURIComponent(
    'Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message
  );
  window.location.href = `mailto:${FALLBACK_MAILBOX}?subject=${subject}&body=${body}`;
}

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  /* How long the form was on screen. Bots submit near-instantly; the server
     treats anything under a couple of seconds as automated. */
  const mountedAt = useRef(Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;

    const el = form.elements as typeof form.elements & {
      name: HTMLInputElement;
      email: HTMLInputElement;
      message: HTMLTextAreaElement;
      website: HTMLInputElement;
    };
    const name = el.name.value.trim();
    const email = el.email.value.trim();
    const message = el.message.value.trim();

    setStatus('sending');
    setError(null);

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          website: el.website.value,
          elapsedMs: Date.now() - mountedAt.current,
        }),
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || payload?.isSuccess === false) {
        /* A 4xx is the server rejecting this particular message — a disposable
           address, or too many too quickly. Showing its wording is more useful
           than a generic failure, and falling back to mail would just send
           something the server already declined. */
        if (res.status >= 400 && res.status < 500 && payload?.message) {
          setStatus('error');
          setError(payload.message);
          return;
        }
        throw new Error(payload?.message ?? `Request failed (${res.status})`);
      }

      form.reset();
      mountedAt.current = Date.now();
      setStatus('sent');
    } catch {
      // Unreachable or 5xx: hand the message to their mail client instead.
      setStatus('error');
      setError('We could not send that just now — opening your email app instead.');
      composeMail(name, email, message);
    }
  }

  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="container contact-grid">
        <div className="reveal">
          <div className="eyebrow">LET'S CONNECT</div>
          <h2 className="h2" id="contact-title">
            The next chapter
            <br />
            starts with a <span className="accent">conversation.</span>
          </h2>
          <p className="section-copy">
            Whether you're a creative professional, a studio, a potential partner or just curious
            about the CAMROO vision, we'd love to hear from you.
          </p>
          <div className="contact-chips">
            <span>Creators</span>
            <span>Studios</span>
            <span>Partners</span>
            <span>Business inquiries</span>
          </div>
          <p style={{ color: '#afc0d1', marginTop: '35px', fontSize: '13px' }}>
            Email:{' '}
            <a
              style={{
                color: 'var(--gold)',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
              }}
              href={`mailto:${FALLBACK_MAILBOX}`}
            >
              {FALLBACK_MAILBOX}
            </a>
          </p>
        </div>

        <form className="form reveal" id="contact-form" onSubmit={handleSubmit}>
          <h3>Send CAMROO a message.</h3>

          <label htmlFor="full-name">Your name</label>
          <input
            id="full-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            required
            maxLength={80}
          />

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            maxLength={120}
          />

          <label htmlFor="message">What's on your mind?</label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us a little about what you're looking for..."
            required
            minLength={8}
            maxLength={2500}
          />

          {/*
            Honeypot. Hidden from people and skipped by assistive technology and
            tab order, but a form-filling bot sees an input named "website" and
            completes it — which is how the server knows to discard the message.
          */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
          />

          <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}{' '}
            <span aria-hidden="true">↗</span>
          </button>

          {/* aria-live so the outcome reaches a screen reader, which never sees
              the visual state change. */}
          <small role="status" aria-live="polite">
            {status === 'sent' &&
              'Thanks — your message is with the CAMROO team. We will reply to the address you gave.'}
            {status === 'error' && error}
            {(status === 'idle' || status === 'sending') &&
              'We usually reply within a couple of working days.'}
          </small>
        </form>
      </div>
    </section>
  );
}
