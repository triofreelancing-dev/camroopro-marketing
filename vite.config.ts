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

export default defineConfig({
  plugins: [react(), tailwindcss(), razorpayCallbackDevRoute()],
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
