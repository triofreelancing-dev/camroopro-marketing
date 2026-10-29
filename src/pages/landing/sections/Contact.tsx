function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return;
  const el = form.elements as typeof form.elements & {
    name: HTMLInputElement;
    email: HTMLInputElement;
    message: HTMLTextAreaElement;
  };
  const name = el.name.value.trim();
  const email = el.email.value.trim();
  const message = el.message.value.trim();
  const subject = encodeURIComponent('CAMROO website inquiry from ' + name);
  const body = encodeURIComponent(
    'Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message
  );
  window.location.href = 'mailto:camrooproofficial@gmail.com?subject=' + subject + '&body=' + body;
}

export default function Contact() {
  return (
    <>
      <section className="section contact" id="contact" aria-labelledby="contact-title"><div className="container contact-grid"><div className="reveal"><div className="eyebrow">LET'S CONNECT</div><h2 className="h2" id="contact-title">The next chapter<br />starts with a <span className="accent">conversation.</span></h2><p className="section-copy">Whether you're a creative professional, a studio, a potential partner or just curious about the CAMROO vision, we'd love to hear from you.</p><div className="contact-chips"><span>Creators</span><span>Studios</span><span>Partners</span><span>Business inquiries</span></div><p style={{ color: "#afc0d1", marginTop: "35px", fontSize: "13px" }}>Email: <a style={{ color: "var(--gold)", textDecoration: "underline", textUnderlineOffset: "4px" }} href="mailto:camrooproofficial@gmail.com">camrooproofficial@gmail.com</a></p></div><form className="form reveal" id="contact-form" onSubmit={handleSubmit}><h3>Send CAMROO a message.</h3><label htmlFor="full-name">Your name</label><input id="full-name" name="name" type="text" autoComplete="name" placeholder="Your full name" required maxLength={80} /><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={120} /><label htmlFor="message">What's on your mind?</label><textarea id="message" name="message" placeholder="Tell us a little about what you're looking for..." required minLength={8} maxLength={2500}></textarea><button className="btn btn-primary" type="submit">Compose email <span aria-hidden="true">↗</span></button><small>This prototype opens your email application with the details filled in. It does not submit or store your information on a server.</small></form></div></section>
    </>
  );
}
