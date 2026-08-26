/**
 * Landing target for shared links — /portfolio/{id} and /portfolio/invite.
 *
 * On a phone with the app installed, iOS Universal Links / Android App Links
 * open the app before this page ever renders, so this is what desktop visitors
 * and people without the app see.
 *
 * It deliberately shows no post content: `GET /portfolio/get-portfolio/:id` is
 * behind `jwtAuthorize`, so there is no public endpoint to read a post from,
 * and inventing one would make every shared link a data leak.
 */
export default function OpenInApp({ kind }: { kind: 'post' | 'invite' }) {
  const copy =
    kind === 'invite'
      ? {
          title: 'You have been invited to Camaroo',
          body: 'Install Camaroo and sign up with this link to claim the invite.',
        }
      : {
          title: 'View this on Camaroo',
          body: 'Install Camaroo to see this post and the rest of the photographer’s work.',
        };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 text-center">
      <p className="text-sm font-bold tracking-widest text-gold">CAMAROO</p>
      <h1 className="mt-4 text-2xl font-bold">{copy.title}</h1>
      <p className="mt-3 text-sm leading-relaxed opacity-70">{copy.body}</p>
      <div className="mt-8 flex flex-col gap-3">
        <a
          href="https://play.google.com/store"
          className="rounded-xl bg-gold py-3.5 text-sm font-bold text-white"
        >
          Get it on Android
        </a>
        <a
          href="https://apps.apple.com"
          className="rounded-xl border border-gold/40 py-3.5 text-sm font-bold text-gold"
        >
          Get it on iPhone
        </a>
      </div>
    </main>
  );
}
