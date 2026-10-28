import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Stands in for `api/rzp-callback.ts` during local development.
 *
 * `vite dev` does not serve the `api/` directory at all — that is a Vercel
 * function and only exists in a deployment — so without this, redirect-mode
 * checkout 404s at the final step and the result never reaches the app.
 *
 * Kept as a deliberate duplicate of the real handler rather than importing it,
 * so the production function stays free of dev-server types. If you change one,
 * change the other.
 */
function razorpayCallbackDevRoute(): Plugin {
  return {
    name: 'razorpay-callback-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/rzp-callback', (req, res) => {
        let raw = '';
        req.on('data', (chunk) => {
          raw += chunk;
        });
        req.on('end', () => {
          const body = Object.fromEntries(new URLSearchParams(raw));
          const subscriptionId = body.razorpay_subscription_id ?? '';
          const paymentId = body.razorpay_payment_id ?? '';

          const params = new URLSearchParams({ status: paymentId ? 'success' : 'failed' });
          if (subscriptionId) params.set('subscription_id', subscriptionId);
          if (paymentId) params.set('payment_id', paymentId);

          console.log('[rzp-callback:dev]', req.method, body);

          // 303 so the browser turns Razorpay's POST into a GET on the result page.
          res.statusCode = 303;
          res.setHeader('Location', `/pay/result?${params.toString()}`);
          res.end();
        });
      });
    },
  };
}

/**
 * Serves the SPA shell for deep links during `vite dev`.
 *
 * `/` now belongs to the client's static landing page (public/index.html), so
 * the app shell moved to app.html — which means Vite's own HTML fallback would
 * hand a React route like /pay the landing page instead, and React would never
 * mount. Registered directly in configureServer (not in a returned post-hook)
 * so it runs BEFORE that fallback.
 *
 * Only rewrites HTML navigations; anything with a file extension, /api/, and
 * Vite's own /@ and /src/ paths are left alone.
 */
function spaFallbackToAppShell(): Plugin {
  return {
    name: 'spa-fallback-app-shell',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url ?? '/').split('?')[0];
        const isNavigation =
          req.method === 'GET' && (req.headers.accept ?? '').includes('text/html');
        const isAppRoute =
          path !== '/' &&
          !path.startsWith('/api/') &&
          !path.startsWith('/site-assets/') &&
          !path.startsWith('/@') &&
          !path.startsWith('/src/') &&
          !path.startsWith('/node_modules/') &&
          !/\.[a-z0-9]+$/i.test(path);

        if (isNavigation && isAppRoute) req.url = '/app.html';
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), razorpayCallbackDevRoute(), spaFallbackToAppShell()],
  /**
   * The SPA entry is app.html, not index.html: `/` is the client-supplied
   * static marketing page, which ships verbatim from public/ and is never built.
   */
  build: {
    rollupOptions: {
      input: 'app.html',
    },
  },
  server: {
    host: true,
    /**
     * Vite rejects requests whose Host header it does not recognise with
     * "Blocked request. This host is not allowed." — which is what a dev tunnel
     * would show instead of the site.
     */
    /* A leading dot matches the domain AND its subdomains, so this covers
       camroopro.com and www.camroopro.com. Only consulted by `vite dev` — a
       production build served statically never sees this list. */
    allowedHosts: ['.camroopro.com', '.devtunnels.ms', '.ngrok-free.app', '.ngrok.io'],
  },
});
