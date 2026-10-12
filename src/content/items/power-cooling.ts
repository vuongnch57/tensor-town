import type { Item } from '../types';

const zone = 'power-cooling' as const;

// No numbers are needed in this zone, so every fact below is a description. The air-cooling limit is not in SPEC §8, so it stays TODO(fact).
// Anything beyond SPEC §8 is general, not measured.
export const powerCoolingItems: Item[] = [
  {
    id: 'substation',
    zone,
    kind: 'object',
    number: 1,
    name: 'Substation',
    aliases: ['power supply', 'electrical power', 'transformer'],
    category: 'Power',
    metaphor: 'The yard where the town’s electricity is stepped down before it reaches the halls',
    swatch: 'scene-roof',
    summary:
      'The substation takes power from the grid and steps it down to the voltages the data center uses, then sends it on through switchgear and cables to the chillers and the halls. A GPU cluster is a very large electrical load, so how much power the substation can deliver often limits how big the factory can grow.',
    facts: [
      { label: 'Does', value: 'Steps grid power down and distributes it' },
      { label: 'Feeds', value: 'The halls, the chillers and the rest of the town' },
    ],
    related: ['pue-meter', 'chillers', 'rack-power-density', 'gpu-rack'],
    anchorId: 'substation',
  },
  {
    id: 'gpu-rack',
    zone,
    kind: 'object',
    number: 2,
    name: 'GPU rack',
    aliases: ['rack', 'server rack', 'cabinet'],
    category: 'Hardware',
    metaphor: 'A tall cabinet of servers that turns electricity into computing, and into heat',
    swatch: 'scene-network',
    summary:
      'A rack holds several GPU servers stacked in one cabinet, with power and network cables running through it. Nearly all the electricity a rack uses leaves as heat, so the more GPUs packed into one rack, the more heat has to be carried away from the same small footprint.',
    facts: [
      { label: 'Holds', value: 'GPU servers, power and network connections' },
      { label: 'Gives off', value: 'Almost all its power as heat' },
    ],
    related: ['gpu-heat-output', 'rack-power-density', 'dgx-system', 'air-cooled-hall', 'liquid-loop'],
    anchorId: 'gpu-rack',
    powerSim: { density: 0.9 },
  },
  {
    id: 'air-cooled-hall',
    zone,
    kind: 'object',
    number: 3,
    name: 'Air-cooled hall',
    aliases: ['air cooling', 'air-cooled', 'CRAC', 'hot aisle cold aisle'],
    category: 'Cooling',
    metaphor: 'A hall kept cool by fans and open aisles: move enough air and the heat goes with it',
    swatch: 'scene-hall',
    summary:
      'Air cooling blows cold air through the racks and carries the warm air away, usually with the racks arranged in hot and cold aisles so the two streams stay apart. It is simple, familiar and cheap to build, but air carries heat poorly, so there is a limit to how dense a rack it can keep cool.',
    facts: [
      { label: 'Carries heat with', value: 'Moving air' },
      { label: 'Air-cooling limit', value: 'TODO(fact): add a verified rack density' },
    ],
    compare: {
      with: ['Liquid cooling'],
      rows: [
        { label: 'In the factory', values: ['Fans and open aisles', 'Pipes of coolant to the chips'] },
        { label: 'Carries heat with', values: ['Moving air', 'A circulating liquid'] },
        { label: 'Handles', values: ['Lower rack densities', 'Higher rack densities'] },
      ],
      fullCompareId: 'air-vs-liquid',
    },
    related: ['liquid-loop', 'rack-power-density', 'chillers', 'gpu-heat-output'],
    anchorId: 'air-cooled-hall',
    powerSim: { density: 0.3 },
  },
  {
    id: 'liquid-loop',
    zone,
    kind: 'object',
    number: 4,
    name: 'Liquid cooling loop',
    aliases: ['liquid cooling', 'direct-to-chip', 'cold plate', 'coolant loop'],
    category: 'Cooling',
    metaphor: 'Pipes that carry coolant right up to the chips and bring the warmth back out',
    swatch: 'scene-coolant',
    summary:
      'Liquid cooling circulates coolant through cold plates that sit on the hottest chips, then through a pump and heat exchanger to the chillers. Liquid carries far more heat than air, so it can cool racks that are too dense for fans, and it needs less fan power. It costs more to plumb, and leaks and maintenance need careful design.',
    facts: [
      { label: 'Carries heat with', value: 'A circulating liquid through cold plates' },
      { label: 'Suits', value: 'Dense racks that air cannot keep cool' },
    ],
    compare: {
      with: ['Air cooling'],
      rows: [
        { label: 'In the factory', values: ['Pipes of coolant to the chips', 'Fans and open aisles'] },
        { label: 'Carries heat with', values: ['A circulating liquid', 'Moving air'] },
        { label: 'Handles', values: ['Higher rack densities', 'Lower rack densities'] },
      ],
      fullCompareId: 'air-vs-liquid',
    },
    related: ['air-cooled-hall', 'chillers', 'gpu-rack', 'rack-power-density'],
    anchorId: 'liquid-loop',
    powerSim: { density: 0.9 },
  },
  {
    id: 'chillers',
    zone,
    kind: 'object',
    number: 5,
    name: 'Chillers',
    aliases: ['chiller plant', 'heat rejection', 'cooling towers'],
    category: 'Cooling',
    metaphor: 'The plant that cools the coolant before it goes round again, with the river as the town’s water supply',
    swatch: 'scene-coolant',
    summary:
      'Chillers cool the water or coolant that comes back warm from the halls and send it out cold again, rejecting the heat outside. They are the biggest consumer of non-computing power in many facilities, which is why cooling design shows up so directly in the PUE.',
    facts: [
      { label: 'Does', value: 'Cools the returning coolant and rejects the heat outside' },
      { label: 'Serves', value: 'Both the air-cooled and the liquid-cooled halls' },
    ],
    related: ['pue-meter', 'liquid-loop', 'air-cooled-hall', 'substation'],
    anchorId: 'chillers',
  },
  {
    id: 'pue-meter',
    zone,
    kind: 'object',
    number: 6,
    name: 'PUE meter',
    aliases: ['PUE', 'power usage effectiveness', 'efficiency'],
    category: 'Efficiency',
    metaphor: 'A dial that compares what the whole facility draws with what the computers use',
    swatch: 'scene-parcel-hot',
    summary:
      'PUE, power usage effectiveness, is total facility power divided by IT equipment power. A value of exactly one would mean every watt goes to computing; everything above one is cooling, conversion losses and other overhead. Better cooling design lowers the needle without touching the IT load.',
    facts: [
      { label: 'Formula', value: 'PUE = total facility power ÷ IT equipment power' },
      { label: 'Lower is better', value: 'Overhead is anything that is not IT' },
    ],
    related: ['chillers', 'liquid-loop', 'substation', 'rack-power-density'],
    anchorId: 'pue-meter',
  },
  {
    id: 'gpu-heat-output',
    zone,
    kind: 'concept',
    name: 'GPU heat output',
    aliases: ['heat', 'thermal design power', 'TDP', 'power draw'],
    category: 'Power',
    metaphor: 'Every watt a GPU draws leaves as warmth',
    summary:
      'A GPU turns the electricity it draws into computing and, in the end, into heat. Busy GPUs draw more and so give off more, which is why a training run that keeps the SMs fully loaded is a cooling problem as much as a compute one.',
    facts: [{ label: 'Rule of thumb', value: 'Power drawn leaves as heat' }],
    related: ['gpu-rack', 'rack-power-density', 'air-cooled-hall', 'liquid-loop', 'sm'],
    powerSim: { density: 0.8 },
  },
  {
    id: 'rack-power-density',
    zone,
    kind: 'concept',
    name: 'Rack power density',
    aliases: ['density', 'kW per rack', 'power per rack'],
    category: 'Power',
    metaphor: 'How much heat is crowded into one cabinet-sized footprint',
    summary:
      'Rack power density is how much power one rack draws. GPU racks are far denser than traditional server racks, because many accelerators sit close together on fast links. Density decides the cooling: light racks can stay on air, dense ones need liquid, and where the line falls is TODO(fact).',
    facts: [
      { label: 'Decides', value: 'Whether air is enough or liquid is needed' },
      { label: 'Switch-over density', value: 'TODO(fact): add a verified rack density' },
    ],
    related: ['gpu-rack', 'gpu-heat-output', 'air-cooled-hall', 'liquid-loop', 'pue-meter'],
    powerSim: { density: 0.9 },
  },
];
