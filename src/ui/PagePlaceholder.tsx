import type { ReactNode } from 'react';

export function PagePlaceholder({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-[28px] font-bold leading-[34px]">{title}</h1>
      <p className="mt-3 text-muted">{body}</p>
      {children}
    </section>
  );
}
