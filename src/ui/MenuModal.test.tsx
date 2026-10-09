import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MenuModal, matchDistricts } from './MenuModal';
import { HamburgerButton } from './HamburgerButton';
import { useFactoryStore } from '@/state/useFactoryStore';

afterEach(() => {
  cleanup();
  useFactoryStore.setState({ menuOpen: false, hiddenGroups: [], tourStep: null });
});

describe('district search', () => {
  it('lists all nine districts for an empty query', () => expect(matchDistricts('')).toHaveLength(9));
  it('matches by district name, zone title or description', () => {
    expect(matchDistricts('harbour').map((d) => d.slug)).toEqual(['storage-yard']);
    expect(matchDistricts('gpu hall').map((d) => d.slug)).toEqual(['gpu-hall']);
    expect(matchDistricts('coolant').map((d) => d.slug)).toContain('power-cooling');
    expect(matchDistricts('zzzz')).toEqual([]);
  });
});

describe('hamburger and menu', () => {
  const setup = () =>
    render(
      <MemoryRouter>
        <HamburgerButton />
        <MenuModal />
      </MemoryRouter>,
    );
  it('opens from the hamburger button', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(useFactoryStore.getState().menuOpen).toBe(true);
  });
  it('lists the districts and the four pages', () => {
    useFactoryStore.setState({ menuOpen: true });
    setup();
    expect(screen.getAllByText(/^Zone \d ·/)).toHaveLength(9);
    for (const name of ['Town', 'Index', 'Compare', 'About']) expect(screen.getByRole('link', { name })).toBeTruthy();
  });
  it('toggles connection groups', () => {
    useFactoryStore.setState({ menuOpen: true });
    setup();
    fireEvent.click(screen.getByLabelText('Roads'));
    expect(useFactoryStore.getState().hiddenGroups).toEqual(['roads']);
    fireEvent.click(screen.getByLabelText('Roads'));
    expect(useFactoryStore.getState().hiddenGroups).toEqual([]);
  });
  it('closes from the close button', () => {
    useFactoryStore.setState({ menuOpen: true });
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(useFactoryStore.getState().menuOpen).toBe(false);
  });
});
