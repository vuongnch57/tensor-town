/** Text for the Index, Compare and About pages. */
export const indexText = {
  title: 'Index',
  intro: 'Every clickable item on the site. Choose one to see it in its district.',
  searchLabel: 'Filter the index',
  searchPlaceholder: 'Filter by name or category',
  groupBy: 'Group by',
  groupOptions: [
    { value: 'zone', label: 'Zone' },
    { value: 'az', label: 'A to Z' },
  ] as { value: 'zone' | 'az'; label: string }[],
  type: 'Type',
  typeOptions: [
    { value: 'all', label: 'All' },
    { value: 'object', label: 'Objects' },
    { value: 'concept', label: 'Concepts' },
  ] as { value: 'all' | 'object' | 'concept'; label: string }[],
  category: 'Category',
  allCategories: 'All categories',
  count: (n: number) => (n === 1 ? '1 item' : `${n} items`),
  none: 'Nothing matches these filters.',
  moreZones: 'The other districts add their items as they are built.',
  concept: 'Concept',
};

export const compareText = {
  title: 'Compare',
  intro: 'Concepts that are easy to mix up, side by side.',
  listLabel: 'Comparisons',
  whyConfused: 'Why people mix them up',
  inZone: (zone: string) => `See it in ${zone} ›`,
  unknown: 'That comparison does not exist. Pick one from the list.',
};

export const aboutText = {
  title: 'About',
  what: {
    title: 'What this is',
    body: [
      'AI Factory explains how the infrastructure behind AI fits together by turning it into a town. Each part of the AI factory is a part of the town, and they are joined by roads, rail, conveyors, pipes, cables and sensor lines, because in a real data center the parts depend on each other.',
      'The town is one scene. Choose a district to fly into it, then choose any numbered object to read what it is, how it works and how it differs from the things it is usually confused with.',
    ],
  },
  how: {
    title: 'How to use it',
    steps: [
      'Choose a numbered marker on the town, or a district in the menu, to fly into it.',
      'Inside a district, choose a numbered object in the scene or in the index on the left. The details appear on the right.',
      'Use the Simulate bar to see how workload, GPU and number format change what the hall is doing.',
      'Press / or open the menu to search every item and comparison.',
      'Follow the data on the town page walks along the connections in order.',
      'The Index lists everything. Compare puts easily confused concepts side by side.',
    ],
  },
  disclaimer: {
    title: 'Disclaimer',
    body: [
      'This is a personal learning project. It is not affiliated with, endorsed by or sponsored by NVIDIA. Product names appear only to say which hardware or software is meant.',
      'Numbers in the Simulate bar are illustrative, not measurements. Any value marked TODO(fact) has not been verified yet.',
      'All text is original.',
    ],
  },
  credits: {
    title: 'Credits',
    body: 'Built with React, three.js through react-three-fiber, Tailwind CSS and zustand. No third-party 3D assets are used yet; any CC0 asset added later is credited here.',
  },
};
