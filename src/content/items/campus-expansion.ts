import type { Item } from '../types';

const zone = 'campus-expansion' as const;

// Numbers here come from SPEC §8 only: 32 DGX per scalable unit (H100 generation) and the 72 + 36 of GB200 NVL72.
// The BasePOD size (2 to 8 DGX, NDR400 design) is in SPEC §8 facts with its source. Anything else beyond SPEC §8 is general, not measured.
export const campusExpansionItems: Item[] = [
  {
    id: 'scalable-unit',
    zone,
    kind: 'object',
    number: 1,
    name: 'Scalable unit',
    aliases: ['SU', 'building block', 'SuperPOD unit'],
    category: 'Architecture',
    metaphor: 'The standard block that is built again and again: the same plan every time',
    swatch: 'scene-storage',
    summary:
      'A scalable unit is a fixed group of DGX systems with their own compute network, storage connections and management, designed and tested as one block. A SuperPOD is made by repeating the same unit, so adding capacity means building another identical block rather than a new design.',
    facts: [
      { label: 'In the H100 generation', value: '32 DGX systems per scalable unit' },
      { label: 'Growth', value: 'Add another identical unit' },
    ],
    related: ['superpod-campus', 'dgx-basepod', 'dgx-system', 'reference-architecture'],
    anchorId: 'scalable-unit',
    campusSim: { architecture: 'superpod', units: 1 },
  },
  {
    id: 'superpod-campus',
    zone,
    kind: 'object',
    number: 2,
    name: 'SuperPOD campus',
    aliases: ['DGX SuperPOD', 'SuperPOD', 'BasePOD vs SuperPOD'],
    category: 'Architecture',
    metaphor: 'A campus built from repeating blocks joined by one spine of roads',
    swatch: 'scene-storage',
    summary:
      'A DGX SuperPOD joins several scalable units with a shared high-speed network, storage and management, so hundreds of GPUs work as one machine for the largest training jobs. A BasePOD is the smaller starting design: the same ideas at lower scale.',
    facts: [
      { label: 'Built from', value: 'Scalable units of 32 DGX systems (H100 generation)' },
      { label: 'BasePOD size', value: '2 to 8 DGX systems in the NDR400 design; other designs differ' },
    ],
    compare: {
      with: ['BasePOD'],
      rows: [
        { label: 'In the factory', values: ['Campus of repeating blocks', 'A single compact block'] },
        { label: 'Scale', values: ['Many scalable units joined together', 'Smaller: 2 to 8 DGX systems in the NDR400 design'] },
        { label: 'Built for', values: ['The largest training jobs', 'Getting started and mid-size clusters'] },
      ],
      fullCompareId: 'basepod-vs-superpod',
    },
    related: ['scalable-unit', 'dgx-basepod', 'reference-architecture', 'gb200-nvl72', 'infiniband'],
    anchorId: 'superpod-campus',
    campusSim: { architecture: 'superpod', deployment: 'on-prem', units: 3 },
  },
  {
    id: 'expansion-plot',
    zone,
    kind: 'object',
    number: 3,
    name: 'Expansion plot',
    aliases: ['room to grow', 'capacity planning', 'growth'],
    category: 'Planning',
    metaphor: 'Staked-out land kept ready for the next block',
    swatch: 'scene-parcel',
    summary:
      'An expansion plot is space, power and cooling set aside for the next scalable unit before it is needed. Because the units are identical, a campus can grow in steps: reserve the plot, build the block, connect it to the spine. Planning that room early is cheaper than retrofitting power and cooling later.',
    facts: [
      { label: 'Reserves', value: 'Space, power and cooling for the next block' },
      { label: 'Why', value: 'Growth in identical steps, not redesign' },
    ],
    related: ['scalable-unit', 'rack-power-density', 'substation', 'superpod-campus'],
    anchorId: 'expansion-plot',
    campusSim: { units: 1 },
  },
  {
    id: 'rented-capacity',
    zone,
    kind: 'object',
    number: 4,
    name: 'Rented capacity',
    aliases: ['cloud GPUs', 'cloud', 'leasing', 'GPU cloud', 'hybrid'],
    category: 'Deployment',
    metaphor: 'A hall you rent by the hour instead of building',
    swatch: 'scene-coolant',
    summary:
      'Rented capacity is GPU time bought from a cloud provider instead of built on your own land. There is nothing to construct and capacity can be added or dropped quickly, but you pay for every hour and your data has to travel to the provider. Many organizations mix both: own the steady base, rent the peaks.',
    facts: [
      { label: 'Pay model', value: 'By the hour or by contract, nothing to build' },
      { label: 'Trade-off', value: 'Flexibility against long-run cost and data location' },
    ],
    compare: {
      with: ['On-prem', 'Hybrid'],
      rows: [
        { label: 'In the factory', values: ['A hall you rent', 'A campus you own', 'Own the base, rent the peaks'] },
        { label: 'Up-front cost', values: ['Low', 'High', 'Medium'] },
        { label: 'Data stays', values: ['At the provider', 'In your building', 'Split by choice'] },
      ],
      fullCompareId: 'on-prem-cloud-hybrid',
    },
    related: ['on-prem-cloud-hybrid', 'data-sovereignty', 'expansion-plot', 'scalable-unit'],
    anchorId: 'rented-capacity',
    campusSim: { deployment: 'cloud', units: 2 },
  },
  {
    id: 'dgx-basepod',
    zone,
    kind: 'concept',
    name: 'DGX BasePOD',
    aliases: ['BasePOD'],
    category: 'Architecture',
    metaphor: 'The smaller starter campus: one compact block',
    summary:
      'A DGX BasePOD is a tested design that pairs DGX systems with the network, storage and software around them, sized for teams that are not yet building a SuperPOD. It follows the same pattern, so a BasePOD can be a first step. Its size varies by design: the NDR400 design lists 2 to 8 DGX systems.',
    facts: [
      { label: 'Size', value: '2 to 8 DGX systems in the NDR400 design; other designs differ' },
      { label: 'Role', value: 'The starting point before a SuperPOD' },
    ],
    related: ['superpod-campus', 'scalable-unit', 'reference-architecture', 'dgx-system'],
    campusSim: { architecture: 'basepod', units: 1 },
  },
  {
    id: 'reference-architecture',
    zone,
    kind: 'concept',
    name: 'Reference architecture',
    aliases: ['reference design', 'blueprint', 'validated design'],
    category: 'Architecture',
    metaphor: 'A tested building plan you can copy instead of drawing your own',
    summary:
      'A reference architecture is a documented, validated design for how compute, network, storage, power and software fit together. Following it means the pieces have been tested together, the bottlenecks are known and support can reason about the result. BasePOD and SuperPOD are reference architectures.',
    facts: [{ label: 'Gives you', value: 'A tested, repeatable design with known limits' }],
    related: ['dgx-basepod', 'superpod-campus', 'scalable-unit', 'ai-enterprise'],
  },
  {
    id: 'gb200-nvl72',
    zone,
    kind: 'concept',
    name: 'GB200 NVL72',
    aliases: ['NVL72', 'Grace Blackwell rack', 'rack-scale'],
    category: 'Hardware',
    metaphor: 'A whole rack built to behave like one giant GPU',
    summary:
      'GB200 NVL72 is a rack-scale system that puts 72 Blackwell GPUs and 36 Grace CPUs into one NVLink domain, so all 72 GPUs talk over NVLink as if they were a single large accelerator. It moves the unit of building from a server to a rack.',
    facts: [{ label: 'Contents', value: '72 Blackwell GPUs and 36 Grace CPUs in one NVLink domain' }],
    related: ['grace-hopper', 'nvswitch-hub', 'rack-power-density', 'superpod-campus'],
  },
  {
    id: 'on-prem-cloud-hybrid',
    zone,
    kind: 'concept',
    name: 'On-prem vs cloud vs hybrid',
    aliases: ['on-prem', 'on premises', 'cloud', 'hybrid', 'deployment'],
    category: 'Deployment',
    metaphor: 'Own the campus, rent the hall, or do both',
    summary:
      'On-prem means you build and run the campus: high up-front cost, full control and the data stays with you. Cloud means you rent capacity from a provider: no building, quick to scale, paid by use. Hybrid mixes the two, usually owning the steady load and renting for peaks or for trials.',
    facts: [{ label: 'Choose by', value: 'Cost over time, control, speed to start and where data may live' }],
    related: ['rented-capacity', 'data-sovereignty', 'expansion-plot', 'superpod-campus'],
    campusSim: { deployment: 'hybrid', units: 3 },
  },
  {
    id: 'data-sovereignty',
    zone,
    kind: 'concept',
    name: 'Data sovereignty',
    aliases: ['data residency', 'compliance', 'data location'],
    category: 'Deployment',
    metaphor: 'Rules about which town a parcel is allowed to be stored in',
    summary:
      'Data sovereignty means data is subject to the laws of the country where it is stored. Rules about where data may live can push a team to keep sensitive data on-prem or in a specific region, even when renting capacity elsewhere would be cheaper or quicker.',
    facts: [{ label: 'Effect', value: 'Limits where data and training can run' }],
    related: ['on-prem-cloud-hybrid', 'rented-capacity', 'object-storage-depot'],
    campusSim: { deployment: 'on-prem' },
  },
];
