import type { Item } from '../types';

const zone = 'dgx-building' as const;

// All numbers below come from SPEC §8. Anything else is marked TODO(fact) with a visible placeholder.
export const dgxBuildingItems: Item[] = [
  {
    id: 'gpu-room',
    zone,
    kind: 'object',
    number: 1,
    name: 'GPU room',
    aliases: ['GPU', 'H100'],
    category: 'Hardware',
    metaphor: 'One of the eight rooms in the tower block',
    swatch: 'scene-wall',
    summary:
      'Each room is one GPU with its own memory. On its own a room is limited by what it holds; joined to the other seven by bridges and a hub, the eight rooms can work like one big machine on one big job.',
    facts: [
      { label: 'In a DGX H100', value: '8× H100 GPUs' },
      { label: 'Memory per H100 SXM', value: '80 GB HBM3' },
    ],
    related: ['nvlink-bridge', 'nvswitch-hub', 'hgx-board', 'hbm'],
    anchorId: 'gpu-room',
  },
  {
    id: 'nvlink-bridge',
    zone,
    kind: 'object',
    number: 2,
    name: 'NVLink bridge',
    aliases: ['NVLink'],
    category: 'Interconnect',
    metaphor: 'An enclosed sky-bridge between GPU rooms',
    swatch: 'scene-hall',
    summary:
      'NVLink is the fast direct link between GPUs, far wider than the shared corridor of PCIe. A bridge joins the two rooms at its ends; without a hub, a room can only talk fast to the neighbours it has a bridge to.',
    facts: [
      { label: 'Per H100 GPU', value: '900 GB/s total' },
      { label: 'PCIe Gen5 x16', value: '~128 GB/s bidirectional' },
      { label: 'On Blackwell', value: '1.8 TB/s per GPU' },
    ],
    compare: {
      with: ['PCIe'],
      rows: [
        { label: 'In the factory', values: ['Sky-bridge between rooms', 'Shared service corridor'] },
        { label: 'Bandwidth', values: ['900 GB/s per H100', '~128 GB/s (Gen5 x16)'], best: 0 },
        { label: 'Joins', values: ['GPU to GPU', 'GPU to CPU, cards and drives'] },
      ],
      fullCompareId: 'nvlink-nvswitch-pcie',
    },
    related: ['nvswitch-hub', 'pcie', 'gpu-room', 'grace-hopper'],
    anchorId: 'nvlink-bridge',
    fabricSim: { interconnect: 'nvlink' },
  },
  {
    id: 'nvswitch-hub',
    zone,
    kind: 'object',
    number: 3,
    name: 'NVSwitch hub',
    aliases: ['NVSwitch'],
    category: 'Interconnect',
    metaphor: 'The central sorting hub that joins every room',
    swatch: 'scene-parcel',
    summary:
      'NVSwitch is a switch chip that links every GPU to every other at full NVLink speed, so any room can reach any other in one hop instead of through a chain of bridges. It is what turns eight separate GPUs into one machine for jobs where everyone talks to everyone.',
    facts: [
      { label: 'In a DGX H100', value: '4 NVSwitch chips' },
      { label: 'NVLink per H100 GPU', value: '900 GB/s total' },
    ],
    compare: {
      with: ['NVLink'],
      rows: [
        { label: 'In the factory', values: ['The central sorting hub', 'A sky-bridge between two rooms'] },
        { label: 'What it is', values: ['A switch chip', 'A link'] },
        { label: 'Reach', values: ['Every GPU to every GPU', 'The two ends only'], best: 0 },
      ],
      fullCompareId: 'nvlink-nvswitch-pcie',
    },
    related: ['nvlink-bridge', 'gpu-room', 'dgx-system', 'scale-up-vs-scale-out'],
    anchorId: 'nvswitch-hub',
    fabricSim: { interconnect: 'nvswitch' },
  },
  {
    id: 'hgx-board',
    zone,
    kind: 'object',
    number: 4,
    name: 'HGX board',
    aliases: ['HGX'],
    category: 'Hardware',
    metaphor: 'The eight-room core, sold to builders',
    swatch: 'scene-hall',
    summary:
      'HGX is the eight-GPU core of a DGX: the GPUs, joined by NVLink, on one board. NVIDIA sells it to server makers, who build the rest of the machine around it their own way.',
    facts: [{ label: 'Core', value: '8 GPUs joined by NVLink' }],
    compare: {
      with: ['DGX'],
      rows: [
        { label: 'In the factory', values: ['The eight-room core', 'The complete building'] },
        { label: 'Sold as', values: ['A board for builders', 'A finished system'] },
      ],
      fullCompareId: 'dgx-hgx-mgx',
    },
    related: ['dgx-system', 'mgx', 'gpu-room'],
    anchorId: 'hgx-board',
  },
  {
    id: 'dgx-system',
    zone,
    kind: 'object',
    number: 5,
    name: 'DGX system',
    aliases: ['DGX', 'DGX H100'],
    category: 'System',
    metaphor: 'The complete building, ready to move into',
    swatch: 'scene-network',
    summary:
      'A DGX is the whole machine NVIDIA builds and supports: the GPU core, the CPUs, network cards, storage, power and cooling, tested together. It is the finished building rather than the eight-room core.',
    facts: [
      { label: 'DGX H100', value: '8× H100 GPUs · 4 NVSwitch chips' },
      { label: 'Network card', value: 'ConnectX-7, up to 400 Gb/s' },
    ],
    compare: {
      with: ['HGX'],
      rows: [
        { label: 'In the factory', values: ['The complete building', 'The eight-room core'] },
        { label: 'Sold as', values: ['A finished system', 'A board for builders'] },
      ],
      fullCompareId: 'dgx-hgx-mgx',
    },
    related: ['hgx-board', 'nvswitch-hub', 'mgx', 'scale-up-vs-scale-out'],
    anchorId: 'dgx-system',
    fabricSim: { interconnect: 'nvswitch' },
  },
  {
    id: 'pcie',
    zone,
    kind: 'concept',
    name: 'PCIe',
    aliases: ['PCI Express'],
    category: 'Interconnect',
    metaphor: 'The narrow service corridor everything shares',
    summary:
      'PCIe is the general-purpose connection between the GPU and the rest of the server: the CPU, network cards and drives all use it. It is shared and much narrower than NVLink, so it is fine for feeding a GPU but a bottleneck for GPUs talking to each other.',
    facts: [{ label: 'PCIe Gen5 x16', value: '~128 GB/s bidirectional' }],
    related: ['nvlink-bridge', 'gpu-room', 'grace-hopper'],
    fabricSim: { interconnect: 'pcie' },
  },
  {
    id: 'mgx',
    zone,
    kind: 'concept',
    name: 'MGX',
    category: 'Hardware',
    metaphor: 'A kit of standard parts for building your own layout',
    summary:
      'MGX is a modular blueprint that lets server makers combine GPU, CPU and networking parts in different layouts, rather than choosing between a fixed DGX and an HGX core.',
    facts: [{ label: 'Details', value: 'TODO(fact): add verified MGX specifics' }],
    related: ['dgx-system', 'hgx-board'],
  },
  {
    id: 'grace-hopper',
    zone,
    kind: 'concept',
    name: 'Grace Hopper (GH200)',
    aliases: ['GH200', 'Grace Hopper', 'NVLink-C2C'],
    category: 'Hardware',
    metaphor: 'A manager and a hall built as one block',
    summary:
      'GH200 puts a Grace CPU and a Hopper GPU in one package and joins them with NVLink-C2C instead of PCIe, so the CPU and GPU can share data over a much faster path than a separate card would have.',
    facts: [{ label: 'Pairing', value: 'Grace CPU + Hopper GPU over NVLink-C2C' }],
    related: ['nvlink-bridge', 'pcie', 'cpu'],
  },
  {
    id: 'scale-up-vs-scale-out',
    zone,
    kind: 'concept',
    name: 'Scale-up vs scale-out',
    aliases: ['scale up', 'scale out'],
    category: 'Architecture',
    metaphor: 'A taller tower, or more towers down the road',
    summary:
      'Scale-up makes one machine bigger by joining more GPUs with NVLink in a single domain. Scale-out adds more machines and joins them with a network, which is slower than NVLink but has no hard ceiling. Real clusters do both.',
    facts: [{ label: 'GB200 NVL72', value: '72 Blackwell GPUs + 36 Grace CPUs in one NVLink domain' }],
    related: ['nvswitch-hub', 'dgx-system', 'infiniband'],
  },
];
