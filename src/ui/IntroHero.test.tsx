// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { introSeen } from '@/lib/intro';
import { useFactoryStore } from '@/state/useFactoryStore';
import { IntroHero } from './IntroHero';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('IntroHero', () => {
  it('shows the purpose and closes for good on Start exploring', () => {
    act(() => useFactoryStore.getState().setIntroOpen(true));
    render(<MemoryRouter><IntroHero /></MemoryRouter>);
    expect(screen.getByText(chrome.intro.title)).toBeTruthy();
    fireEvent.click(screen.getByText(chrome.intro.start));
    expect(screen.queryByText(chrome.intro.title)).toBeNull();
    expect(introSeen()).toBe(true);
  });
  it('renders nothing when closed', () => {
    act(() => useFactoryStore.getState().setIntroOpen(false));
    const { container } = render(<MemoryRouter><IntroHero /></MemoryRouter>);
    expect(container.firstChild).toBeNull();
  });
});
