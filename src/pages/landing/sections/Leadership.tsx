import { useRef, useState } from 'react';
import { STORIES } from '../data/stories';

const STORY_TABS = ['The challenge', 'The mission', 'The possibility'];

export default function Leadership() {
  const [story, setStory] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const show = (i: number, focus = false) => {
    const next = (i + STORIES.length) % STORIES.length;
    setStory(next);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    show(i + (e.key === 'ArrowRight' ? 1 : -1), true);
  };

  return (
    <section className="section leaders" id="leadership" aria-labelledby="leaders-title">
      <div className="container">
        <div className="section-top center reveal">
          <div className="eyebrow">MEET OUR LEADERSHIP</div>
          <h2 className="h2" id="leaders-title">
            The people behind
            <br />
            the <span className="accent">vision.</span>
          </h2>
          <p className="section-copy">
            CAMROO PRO PRIVATE LIMITED — a founder-led company with a mission to connect the
            creative world.
          </p>
        </div>
        <div className="founder-story reveal" aria-labelledby="story-title">
          <div className="founder-story-top">
            <span className="micro">THE THINKING BEHIND CAMROO</span>
            <span className="story-serial" id="story-count">
              {String(story + 1).padStart(2, '0')} / 03
            </span>
          </div>
          <h3 id="story-title">
            More than a platform. <span className="accent">A shared ambition.</span>
          </h3>
          <div className="story-grid">
            <div
              className="story-buttons"
              role="tablist"
              aria-label="Explore CAMROO founding vision"
            >
              {STORY_TABS.map((label, i) => (
                <button
                  key={label}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`story-tab-${i}`}
                  aria-controls="story-panel"
                  aria-selected={i === story}
                  data-story={String(i)}
                  className={i === story ? 'story-button active' : 'story-button'}
                  tabIndex={i === story ? 0 : -1}
                  onClick={() => show(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  <span>{String(i + 1).padStart(2, '0')}</span> {label}
                </button>
              ))}
            </div>
            <div
              className="story-panel"
              id="story-panel"
              role="tabpanel"
              aria-labelledby={`story-tab-${story}`}
              tabIndex={0}
            >
              <span className="story-kicker" id="story-kicker">
                {STORIES[story][0]}
              </span>
              <p id="story-text">{STORIES[story][1]}</p>
              <span className="story-credit">CAMROO's perspective · Not a founder quotation</span>
            </div>
          </div>
        </div>
        <div className="leaders-grid">
          <article className="leader-card reveal">
            <div className="leader-photo">
              <img
                src="/site-assets/pankaj.webp"
                alt="Pankaj Sudam Lokhande, CEO and Founder of CAMROO"
                width="1086"
                height="1448"
                loading="eager"
              />
            </div>
            <div className="leader-text">
              <span className="micro">01 / LEADERSHIP</span>
              <h3>
                Pankaj
                <br />
                Lokhande
              </h3>
              <span className="title">CEO &amp; Founder</span>
              <p>Driving the vision for a more connected creative industry.</p>
            </div>
          </article>
          <article className="leader-card reveal">
            <div className="leader-photo">
              <img
                src="/site-assets/shubham.webp"
                alt="Shubham Raut, COO and Co-founder of CAMROO"
                width="923"
                height="1280"
                loading="eager"
              />
            </div>
            <div className="leader-text">
              <span className="micro">02 / LEADERSHIP</span>
              <h3>
                Shubham
                <br />
                Raut
              </h3>
              <span className="title">COO &amp; Co-founder</span>
              <p>Helping turn CAMROO's vision into meaningful action.</p>
            </div>
          </article>
        </div>
        <p className="leader-note">
          The founder portraits above are the original photos provided by CAMROO. The cinematic
          workspace imagery elsewhere on this page is AI-generated concept art, not actual office
          photography.
        </p>
      </div>
    </section>
  );
}
