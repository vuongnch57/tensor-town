import type { ZoneSlug } from './types';

/** Town content (SPEC §2.1, §3.4 to §3.6): districts, connections and the guided tour. Geometry lives in three/town/layout.ts. */

export type District = {
  slug: ZoneSlug;
  number: number;
  name: string;
  /** What the district is in the town. */
  text: string;
};

export const districts: District[] = [
  { slug: 'gpu-hall', number: 1, name: 'Factory Quarter', text: 'The big production halls, with the HBM warehouse beside them. Everything else in the town exists to keep these halls fed, connected and cool.' },
  { slug: 'packing-station', number: 2, name: 'Packing Dock', text: 'Crates are resized here before they enter the factory. Smaller crates mean more fit on each truck.' },
  { slug: 'dgx-building', number: 3, name: 'Tower Block', text: 'Tall buildings with GPU rooms joined by sky-bridges and a central sorting hub.' },
  { slug: 'transport-network', number: 4, name: 'Gatehouse and Rail Yard', text: 'The town gate and mailroom. The roads and the private freight rail that tie every district together start here.' },
  { slug: 'storage-yard', number: 5, name: 'Harbour Depot', text: 'Warehouses, a cache shed next to the factory and a remote depot at the port.' },
  { slug: 'production-line', number: 6, name: 'Assembly Row', text: 'The line where models are built, packed and shipped to customers around the clock.' },
  { slug: 'control-room', number: 7, name: 'Control Tower', text: 'On the hill, with a view of the whole town. Sensors report from every district and the dispatcher schedules the work.' },
  { slug: 'power-cooling', number: 8, name: 'Power Station and River', text: 'The substation and chillers. The river carries coolant through the town.' },
  { slug: 'campus-expansion', number: 9, name: 'New Development', text: 'Empty plots and repeating blocks at the edge of town, where the campus grows.' },
];

export const districtBySlug = (slug: string): District | undefined => districts.find((d) => d.slug === slug);

export const CONN_GROUPS = ['roads', 'rail', 'belts', 'river', 'power', 'sensors'] as const;
export type ConnGroup = (typeof CONN_GROUPS)[number];

/** Names used by the "Show connections" toggles in the menu. */
export const connGroupNames: Record<ConnGroup, string> = {
  roads: 'Roads',
  rail: 'Freight rail',
  belts: 'Belts and bridges',
  river: 'River and pipes',
  power: 'Power cables',
  sensors: 'Sensor lines',
};

export type TownConnection = {
  id: string;
  group: ConnGroup;
  /** Shown as a chip in the district card and as a label during a tour step. */
  kind: string;
  joins: [ZoneSlug, ZoneSlug];
  /** Label shown only while a tour step highlights this connection. */
  label?: string;
};

const c = (id: string, group: ConnGroup, kind: string, a: ZoneSlug, b: ZoneSlug, label?: string): TownConnection => ({ id, group, kind, joins: [a, b], label });

export const connections: TownConnection[] = [
  c('road-gate-harbour', 'roads', 'Main road', 'transport-network', 'storage-yard', 'Road'),
  c('road-gate-factory', 'roads', 'Road', 'transport-network', 'gpu-hall'),
  c('road-factory-assembly', 'roads', 'Road', 'gpu-hall', 'production-line'),
  c('road-harbour-assembly', 'roads', 'Road', 'storage-yard', 'production-line'),
  c('road-harbour-newdev', 'roads', 'Road', 'storage-yard', 'campus-expansion'),
  c('rail-gate-harbour', 'rail', 'Private freight rail', 'transport-network', 'storage-yard', 'Freight rail'),
  c('rail-tower-gate', 'rail', 'Private freight rail', 'dgx-building', 'transport-network'),
  c('rail-harbour-factory', 'rail', 'Private freight rail', 'storage-yard', 'gpu-hall'),
  c('belt-harbour-factory', 'belts', 'Conveyor', 'storage-yard', 'gpu-hall', 'Conveyor'),
  c('belt-packing-factory', 'belts', 'Belt', 'packing-station', 'gpu-hall', 'Belt'),
  c('belt-packing-assembly', 'belts', 'Tray lane', 'packing-station', 'production-line'),
  c('bridge-tower-factory', 'belts', 'Sky-bridge', 'dgx-building', 'gpu-hall', 'Sky-bridge'),
  c('pipe-power-factory', 'river', 'Coolant pipe', 'power-cooling', 'gpu-hall', 'Coolant pipe'),
  c('pipe-power-tower', 'river', 'Coolant pipe', 'power-cooling', 'dgx-building'),
  c('cable-power-tower', 'power', 'Power cable', 'power-cooling', 'dgx-building'),
  c('cable-power-newdev', 'power', 'Power cable', 'power-cooling', 'campus-expansion', 'Power cable'),
  ...(['gpu-hall', 'packing-station', 'dgx-building', 'transport-network', 'storage-yard', 'production-line', 'power-cooling', 'campus-expansion'] as ZoneSlug[]).map((s) =>
    c(`sensor-${s}`, 'sensors', 'Sensor line', 'control-room', s),
  ),
];

