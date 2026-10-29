import { Link } from 'react-router-dom';
import type { LegalBlock } from '../legal/types';
import './legal.css';

interface Props {
  blocks: LegalBlock[];
  /** Short name for the banner, e.g. "Privacy Policy". */
  name: string;
}

/**
 * Renders the Terms, Privacy or Delete-account blocks extracted from the app,
 * in the layout the client's handoff uses for its own legal pages: sticky
 * header, banner, contents sidebar, numbered sections.
 *
 * Two deliberate departures from the handoff's legal pages:
 *
 *  - No "DRAFT — AWAITING LEGAL APPROVAL" badge, pre-publication alert or
 *    "download the draft PDF" button. Those belong to the client's unapproved
 *    documents. These pages serve the live policy the app already shows and
 *    the stores already link, so labelling them drafts would be wrong.
 *  - Navigation uses <Link>, not <a href>, so moving between pages does not
 *    reload the whole site.
 *
 * Styling may change here; the TEXT may not. It comes from legal/privacy.ts,
 * legal/terms.ts and legal/delete-account.ts, which are generated from the app
 * so the two cannot drift — /privacy is the URL on the Play and App Store
 * listings and has to keep matching the Data safety declaration.
 */
export default function Legal({ blocks, name }: Props) {
  const title = blocks.find((b) => b.kind === 'title');
  const rest = blocks.filter((b) => b !== title);

  /*
   * Group the flat block list into sections: a heading starts one, the body
   * blocks that follow belong to it. Anything before the first heading (the
   * brand/operator/effective-date preamble) becomes an unnumbered lead.
   */
  const lead: LegalBlock[] = [];
  const sections: { heading: string; body: LegalBlock[] }[] = [];
  for (const block of rest) {
    if (block.kind === 'heading') sections.push({ heading: block.text, body: [] });
    else if (sections.length) sections[sections.length - 1].body.push(block);
    else lead.push(block);
  }

  /** Headings arrive as "3. Personal data we collect" — split for the contents list. */
  const splitHeading = (text: string) => {
    const m = /^(\d+)\.\s*(.*)$/.exec(text);
    return m ? { num: m[1].padStart(2, '0'), label: m[2] } : { num: '', label: text };
  };

  const slug = (i: number) => `section-${i + 1}`;

  return (
    <div className="legal-doc">
      <header>
        <div className="head-in">
          <Link to="/" aria-label="Return to CAMROO homepage">
            <img src="/site-assets/logo-horizontal.png" alt="CAMROO" />
          </Link>
          <nav>
            <Link to="/">Home</Link>
            <Link to={name === 'Terms & Conditions' ? '/privacy' : '/terms'}>
              {name === 'Terms & Conditions' ? 'Privacy Policy' : 'Terms & Conditions'}
            </Link>
            <a href="/#contact">Contact</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="banner">
          <div className="banner-inner">
            <div className="overline">CAMROO • LEGAL DOCUMENTS</div>
            <h1>
              {name}
              <span style={{ color: '#ffbd2e' }}>.</span>
            </h1>
            {title && <p>{title.text}</p>}
            <div className="actions">
              <Link className="btn gold" to="/">
                ← Back to CAMROO
              </Link>
              {name !== 'Terms & Conditions' && (
                <Link className="btn" to="/terms">
                  Read Terms &amp; Conditions →
                </Link>
              )}
              {name !== 'Privacy Policy' && (
                <Link className="btn" to="/privacy">
                  Read Privacy Policy →
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="layout">
          <aside className="toc" aria-label="Table of contents">
            <div className="toc-title">Contents / {sections.length} sections</div>
            {sections.map((s, i) => {
              const { num, label } = splitHeading(s.heading);
              return (
                <a key={slug(i)} href={`#${slug(i)}`}>
                  <span>{num || String(i + 1).padStart(2, '0')}</span>
                  {label}
                </a>
              );
            })}
          </aside>

          <div className="legal-copy">
            {lead.length > 0 && (
              <section className="legal-section">
                {lead.map((b, i) =>
                  b.text.split('\n\n').map((para, j) => <p key={`${i}-${j}`}>{para}</p>)
                )}
              </section>
            )}

            {sections.map((s, i) => (
              <section className="legal-section" id={slug(i)} key={slug(i)}>
                <div className="section-counter">
                  {String(i + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
                </div>
                <h2>{s.heading}</h2>
                {s.body.map((b, j) =>
                  b.text.split('\n\n').map((para, k) => <p key={`${j}-${k}`}>{para}</p>)
                )}
              </section>
            ))}
          </div>
        </div>
      </main>

      <footer className="legal-footer">
        <div className="legal-footer-in">
          <span>
            © {new Date().getFullYear()} CAMROO PRO PRIVATE LIMITED • Connect · Collaborate ·
            Create
          </span>
          <span>
            <Link to="/">Home</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <a href="mailto:camrooproofficial@gmail.com">Contact</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
