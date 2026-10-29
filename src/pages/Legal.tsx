import type { LegalBlock } from '../legal/types';
import SiteHeader from './landing/sections/SiteHeader';
import SiteFooter from './landing/sections/SiteFooter';
import './legal.css';

/**
 * Renders the Terms, Privacy or Delete-account blocks extracted from the app.
 *
 * Kept as data + one renderer rather than hand-written JSX so the site cannot
 * drift from what users actually agreed to in the app. Styling follows the
 * client's V5.1 design system; the TEXT is not this file's to change.
 *
 * The header and footer are the landing page's, given hrefBase="/" so their
 * in-page anchors navigate home first instead of scrolling nowhere here.
 *
 * `eyebrow` names the document type above the title. It is derived from the
 * title block rather than passed in, so adding a fourth legal page needs no
 * change at the call site.
 */
export default function Legal({ blocks }: { blocks: LegalBlock[] }) {
  const title = blocks.find((b) => b.kind === 'title');
  const body = blocks.filter((b) => b !== title);

  return (
    <div className="legal-page">
      <SiteHeader hrefBase="/" />

      <header className="legal-head">
        <div className="legal-measure">
          <a className="legal-back" href="/">
            <span aria-hidden="true">&larr;</span> Back to CAMROO
          </a>
          {title && <h1 className="legal-title">{title.text}</h1>}
        </div>
      </header>

      <main className="legal-body">
        <div className="legal-measure">
          {body.map((block, i) =>
            block.kind === 'heading' ? (
              <h2 key={i}>{block.text}</h2>
            ) : (
              /*
               * Several blocks hold more than one paragraph separated by blank
               * lines; splitting keeps the spacing the document intends.
               */
              block.text.split('\n\n').map((para, j) => <p key={`${i}-${j}`}>{para}</p>)
            )
          )}
        </div>
      </main>

      <SiteFooter hrefBase="/" />
    </div>
  );
}
