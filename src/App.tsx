import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './pages/landing';
import Legal from './pages/Legal';
import OpenInApp from './pages/OpenInApp';
import Manage from './pages/Manage';
import Pay from './pages/Pay';
import PayResult from './pages/PayResult';
import { TERMS_BLOCKS } from './legal/terms';
import { PRIVACY_BLOCKS } from './legal/privacy';
import { DELETE_ACCOUNT_BLOCKS } from './legal/delete-account';

/**
 * Starts each route at the top.
 *
 * A client-side navigation keeps the window's scroll position, so following
 * the footer's Privacy link from the bottom of the landing page used to land
 * the reader partway down the policy. A hash is left alone — those are the
 * legal pages' own contents links, which are supposed to jump.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    /* `behavior: instant` matters: the legal pages set scroll-behavior:smooth
       for their contents links, which would otherwise animate the whole way
       down from the landing page's footer. */
    if (!hash) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/terms" element={<Legal blocks={TERMS_BLOCKS} name="Terms & Conditions" />} />
        <Route path="/privacy" element={<Legal blocks={PRIVACY_BLOCKS} name="Privacy Policy" />} />
        {/* Given to Play Console as the account deletion URL, so it must stay
            reachable at this exact path for as long as the app is listed. */}
        <Route path="/delete-account" element={<Legal blocks={DELETE_ACCOUNT_BLOCKS} name="Delete Account" />} />

        <Route path="/pay" element={<Pay />} />
        <Route path="/pay/result" element={<PayResult />} />
        {/* Inert without an injected token, so it is safe to route publicly. */}
        <Route path="/manage" element={<Manage />} />

        {/* Shared-link targets. `invite` is a static segment and must be
            declared before the dynamic `:id` so it is not swallowed by it —
            the same ordering the app relies on in app/portfolio/. */}
        <Route path="/portfolio/invite" element={<OpenInApp kind="invite" />} />
        <Route path="/portfolio/:id" element={<OpenInApp kind="post" />} />

        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}
