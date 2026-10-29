export default function Hero() {
  return (
    <>
      <section className="hero hero-v3" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true"></div>
        <div className="hero-tech-grid" aria-hidden="true"></div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="hero-overline"><i></i> INDIA'S CREATIVE FUTURE IS CONNECTING</div>
            <h1 id="hero-title">Your Creative<br />World.<br /><em>Connected.</em></h1>
            <p className="hero-lead">One place to imagine a more connected creative industry. Discover the CAMROO vision for photographers, filmmakers, editors, and the people behind every frame.</p>
            <div className="actions"><a className="btn btn-primary" href="#network">Explore the ecosystem <span className="btn-icon" aria-hidden="true">↗</span></a><a className="btn btn-outline" href="#app-tour">See the experience <span className="btn-icon" aria-hidden="true">→</span></a></div>
            <div className="hero-caption">CONNECT <span className="accent">•</span> COLLABORATE <span className="accent">•</span> CREATE</div>
          </div>
          <div className="brand-universe" id="brand-universe" aria-label="CAMROO emblem in an interactive three dimensional scene" tabIndex={0}>
            <span className="orbit-caption orbit-caption-top">CREATIVE CONNECTIONS / 01</span>
            <div className="orbit-field" aria-hidden="true">
              <div className="orbit-ring orbit-one"></div><div className="orbit-ring orbit-two"></div><div className="orbit-ring orbit-three"></div>
              <span className="orb orb-1"></span><span className="orb orb-2"></span><span className="orb orb-3"></span><span className="orb orb-4"></span>
              <div className="brand-depth"><div className="brand-halo"></div><div className="brand-back"></div><img className="brand-emblem" src="/site-assets/logo-symbol.png" alt="" width="540" height="482" /></div>
            </div>
            <span className="orbit-caption orbit-caption-bottom"><span className="pulse-dot"></span> INTERACTIVE BRAND OBJECT <span className="motion-hint">· MOVE POINTER</span></span>
          </div>
        </div>
        <a className="scrollcue" href="#network"><span aria-hidden="true"></span> Scroll to connect</a>
      </section>
    </>
  );
}
