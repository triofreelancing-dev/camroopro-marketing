import { useEffect } from 'react';

/**
 * The page-level behaviours from the handoff's first two script blocks: the
 * `js` flag, reveal-on-scroll, and the scroll-driven chrome.
 *
 * These stay as effects rather than React state on purpose. They read scroll
 * position and intersection on every frame and write a class or a width — state
 * would re-render fourteen sections per scroll tick to change one attribute.
 * Everything a user actually interacts with (tabs, accordion, dialog, nav) IS
 * state, in its own component.
 */
export function useLandingChrome() {
  useEffect(() => {
    /*
     * Gates the animation in CSS: `.js .reveal` starts hidden and is revealed by
     * `.is-visible`, while a page without this class shows every section
     * outright. Added here rather than in index.html so it is never set on a
     * route that has no reveal targets.
     */
    const root = document.documentElement;
    root.classList.add('js');
    return () => root.classList.remove('js');
  }, []);

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.reveal');

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px 50px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const header = document.getElementById('header');
    const back = document.getElementById('backtop');
    const bar = document.getElementById('scrollbar');
    if (!header || !back || !bar) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        header.classList.toggle('scrolled', y > 25);
        back.classList.toggle('visible', y > 550);
        const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        bar.style.width = ((100 * y) / scrollable).toFixed(2) + '%';
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/** Honours the OS setting the same way the handoff's script does. */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
}
