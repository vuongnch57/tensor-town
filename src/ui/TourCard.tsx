import { chrome } from '@/content/chrome';
import { tourSteps } from '@/content/town';
import { useFactoryStore } from '@/state/useFactoryStore';

/** "Follow the data": steps through how one job moves across the connected districts. The scene highlights the matching connections. */
export function TourCard() {
  const step = useFactoryStore((s) => s.tourStep);
  const setStep = useFactoryStore((s) => s.setTourStep);
  if (step === null) return null;
  const s = tourSteps[step];
  const last = step === tourSteps.length - 1;
  const btn = 'cursor-pointer rounded-md border border-line bg-surface-300 px-3.5 py-1.5 font-semibold text-ink disabled:opacity-40';
  return (
    <section aria-live="polite" className="absolute bottom-10 left-1/2 z-20 w-[min(560px,calc(100%-32px))] -translate-x-1/2 rounded-lg border border-line bg-surface-200 px-5 py-4 shadow-panel">
      <div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{chrome.tour.label}</div>
      <h2 className="mt-0.5 text-xl font-semibold leading-7">{s.title}</h2>
      <p className="mb-3 mt-1 text-sm leading-5 text-muted">{s.text}</p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={step === 0} onClick={() => setStep(step - 1)}>{chrome.tour.previous}</button>
        <button type="button" className="cursor-pointer rounded-md border border-accent bg-accent px-3.5 py-1.5 font-semibold text-accent-ink" onClick={() => setStep(last ? null : step + 1)}>
          {last ? chrome.tour.finish : chrome.tour.next}
        </button>
        <button type="button" className={btn} onClick={() => setStep(null)}>{chrome.tour.exit}</button>
        <span className="ml-auto text-xs text-muted">{chrome.tour.count(step + 1, tourSteps.length)}</span>
      </div>
    </section>
  );
}
