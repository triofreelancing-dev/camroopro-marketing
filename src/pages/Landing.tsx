const FEATURES = [
  { title: 'Portfolio', body: 'Publish your work as photo and video posts, and let clients find you by what you shoot.' },
  { title: 'Discover talent', body: 'Search photographers, videographers and cinematographers by role, city and availability.' },
  { title: 'Gear marketplace', body: 'Buy, sell and rent camera gear with people who actually know what it is worth.' },
  { title: 'Opportunities', body: 'Post a shoot or apply to one, with dates, budget and requirements in the open.' },
  { title: 'Courses', body: 'Learn from working professionals, with certificates when you finish.' },
  { title: 'Quotations', body: 'Generate branded quotations and bills from your own business details.' },
];

export default function Landing() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto max-w-5xl px-6 pt-10">
        <p className="text-sm font-bold tracking-widest text-gold">CAMAROO</p>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          The professional network for people behind the camera.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed opacity-70">
          Camaroo is where photographers, videographers and cinematographers build a
          portfolio, find work, hire each other, and trade gear.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://play.google.com/store"
            className="rounded-xl bg-gold px-6 py-3 text-sm font-bold text-white"
          >
            Get it on Android
          </a>
          <a
            href="https://apps.apple.com"
            className="rounded-xl border border-gold/40 px-6 py-3 text-sm font-bold text-gold"
          >
            Get it on iPhone
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-black/5 p-6 dark:border-white/10"
            >
              <h2 className="text-base font-bold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed opacity-70">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 text-sm opacity-70">
          <span>CAMROO Pro, Pune, Maharashtra, India</span>
          <a href="/terms" className="font-semibold text-gold">Terms</a>
          <a href="/privacy" className="font-semibold text-gold">Privacy</a>
          <a href="mailto:support@camroopro.com" className="font-semibold text-gold">Support</a>
        </div>
      </footer>
    </div>
  );
}
