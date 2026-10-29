import { useEffect } from 'react';
import { prefersReducedMotion } from './useLandingChrome';

/** Resting angles, matching the handoff's resetTilt(). */
const REST = { rx: '-8deg', ry: '15deg' };
const FOCUSED = { rx: '4deg', ry: '-13deg' };

/**
 * The hero emblem's pointer-tracked 3D tilt.
 *
 * Writes --rx/--ry straight onto the .brand-depth element rather than going
 * through React state: this fires on every pointermove, and re-rendering the
 * hero at that rate to change two custom properties would drop frames for no
 * benefit. The CSS consumes the variables; nothing else reads them.
 *
 * Skipped for touch pointers and when the OS asks for reduced motion, both as
 * in the original — on a touchscreen a tilt that follows taps reads as a bug.
 */
export function useBrandTilt() {
  useEffect(() => {
    const universe = document.getElementById('brand-universe');
    const depth = universe?.querySelector<HTMLElement>('.brand-depth');
    if (!universe || !depth) return;

    const setTilt = (rx: string, ry: string) => {
      depth.style.setProperty('--rx', rx);
      depth.style.setProperty('--ry', ry);
    };
    const reset = () => setTilt(REST.rx, REST.ry);

    const onPointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion() || e.pointerType === 'touch') return;
      const r = universe.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setTilt(`${-y * 21}deg`, `${x * 26}deg`);
    };

    const onFocus = () => {
      if (!prefersReducedMotion()) setTilt(FOCUSED.rx, FOCUSED.ry);
    };

    universe.addEventListener('pointermove', onPointerMove);
    universe.addEventListener('pointerleave', reset);
    universe.addEventListener('focus', onFocus);
    universe.addEventListener('blur', reset);
    /*
     * Deliberately NOT reset on mount. The handoff leaves --rx/--ry unset until
     * the first pointerleave, so the emblem's resting angle comes from the CSS;
     * setting them here would start it at a slightly different tilt.
     */

    return () => {
      universe.removeEventListener('pointermove', onPointerMove);
      universe.removeEventListener('pointerleave', reset);
      universe.removeEventListener('focus', onFocus);
      universe.removeEventListener('blur', reset);
    };
  }, []);
}
