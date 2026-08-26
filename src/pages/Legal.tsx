import type { LegalBlock } from '../legal/types';

/**
 * Renders the Terms or Privacy blocks extracted from the app.
 *
 * Kept as data + one renderer rather than hand-written JSX so the site cannot
 * drift from what users actually agreed to in the app.
 */
export default function Legal({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <a href="/" className="text-sm font-semibold text-gold">
        &larr; Camaroo
      </a>
      <div className="mt-8">
        {blocks.map((block, i) => {
          if (block.kind === 'title') {
            return (
              <h1 key={i} className="mb-4 text-2xl font-bold leading-snug">
                {block.text}
              </h1>
            );
          }
          if (block.kind === 'heading') {
            return (
              <h2 key={i} className="mb-2 mt-8 text-lg font-bold">
                {block.text}
              </h2>
            );
          }
          return (
            <div key={i} className="mb-6 space-y-3 text-sm leading-relaxed opacity-80">
              {block.text.split('\n\n').map((para, j) => (
                <p key={j} className="whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </main>
  );
}
