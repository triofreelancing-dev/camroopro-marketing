import { useRef, useState } from 'react';
import { AUDIENCE, type AudienceKey } from '../data/audience';

const KEYS: AudienceKey[] = ['creator', 'business'];

export default function Audience() {
  const [which, setWhich] = useState<AudienceKey>('creator');
  const content = AUDIENCE[which];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + KEYS.length) % KEYS.length;
    setWhich(KEYS[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <section className="section audience" id="experience" aria-labelledby="exp-title"><div className="container audience-layout"><div className="reveal"><div className="eyebrow">MADE FOR BOTH SIDES OF THE STORY</div><h2 className="h2" id="exp-title">One ecosystem.<br /><span className="accent">Two perspectives.</span></h2><div className="segment" role="tablist" aria-label="Choose your perspective"><button type="button" ref={(el) => { tabRefs.current[0] = el; }} role="tab" id="tab-creator" aria-selected={which === 'creator'} tabIndex={which === 'creator' ? 0 : -1} aria-controls="audience-panel" data-audience="creator" onClick={() => setWhich('creator')} onKeyDown={(e) => onTabKeyDown(e, 0)}>I'm a creator</button><button type="button" ref={(el) => { tabRefs.current[1] = el; }} role="tab" id="tab-business" aria-selected={which === 'business'} tabIndex={which === 'business' ? 0 : -1} aria-controls="audience-panel" data-audience="business" onClick={() => setWhich('business')} onKeyDown={(e) => onTabKeyDown(e, 1)}>I'm a business</button></div><div id="audience-panel" role="tabpanel" aria-labelledby={which === 'creator' ? 'tab-creator' : 'tab-business'} tabIndex={0}><h3 id="audience-title">{content.heading}</h3><p id="audience-body">{content.body}</p><ul className="audience-bullets" id="audience-list">{content.bullets.map((b) => (<li key={b}>{b}</li>))}</ul></div><a className="btn btn-primary" href="#contact">Connect with CAMROO <span className="btn-icon">↗</span></a></div><div className="audience-visual reveal"><div className="visual-window"><div className="window-top"><span></span><span></span><span></span><small style={{ marginLeft: "auto", color: "#5e7186", fontSize: "9px", letterSpacing: ".15em" }}>CAMROO · EXPERIENCE CONCEPT</small></div><div className="visual-title" id="mock-title">{content.mock}</div><div className="visual-sub" id="mock-sub">{content.sub}</div><div className="mock-row"><span className="mock-badge"></span><span><strong id="mock-row1">{content.rows[0]}</strong><small>Discover your community</small></span><span className="mock-pill">EXPLORE</span></div><div className="mock-row"><span className="mock-badge b"></span><span><strong id="mock-row2">{content.rows[1]}</strong><small>Connect across specialties</small></span><span className="mock-pill">EXPLORE</span></div><div className="mock-row"><span className="mock-badge c"></span><span><strong id="mock-row3">{content.rows[2]}</strong><small>Build better together</small></span><span className="mock-pill">EXPLORE</span></div><div className="mock-footer"><span>CONNECT • COLLABORATE • CREATE</span><span style={{ color: "#bd912d" }}>CAMROO</span></div></div><p className="product-disclaimer">Illustrative UI only. Not a screenshot of an actual app screen or a promise that every feature is released.</p></div></div></section>
    </>
  );
}
