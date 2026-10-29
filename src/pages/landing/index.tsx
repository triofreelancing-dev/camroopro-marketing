import SiteHeader from './sections/SiteHeader';
import Hero from './sections/Hero';
import Strap from './sections/Strap';
import Network from './sections/Network';
import Who from './sections/Who';
import Manifesto from './sections/Manifesto';
import Journey from './sections/Journey';
import AppTour from './sections/AppTour';
import Audience from './sections/Audience';
import Vision from './sections/Vision';
import Leadership from './sections/Leadership';
import Learn from './sections/Learn';
import Faq from './sections/Faq';
import Contact from './sections/Contact';
import FinalCta from './sections/FinalCta';
import SiteFooter from './sections/SiteFooter';
import ArticleDialog from './sections/ArticleDialog';
import { scrollToTop, useLandingChrome } from './useLandingChrome';
import { useBrandTilt } from './useBrandTilt';
import { useState } from 'react';

/**
 * The client's V5.1 landing page, as React.
 *
 * Section order, markup and class names are the handoff's — the only changes
 * are the ones JSX forces (attribute names, void elements) and asset paths,
 * which point at /site-assets. Styling lives in src/styles/camroo.css, also
 * lifted verbatim, so this file should never need its own CSS.
 *
 * The chrome around the sections — scroll progress bar, back-to-top, concept
 * flag — sits here rather than in a section component because the original
 * keeps them as siblings of <main>, and the CSS positions them against the
 * viewport.
 */
export default function Landing() {
  useLandingChrome();
  useBrandTilt();

  /* Lifted so the Learn cards can open the dialog that lives beside <main>. */
  const [article, setArticle] = useState<string | null>(null);

  return (
    <>
      <div className="scrollbar" id="scrollbar" aria-hidden="true" />

      <SiteHeader />

      <main id="top">
        <Hero />
        <Strap />
        <Network />
        <Who />
        <Manifesto />
        <Journey />
        <AppTour />
        <Audience />
        <Vision />
        <Leadership />
        <Learn onOpenArticle={setArticle} />
        <Faq />
        <Contact />
        <FinalCta />
      </main>

      <SiteFooter />

      <button
        className="backtop"
        id="backtop"
        type="button"
        aria-label="Back to top"
        onClick={scrollToTop}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19V5m-7 7 7-7 7 7" />
        </svg>
      </button>

      <div className="concept-flag">
        <b>CAMROO V5</b> · INTERACTIVE PRODUCT CONCEPT
      </div>

      <ArticleDialog article={article} onClose={() => setArticle(null)} />
    </>
  );
}
