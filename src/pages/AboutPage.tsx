import { aboutText as t } from '@/content/pages';
import { chrome } from '@/content/chrome';

const h2 = 'm-0 text-xs font-semibold uppercase tracking-[0.06em] text-accent';

export function AboutPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-14 pt-20 md:px-6">
      <h1 className="m-0 text-[28px] font-bold leading-[34px]">{t.title}</h1>
      <section className="flex flex-col gap-3">
        <h2 className={h2}>{t.what.title}</h2>
        {t.what.body.map((p) => (
          <p key={p} className="m-0 text-[15px] leading-6">{p}</p>
        ))}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className={h2}>{t.how.title}</h2>
        <ol className="m-0 flex flex-col gap-2 pl-5 text-[15px] leading-6">
          {t.how.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className={h2}>{t.disclaimer.title}</h2>
        <p className="m-0 rounded-md border border-line bg-surface-200 px-4 py-3 text-[15px] leading-6">{chrome.footer}</p>
        {t.disclaimer.body.map((p) => (
          <p key={p} className="m-0 text-[15px] leading-6">{p}</p>
        ))}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className={h2}>{t.credits.title}</h2>
        <p className="m-0 text-[15px] leading-6">{t.credits.body}</p>
      </section>
    </section>
  );
}
