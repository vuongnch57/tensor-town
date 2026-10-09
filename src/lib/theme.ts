const KEY = 'ai-factory-theme';

/** Dark is the default (index.html). A saved choice wins. Storage can throw (private windows), so every access is guarded. */
export function initTheme(): void {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') document.documentElement.classList.toggle('dark', saved === 'dark');
  } catch {
    /* ignore */
  }
}

export function toggleTheme(): void {
  const dark = !document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
  } catch {
    /* ignore */
  }
}
