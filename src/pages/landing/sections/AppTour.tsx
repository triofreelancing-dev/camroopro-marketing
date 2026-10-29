import { useEffect, useRef, useState } from 'react';
import { TOUR_SCREENS } from '../data/tourScreens';
import { prefersReducedMotion } from '../useLandingChrome';

const TABS = [
  { num: '01', title: 'Creator Profile', sub: 'Build your professional identity' },
  { num: '02', title: 'Discover Talent', sub: 'Explore other creative specialties' },
  { num: '03', title: 'Opportunities', sub: 'Find collaborators for projects' },
  { num: '04', title: 'Gear Marketplace', sub: 'Discover creative equipment' },
];

const AUTOPLAY_MS = 4200;
/** Length of the .changing fade before the screen swaps, as in the handoff. */
const SWAP_DELAY_MS = 140;

export default function AppTour() {
  const [index, setIndex] = useState(0);
  const [screen, setScreen] = useState(0);
  const [changing, setChanging] = useState(false);
  const [playing, setPlaying] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /*
   * `index` flips immediately so the tab highlight responds at once, while
   * `screen` — the markup inside the phone — lags by the fade. Two pieces of
   * state rather than one because the original deliberately separates them:
   * the tab is instant, the screen cross-fades.
   */
  useEffect(() => {
    if (screen === index) return;
    setChanging(true);
    const t = setTimeout(
      () => {
        setScreen(index);
        setChanging(false);
      },
      prefersReducedMotion() ? 0 : SWAP_DELAY_MS
    );
    return () => clearTimeout(t);
  }, [index, screen]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % TABS.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing]);

  // Pausing when the tab is hidden keeps a background tab from burning frames.
  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, []);

  const go = (n: number, focus = false) => {
    const next = (n + TABS.length) % TABS.length;
    setIndex(next);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    go(index + (e.key === 'ArrowRight' ? 1 : -1), true);
    setPlaying(false);
  };

  return (
    <section className="section app-tour" id="app-tour" aria-labelledby="app-title">
      <div className="container">
        <div className="tour-top reveal">
          <div>
            <div className="eyebrow">THE PLATFORM, VISUALIZED</div>
            <h2 className="h2" id="app-title">
              See what a connected
              <br />
              <span className="accent">creative world</span> could feel like.
            </h2>
          </div>
          <p className="section-copy">
            Explore four representative CAMROO workflows. This interactive demonstration shows
            design concepts; real app screenshots will replace these previews when supplied.
          </p>
        </div>
        <div className="tour-layout">
          <div
            className="tour-options reveal"
            role="tablist"
            aria-label="CAMROO product concept screens"
          >
            {TABS.map((tab, i) => (
              <button
                key={tab.num}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                className={i === index ? 'tour-tab active' : 'tour-tab'}
                role="tab"
                aria-selected={i === index}
                id={`screen-tab-${i}`}
                aria-controls="screen-panel"
                data-screen={String(i)}
                tabIndex={i === index ? 0 : -1}
                onClick={() => {
                  go(i);
                  setPlaying(false);
                }}
                onKeyDown={onTabKeyDown}
              >
                <span className="tour-tab-num">{tab.num}</span>
                <span>
                  <strong>{tab.title}</strong>
                  <small>{tab.sub}</small>
                </span>
                <span className="tour-tab-arrow">↗</span>
              </button>
            ))}
            <div className="tour-controls">
              <button
                type="button"
                className="tour-play"
                id="tour-play"
                aria-pressed={playing}
                aria-label="Play automatic screen walkthrough"
                onClick={() => setPlaying((p) => (p ? false : !prefersReducedMotion()))}
              >
                {playing ? (
                  <>
                    Ⅱ <span>Pause tour</span>
                  </>
                ) : (
                  <>
                    ▶ <span>Auto play</span>
                  </>
                )}
              </button>
              <span className="tour-progress" aria-live="off">
                <b id="screen-index">{String(index + 1).padStart(2, '0')}</b> / 04
              </span>
              <button
                type="button"
                className="tour-next"
                id="tour-next"
                aria-label="Next app concept screen"
                onClick={() => {
                  go(index + 1);
                  setPlaying(false);
                }}
              >
                Next <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <div
            className="phone-zone reveal"
            id="screen-panel"
            role="tabpanel"
            aria-labelledby={`screen-tab-${index}`}
            tabIndex={0}
          >
            <div className="phone-halo" aria-hidden="true"></div>
            <div
              className="phone-frame"
              id="phone-frame"
              aria-label="Animated conceptual CAMROO app interface"
            >
              <div className="phone-screen">
                <div className="phone-status">
                  <span>9:41</span>
                  <span>●●● ▰</span>
                </div>
                {/* Static author-written markup from the handoff, not user input. */}
                <div
                  className={changing ? 'phone-content changing' : 'phone-content'}
                  id="phone-content"
                  aria-live="polite"
                  dangerouslySetInnerHTML={{ __html: TOUR_SCREENS[screen] }}
                />
                <div className="phone-bottom">
                  <span>
                    ⌂<small>Home</small>
                  </span>
                  <span>
                    ◇<small>Discover</small>
                  </span>
                  <span>
                    ＋<small>Create</small>
                  </span>
                  <span>
                    ◯<small>Profile</small>
                  </span>
                </div>
              </div>
            </div>
            <span className="phone-concept-label">
              INTERACTIVE UI CONCEPT · NOT A LIVE APP SCREENSHOT
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
