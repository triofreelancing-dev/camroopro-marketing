import { Link } from 'react-router-dom';
interface Props {
  hrefBase?: string;
}

export default function SiteFooter({ hrefBase = '' }: Props) {
  return (
    <>
      <footer className="footer"><div className="container"><div className="footgrid"><div className="foot-brand"><a href={hrefBase + '#top'} className="brand-link" aria-label="CAMROO home"><img src="/site-assets/logo-horizontal.png" alt="CAMROO — Connect, Collaborate, Create" width="310" height="90" loading="eager" /></a><p>Connecting the world of photography, filmmaking and creative storytelling.</p></div><div><h4>Explore</h4><a href={hrefBase + '#who'}>Who it's for</a><a href={hrefBase + '#about'}>Our story</a><a href={hrefBase + '#experience'}>The experience</a><a href={hrefBase + '#leadership'}>Leadership</a></div><div><h4>Discover</h4><a href={hrefBase + '#learn'}>CAMROO Learn</a><a href={hrefBase + '#faq'}>FAQs</a><a href={hrefBase + '#contact'}>Contact</a></div><div><h4>Company</h4><p>CAMROO PRO PRIVATE LIMITED</p><p>Pune, Maharashtra, India</p><a href="mailto:camrooproofficial@gmail.com">camrooproofficial@gmail.com</a><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms &amp; Conditions</Link></div></div><div className="foot-bottom"><span>© <span id="year">{new Date().getFullYear()}</span> CAMROO PRO PRIVATE LIMITED. All rights reserved.</span><span>Website concept · AI-generated workspace visualizations · Authentic CAMROO brand and leadership photos</span></div></div></footer>
    </>
  );
}
