import type { Zone, ZoneSlug } from './types';

export const zones: Zone[] = [
  { slug: 'gpu-hall', number: 1, title: 'GPU Hall', blurb: 'Why GPUs suit AI, what is inside one, and where its data comes from.' },
  { slug: 'packing-station', number: 2, title: 'Packing Station', blurb: 'Number formats as crate sizes, and how smaller crates fit more on a truck.' },
  { slug: 'dgx-building', number: 3, title: 'DGX Building', blurb: 'How GPUs are joined inside one machine: bridges, hubs and boards.' },
  { slug: 'transport-network', number: 4, title: 'Transport Network', blurb: 'Roads and rails that carry data between machines.' },
  { slug: 'storage-yard', number: 5, title: 'Storage Yard', blurb: 'Sheds and warehouses that keep training data close to the GPUs.' },
  { slug: 'production-line', number: 6, title: 'Production Line', blurb: 'The software stations that turn data into a trained and served model.' },
  { slug: 'control-room', number: 7, title: 'Control Room', blurb: 'Scheduling, sharing and monitoring a shared GPU cluster.' },
  { slug: 'power-cooling', number: 8, title: 'Power and Cooling', blurb: 'The facility that feeds and cools the factory.' },
  { slug: 'campus-expansion', number: 9, title: 'Campus Expansion', blurb: 'Growing from one building to a campus, owned or rented.' },
];

export const zoneBySlug = (slug: string): Zone | undefined => zones.find((z) => z.slug === slug);
export const isZoneSlug = (slug: string): slug is ZoneSlug => zones.some((z) => z.slug === slug);
