import { useEffect, useRef, useState } from 'react';

const NAV: [string, string][] = [
  ['#network', 'The network'],
  ['#about', 'Our vision'],
  ['#app-tour', 'App concept'],
  ['#leadership', 'Leadership'],
  ['#learn', 'Learn'],
  ['#contact', 'Contact'],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  /*
   * body.menu-open is what the CSS uses to lock scrolling behind the mobile
   * sheet, so it has to be a real class on <body> rather than local state.
   */
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !e.composedPath().includes(headerRef.current)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  return (
    <header className={open ? 'header open' : 'header'} id="header" ref={headerRef}>
      <div className="container navwrap">
        <a className="brand-link" href="#top" aria-label="CAMROO home">
          <img
            className="brand-logo"
            src="/site-assets/logo-horizontal.png"
            alt="CAMROO — Connect, Collaborate, Create"
            width="225"
            height="52"
          />
        </a>
        <nav
          className={open ? 'navlinks open' : 'navlinks'}
          id="navlinks"
          aria-label="Primary navigation"
        >
          {NAV.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <a className="btn btn-primary nav-cta" href="#contact">
          Get in touch <span aria-hidden="true">↗</span>
        </a>
        <button
          className="navtoggle"
          id="navtoggle"
          aria-controls="navlinks"
          aria-expanded={open}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d={open ? 'M5 5l14 14M19 5 5 19' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>
    </header>
  );
}
