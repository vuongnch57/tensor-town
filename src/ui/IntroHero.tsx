import { useNavigate } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { markIntroSeen } from '@/lib/intro';
import { useFactoryStore } from '@/state/useFactoryStore';

/** First-visit welcome on the home page: says what the site is for, with the town visible behind it. */
export function IntroHero() {
  const open = useFactoryStore((s) => s.introOpen);
  const setOpen = useFactoryStore((s) => s.setIntroOpen);
  const navigate = useNavigate();
  if (!open) return null;
  const close = () => {
    markIntroSeen();
    setOpen(false);
  };
  const t = chrome.intro;
  return (
    <section aria-labelledby="intro-title" className="absolute left-1/2 top-4 z-20 max-h-[calc(100%-32px)] w-[min(720px,calc(100%-32px))] -translate-x-1/2 overflow-auto rounded-lg border border-line bg-surface-200 px-6 py-5 shadow-panel max-sm:bottom-10 max-sm:top-auto max-sm:px-4 max-sm:py-4">
      <h1 id="intro-title" className="text-2xl font-semibold leading-8">{t.title}</h1>
      <p className="mb-4 mt-1.5 text-base leading-6 text-muted">{t.text}</p>
      <ul className="mb-4 grid gap-3 p-0 max-sm:hidden sm:grid-cols-3">
        {t.points.map((p) => (
          <li key={p.title} className="list-none rounded-md border border-line bg-surface-100 px-3.5 py-3">
            <h2 className="text-sm font-semibold">{p.title}</h2>
            <p className="m-0 mt-1 text-xs leading-5 text-muted">{p.text}</p>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={close} className="cursor-pointer rounded-md border border-accent bg-accent px-4 py-2 font-semibold text-accent-ink">
          {t.start}
        </button>
        <button
          type="button"
          onClick={() => {
            close();
            navigate('/index');
          }}
          className="cursor-pointer rounded-md border border-line bg-surface-300 px-4 py-2 font-semibold text-ink"
        >
          {t.index}
        </button>
      </div>
    </section>
  );
}
