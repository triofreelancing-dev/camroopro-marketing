import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
/*
 * The client's V5.1 design system, lifted verbatim from the handoff's inlined
 * <style>. Imported AFTER index.css so its global element rules win over
 * Tailwind's preflight — this IS the site's palette, type scale and motion now,
 * not a theme layered over the old one.
 */
import './styles/camroo.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
