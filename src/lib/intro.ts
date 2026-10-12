const KEY = 'ai-factory-intro-seen';

/** The intro shows on the first visit only. Storage can throw (private windows), so every access is guarded. */
export function introSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}
