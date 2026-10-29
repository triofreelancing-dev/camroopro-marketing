export default function Manifesto() {
  return (
    <>
      <section className="section manifesto" id="about" aria-labelledby="about-title">
        <div className="container manifesto-layout">
          <div className="manifesto-media reveal"><img src="/site-assets/about.webp" loading="eager" width="1122" height="1402" alt="Conceptual CAMROO creative studio meeting with the entire CAMROO name visible on the back wall" /><span className="media-caption">A creative world, imagined for CAMROO</span></div>
          <div className="reveal"><div className="eyebrow">MORE THAN AN APP</div><h2 className="manifesto-quote" id="about-title">Great work happens when <span className="accent">creative minds connect.</span></h2><p className="manifesto-text">The creative industry has extraordinary talent — but the right connections aren't always easy to make. CAMROO's vision is to bring creators, teams and opportunities closer in one professional ecosystem.</p><div className="benefit-list"><div><b>✓</b> An identity built around your creative craft</div><div><b>✓</b> A community that understands your work</div><div><b>✓</b> New possibilities through connection</div></div><div className="actions"><a className="btn btn-outline" href="#experience">See the CAMROO approach <span className="btn-icon">↗</span></a></div></div>
        </div>
      </section>
    </>
  );
}
