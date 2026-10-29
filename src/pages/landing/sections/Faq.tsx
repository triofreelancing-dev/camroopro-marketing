import { useState } from 'react';
import { FAQ } from '../data/faq';

export default function Faq() {
  /* The handoff opens the first answer and toggles each independently — it is
     not an accordion that closes its siblings. */
  const [open, setOpen] = useState<Record<string, boolean>>({ 'faq-a1': true });

  return (
    <section className="section faqs" id="faq" aria-labelledby="faq-title">
      <div className="container faq-grid">
        <div className="reveal">
          <div className="eyebrow">QUESTIONS, ANSWERED</div>
          <h2 className="h2" id="faq-title">
            Curious about CAMROO?
          </h2>
          <p className="section-copy">
            Here's where to start. For specific questions, contact our team directly.
          </p>
        </div>
        <div className="faq-list reveal">
          {FAQ.map((item) => {
            const isOpen = !!open[item.id];
            return (
              <div className="faq-item" key={item.id}>
                <button
                  aria-expanded={isOpen}
                  aria-controls={item.id}
                  onClick={() => setOpen((o) => ({ ...o, [item.id]: !o[item.id] }))}
                >
                  {item.q}
                  <span className="plus" aria-hidden="true">
                    +
                  </span>
                </button>
                <p className="answer" id={item.id} hidden={!isOpen}>
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