/** Connections that touch a district, with the district at the other end. */
export function connectionsOf(slug: ZoneSlug): { other: ZoneSlug; connection: TownConnection }[] {
  const seen = new Set<string>();
  const out: { other: ZoneSlug; connection: TownConnection }[] = [];
  for (const cn of connections) {
    const i = cn.joins.indexOf(slug);
    if (i < 0) continue;
    const other = cn.joins[1 - i];
    const key = `${other}:${cn.kind}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ other, connection: cn });
  }
  return out;
}

/** One tour step highlights connections matching these filters: same group, and joining `a` (and `b` when given). */
export type TourFilter = { group: ConnGroup; a: ZoneSlug; b?: ZoneSlug };
export type TourStep = { title: string; text: string; filters: TourFilter[]; districts: ZoneSlug[] };

export const tourSteps: TourStep[] = [
  {
    title: 'Data arrives at the gate',
    text: 'Every job starts at the Gatehouse, where the roads and the private freight rail begin. Parcels of data ride the rail to the Harbour Depot, where they are stored.',
    filters: [{ group: 'rail', a: 'transport-network', b: 'storage-yard' }, { group: 'roads', a: 'transport-network', b: 'storage-yard' }],
    districts: ['transport-network', 'storage-yard'],
  },
  {
    title: 'Storage feeds the hall',
    text: 'A conveyor carries data from the depot into the production hall. How fast the conveyor runs is the memory bandwidth.',
    filters: [{ group: 'belts', a: 'storage-yard', b: 'gpu-hall' }, { group: 'rail', a: 'storage-yard', b: 'gpu-hall' }],
    districts: ['storage-yard', 'gpu-hall'],
  },
  {
    title: 'Crates are resized first',
    text: 'At the Packing Dock, crates are resized before they enter the factory. Smaller crates mean more fit on each truck.',
    filters: [{ group: 'belts', a: 'packing-station', b: 'gpu-hall' }, { group: 'belts', a: 'packing-station', b: 'production-line' }],
    districts: ['packing-station', 'gpu-hall', 'production-line'],
  },
  {
    title: 'The halls work together',
    text: 'GPU rooms in the Tower Block exchange results with the halls over the sky-bridge instead of going back out to the road.',
    filters: [{ group: 'belts', a: 'dgx-building', b: 'gpu-hall' }, { group: 'rail', a: 'dgx-building', b: 'transport-network' }],
    districts: ['dgx-building', 'gpu-hall'],
  },
  {
    title: 'Finished work ships out',
    text: 'Output leaves the Factory Quarter by road to Assembly Row, where it is packed and shipped to customers.',
    filters: [{ group: 'roads', a: 'gpu-hall', b: 'production-line' }, { group: 'roads', a: 'storage-yard', b: 'production-line' }],
    districts: ['gpu-hall', 'production-line'],
  },
  {
    title: 'Power and coolant keep it running',
    text: 'The power station feeds cables to the towers and the new development. The river carries coolant through pipes into the halls and towers.',
    filters: [
      { group: 'power', a: 'power-cooling', b: 'dgx-building' },
      { group: 'power', a: 'power-cooling', b: 'campus-expansion' },
      { group: 'river', a: 'power-cooling', b: 'gpu-hall' },
      { group: 'river', a: 'power-cooling', b: 'dgx-building' },
    ],
    districts: ['power-cooling', 'dgx-building', 'gpu-hall', 'campus-expansion'],
  },
  {
    title: 'The control tower sees everything',
    text: 'Sensor lines run from the tower on the hill to every district, so the dispatcher can watch and schedule the whole town.',
    filters: [{ group: 'sensors', a: 'control-room' }],
    districts: ['control-room'],
  },
];

/** Ids of the connections a tour step highlights. */
export function stepConnectionIds(step: TourStep): Set<string> {
  const ids = new Set<string>();
  for (const cn of connections) {
    if (step.filters.some((f) => cn.group === f.group && cn.joins.includes(f.a) && (!f.b || cn.joins.includes(f.b)))) ids.add(cn.id);
  }
  return ids;
}
