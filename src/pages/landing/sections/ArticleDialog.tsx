import { useEffect, useRef } from 'react';
import { ARTICLES } from '../data/articles';

interface Props {
  article: string | null;
  onClose: () => void;
}

/**
 * The Learn topic preview. Uses the native <dialog> element exactly as the
 * handoff does — showModal() brings the browser's own focus trap and backdrop,
 * which is why there is no custom overlay here.
 */
export default function ArticleDialog({ article, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (article && typeof el.showModal === 'function' && !el.open) el.showModal();
    if (!article && el.open) el.close();
  }, [article]);

  // Esc closes the dialog natively; keep React's state in step with that.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('close', onClose);
    return () => el.removeEventListener('close', onClose);
  }, [onClose]);

  const content = article ? ARTICLES[article] : null;

  return (
    <dialog
      className="dialog"
      id="article-dialog"
      aria-labelledby="dialog-title"
      ref={ref}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === ref.current) onClose();
      }}
    >
      <button className="dialog-close" id="dialog-close" aria-label="Close preview" onClick={onClose}>
        ×
      </button>
      <div className="dialog-inner">
        <div className="eyebrow">CAMROO LEARN · TOPIC PREVIEW</div>
        <h3 id="dialog-title">{content ? content.title : 'Topic'}</h3>
        <p id="dialog-body">{content ? content.body : ''}</p>
        <p className="micro" style={{ color: '#e5ae43', letterSpacing: '.09em' }}>
          Full educational article coming later
        </p>
        <button className="btn btn-outline" type="button" id="dialog-done" onClick={onClose}>
          Close preview
        </button>
      </div>
    </dialog>
  );
}
