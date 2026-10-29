import { useRef, useState } from 'react';
import { NETWORK_ROLES } from '../data/networkRoles';

export default function Network() {
  const [node, setNode] = useState(0);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    const next = (i + NETWORK_ROLES.length) % NETWORK_ROLES.length;
    setNode(next);
    if (focus) nodeRefs.current[next]?.focus();
  };

  const onNodeKeyDown = (e: React.KeyboardEvent, i: number) => {
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!forward && !back) return;
    e.preventDefault();
    select(i + (forward ? 1 : -1), true);
  };

  return (
    <>
      <section className="section network-section" id="network" aria-labelledby="network-title">
        <div className="container network-layout">
          <div className="network-intro reveal">
            <div className="eyebrow">THE CREATIVE NETWORK</div>
            <h2 className="h2" id="network-title">Different crafts.<br /><span className="accent">One connection.</span></h2>
            <p className="section-copy">Photography is never a one-person universe. Explore how CAMROO envisions connecting creative specialities across a shared ecosystem.</p>
            <div className="network-detail" aria-live="polite" aria-atomic="true">
              <span className="network-step" id="network-step">{String(node + 1).padStart(2, '0')} / 06 · SELECT A CRAFT</span>
              <h3 id="network-role">{NETWORK_ROLES[node][0]}</h3>
              <p id="network-description">{NETWORK_ROLES[node][1]}</p>
              <a className="network-link" href="#app-tour">See the product concept <span aria-hidden="true">↗</span></a>
            </div>
            <p className="network-instruction">Select a node to discover its role in the network.</p>
          </div>
          <div className="network-shell reveal" id="network-shell">
            <div className="network-shell-head"><span><i></i> CAMROO CONNECTION MAP</span><span>CONCEPT VISUALIZATION · LIVE INTERACTION</span></div>
            <div className="network-viz" aria-label="Interactive map of creative professions">
              <svg className="network-lines" viewBox="0 0 640 560" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="beam" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#1c518c" stopOpacity=".2" /><stop offset=".6" stopColor="#f7b632" stopOpacity=".9" /><stop offset="1" stopColor="#ec9e20" stopOpacity=".25" /></linearGradient></defs>
                <g className="network-base-lines"><path d="M320 280 L126 104" /><path d="M320 280 L490 95" /><path d="M320 280 L545 285" /><path d="M320 280 L460 467" /><path d="M320 280 L155 465" /><path d="M320 280 L75 285" /><path d="M126 104 L490 95 L545 285 L460 467 L155 465 L75 285 Z" /></g>
                <g className="network-hot-lines"><path data-line="0" className={node === 0 ? 'active' : undefined} d="M320 280 L126 104" /><path data-line="1" className={node === 1 ? 'active' : undefined} d="M320 280 L490 95" /><path data-line="2" className={node === 2 ? 'active' : undefined} d="M320 280 L545 285" /><path data-line="3" className={node === 3 ? 'active' : undefined} d="M320 280 L460 467" /><path data-line="4" className={node === 4 ? 'active' : undefined} d="M320 280 L155 465" /><path data-line="5" className={node === 5 ? 'active' : undefined} d="M320 280 L75 285" /></g>
              </svg>
              <div className="network-center" aria-hidden="true"><img src="/site-assets/logo-symbol.png" alt="" width="540" height="482" /><small>CAMROO</small></div>
              <button type="button" ref={(el) => { nodeRefs.current[0] = el; }} className={node === 0 ? 'network-node selected' : 'network-node'} style={{ '--x': "19.7%", '--y': "18.6%" } as React.CSSProperties} data-node="0" aria-pressed={node === 0} onClick={() => select(0)} onKeyDown={(e) => onNodeKeyDown(e, 0)}><span className="node-bullet"></span><span>Photographers</span></button>
              <button type="button" ref={(el) => { nodeRefs.current[1] = el; }} className={node === 1 ? 'network-node selected' : 'network-node'} style={{ '--x': "76.6%", '--y': "17%" } as React.CSSProperties} data-node="1" aria-pressed={node === 1} onClick={() => select(1)} onKeyDown={(e) => onNodeKeyDown(e, 1)}><span className="node-bullet"></span><span>Filmmakers</span></button>
              <button type="button" ref={(el) => { nodeRefs.current[2] = el; }} className={node === 2 ? 'network-node selected' : 'network-node'} style={{ '--x': "85.2%", '--y': "50.9%" } as React.CSSProperties} data-node="2" aria-pressed={node === 2} onClick={() => select(2)} onKeyDown={(e) => onNodeKeyDown(e, 2)}><span className="node-bullet"></span><span>Editors</span></button>
              <button type="button" ref={(el) => { nodeRefs.current[3] = el; }} className={node === 3 ? 'network-node selected' : 'network-node'} style={{ '--x': "71.9%", '--y': "83.4%" } as React.CSSProperties} data-node="3" aria-pressed={node === 3} onClick={() => select(3)} onKeyDown={(e) => onNodeKeyDown(e, 3)}><span className="node-bullet"></span><span>Drone Pilots</span></button>
              <button type="button" ref={(el) => { nodeRefs.current[4] = el; }} className={node === 4 ? 'network-node selected' : 'network-node'} style={{ '--x': "24.2%", '--y': "83%" } as React.CSSProperties} data-node="4" aria-pressed={node === 4} onClick={() => select(4)} onKeyDown={(e) => onNodeKeyDown(e, 4)}><span className="node-bullet"></span><span>Designers</span></button>
              <button type="button" ref={(el) => { nodeRefs.current[5] = el; }} className={node === 5 ? 'network-node selected' : 'network-node'} style={{ '--x': "11.7%", '--y': "50.9%" } as React.CSSProperties} data-node="5" aria-pressed={node === 5} onClick={() => select(5)} onKeyDown={(e) => onNodeKeyDown(e, 5)}><span className="node-bullet"></span><span>Studios</span></button>
            </div>
            <div className="network-foot"><span>01 // HUMAN CREATIVITY</span><span>∞ // POSSIBLE CONNECTIONS</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
