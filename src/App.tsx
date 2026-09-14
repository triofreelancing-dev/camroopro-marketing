import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Legal from './pages/Legal';
import OpenInApp from './pages/OpenInApp';
import Manage from './pages/Manage';
import Pay from './pages/Pay';
import PayResult from './pages/PayResult';
import { TERMS_BLOCKS } from './legal/terms';
import { PRIVACY_BLOCKS } from './legal/privacy';
import { DELETE_ACCOUNT_BLOCKS } from './legal/delete-account';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/terms" element={<Legal blocks={TERMS_BLOCKS} />} />
        <Route path="/privacy" element={<Legal blocks={PRIVACY_BLOCKS} />} />
        {/* Given to Play Console as the account deletion URL, so it must stay
            reachable at this exact path for as long as the app is listed. */}
        <Route path="/delete-account" element={<Legal blocks={DELETE_ACCOUNT_BLOCKS} />} />

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
