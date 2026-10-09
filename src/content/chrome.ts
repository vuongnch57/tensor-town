/** Site-wide text that is not part of a zone: header, footer, menu, town page, page placeholders. */
export const chrome = {
  siteName: 'AI Factory',
  footer: 'Personal project, not affiliated with NVIDIA. Simulated numbers are illustrative.',
  townHint: 'Choose a numbered marker to fly into a district',
  backToTown: '‹ Back to town',
  menu: {
    open: 'Menu',
    close: 'Close menu',
    searchPlaceholder: 'Search a district',
    searchLabel: 'Search',
    noMatch: 'Nothing matches. Search across items and comparisons arrives in a later phase.',
    districts: 'Districts',
    pages: 'Pages',
    connections: 'Show connections',
    theme: 'Switch light / dark',
  },
  pages: { town: 'Town', index: 'Index', compare: 'Compare', about: 'About' },
  district: {
    connectedTo: 'Connected to',
    zone: 'Zone',
    soon: 'Objects, key facts and comparisons for this district arrive in a later phase.',
    explore: (n: number) => `Explore the ${n} objects ›`,
  },
  tour: { start: 'Follow the data', label: 'Follow the data', previous: '‹ Previous', next: 'Next ›', finish: 'Finish', exit: 'Exit', count: (i: number, n: number) => `${i} of ${n}` },
  fallback: 'Your browser cannot show the 3D town. Use the menu to open any district.',
  loading: 'Loading the town…',
  placeholders: {
    index: { title: 'Index', body: 'Every clickable item on the site will be listed here in a later phase.' },
    compare: { title: 'Compare', body: 'Side-by-side comparisons arrive in a later phase.' },
    about: { title: 'About', body: 'What this site is, how to use it, disclaimer and credits arrive in a later phase.' },
  },
};
