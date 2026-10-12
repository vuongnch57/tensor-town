import type { Comparison } from './types';

// Zone 1 to Zone 7 comparisons. The remaining comparisons arrive with their zones.
export const comparisons: Comparison[] = [
  {
    id: 'cpu-vs-gpu',
    title: 'CPU vs GPU',
    zones: ['gpu-hall'],
    columns: ['CPU', 'GPU'],
    rows: [
      { label: 'In the factory', values: ["The manager's office", 'The production hall'] },
      { label: 'Good at', values: ['Varied, sequential decisions', 'One operation on huge amounts of data'] },
      { label: 'Cores', values: ['Few, strong', 'Many, simple'] },
      { label: 'Role in AI', values: ['Coordinates and feeds', 'Does the bulk maths'] },
    ],
    whyConfused:
      'Both are processors that run programs, and both appear in the same server, so it is easy to think one is just a faster version of the other. They are built for different jobs: one decides, the other repeats the same arithmetic across enormous amounts of data.',
  },
  {
    id: 'hbm-vs-gddr',
    title: 'HBM vs GDDR',
    zones: ['gpu-hall'],
    columns: ['HBM', 'GDDR'],
    rows: [
      { label: 'In the factory', values: ['A warehouse next to the hall', 'Storerooms spread around the yard'] },
      { label: 'Placement', values: ['Stacked beside the chip', 'Spread on the board'] },
      { label: 'Bandwidth', values: ['Very high', 'Lower'] },
      { label: 'Cost', values: ['Higher', 'Lower'] },
      { label: 'Found in', values: ['Data center GPUs', 'Gaming GPUs'] },
    ],
    whyConfused:
      'Both are the memory attached to a GPU and both are measured in gigabytes, so they look interchangeable on a spec sheet. They differ in how they are built and placed, which changes how fast data reaches the cores and what the card costs.',
  },
  {
    id: 'training-vs-inference',
    title: 'Training vs inference',
    zones: ['gpu-hall'],
    columns: ['Training', 'Inference'],
    rows: [
      { label: 'In the factory', values: ['Building the production line', 'Running the 24/7 shop'] },
      { label: 'Goal', values: ['Learn the weights', 'Answer requests quickly'] },
      { label: 'Usually limited by', values: ['Compute', 'Memory bandwidth'] },
      { label: 'Runs', values: ['Long jobs', 'Always on'] },
    ],
    whyConfused:
      'Both run the same model on the same kind of hardware, so they are often described as one workload. Training changes the model and keeps the hall busy; inference only uses it, one request at a time, and tends to wait on memory instead.',
  },
  {
    id: 'fp-formats',
    title: 'FP32 / BF16 / FP8 / INT8',
    zones: ['packing-station'],
    columns: ['FP32', 'BF16', 'FP8', 'INT8'],
    rows: [
      { label: 'In the factory', values: ['The biggest crate', 'The medium crate', 'A small box', 'The other small box'] },
      { label: 'Size', values: ['4 B per number', '2 B per number', '1 B per number', '1 B per number'], best: 2 },
      { label: 'Layout', values: ['8 exponent · 23 mantissa', '8 exponent · 7 mantissa', 'E4M3 or E5M2', 'Whole numbers'] },
      { label: 'Typical use', values: ['Careful, wide arithmetic', 'Training', 'Training and inference on Hopper and later', 'Inference after quantization'] },
    ],
    whyConfused:
      'They all store numbers, and model cards quote them side by side, so they look like four sizes of one thing. They are really different layouts: some spend their bits on range, some on precision, and INT8 holds only whole numbers, so which one suits a job depends on what the numbers must survive.',
  },
  {
    id: 'nvlink-nvswitch-pcie',
    title: 'NVLink vs NVSwitch vs PCIe',
    zones: ['dgx-building'],
    columns: ['NVLink', 'NVSwitch', 'PCIe'],
    rows: [
      { label: 'In the factory', values: ['A sky-bridge between rooms', 'The central sorting hub', 'The shared service corridor'] },
      { label: 'What it is', values: ['A GPU-to-GPU link', 'A switch chip joining every GPU', 'The general server connection'] },
      { label: 'Bandwidth', values: ['900 GB/s per H100', '900 GB/s per H100, to every peer', '~128 GB/s (Gen5 x16)'], best: 1 },
      { label: 'Reach', values: ['The two ends only', 'Every GPU to every GPU', 'CPU, cards and drives'] },
    ],
    whyConfused:
      'NVLink and NVSwitch share a name and a speed, so they sound like two versions of one thing. NVLink is the link itself; NVSwitch is the chip that lets every GPU use its full NVLink speed to reach every other. PCIe is the older, shared route that all of them are measured against.',
  },
  {
    id: 'dgx-hgx-mgx',
    title: 'DGX vs HGX vs MGX',
    zones: ['dgx-building'],
    columns: ['DGX', 'HGX', 'MGX'],
    rows: [
      { label: 'In the factory', values: ['The complete building', 'The eight-room core', 'A kit of standard parts'] },
      { label: 'Sold as', values: ['A finished system', 'A board for builders', 'A modular blueprint'] },
      { label: 'Built by', values: ['NVIDIA', 'Server makers, around the core', 'Server makers, in their own layouts'] },
      { label: 'Detail', values: ['8× H100 GPUs · 4 NVSwitch chips', '8 GPUs joined by NVLink', 'TODO(fact): add verified MGX specifics'] },
    ],
    whyConfused:
      'All three appear in server brochures with the same GPUs inside, so they read like three product tiers. They differ in how much NVIDIA builds and how much the buyer does: the whole machine, the GPU core only, or a set of parts to arrange.',
  },
  {
    id: 'infiniband-ethernet-spectrumx',
    title: 'InfiniBand vs Ethernet vs Spectrum-X',
    zones: ['transport-network'],
    columns: ['InfiniBand', 'Ethernet', 'Spectrum-X'],
    rows: [
      { label: 'In the factory', values: ['Private freight rail', 'Public road', 'Road with smart traffic control'] },
      { label: 'When crowded', values: ['Waits, never drops', 'Drops parcels and re-sends', 'Steers round the jam'], best: 0 },
      { label: 'Built for', values: ['Clusters', 'Everything', 'AI on Ethernet'] },
      { label: 'Needs', values: ['A dedicated fabric', 'Careful tuning of bandwidth, latency and congestion for AI', 'Matching switches and network cards'] },
    ],
    whyConfused:
      'All three move data between machines and all three can reach the same speeds on paper, so it is easy to treat them as the same road with different paint. They differ in what happens when traffic piles up: one waits, one drops and re-sends, and one routes around the jam.',
  },
  {
    id: 'storage-tiers',
    title: 'NVMe cache vs parallel FS vs object storage',
    zones: ['storage-yard'],
    columns: ['Local NVMe cache', 'Parallel file system', 'Object storage'],
    rows: [
      { label: 'In the factory', values: ['Shed next to the building', 'Big warehouse', 'Remote depot at the port'] },
      { label: 'Speed', values: ['Fastest', 'Fast', 'Slowest'], best: 0 },
      { label: 'Capacity', values: ['Smallest', 'Large', 'Largest'], best: 2 },
      { label: 'Reached over', values: ['Local drives beside the GPUs', 'The storage network', 'The network, from far away'] },
    ],
    whyConfused:
      'All three simply "store the data", and a dataset can live in all of them at once. They sit at different distances from the GPUs, which is the whole difference: the closer the tier, the faster and smaller it is.',
  },
  {
    id: 'gpudirect-rdma-vs-storage',
    title: 'GPUDirect RDMA vs GPUDirect Storage',
    zones: ['transport-network', 'storage-yard'],
    columns: ['GPUDirect RDMA', 'GPUDirect Storage'],
    rows: [
      { label: 'In the factory', values: ['Courier from another town into the hall', 'Courier from the warehouse into the hall'] },
      { label: 'Moves data between', values: ['Network card and GPU memory', 'Storage and GPU memory'] },
      { label: 'Skips', values: ['Staging in CPU memory', 'Staging in CPU memory'] },
      { label: 'Lives in', values: ['The transport network', 'The storage yard'] },
    ],
    whyConfused:
      'Both are "GPUDirect": both open a direct lane into GPU memory so parcels skip the CPU\'s office. They differ only in where the parcel comes from, another machine across the network or a storage system.',
  },
  {
    id: 'triton-vs-nim',
    title: 'Triton vs NIM',
    zones: ['production-line'],
    columns: ['Triton', 'NIM'],
    rows: [
      { label: 'In the factory', values: ['Configurable shipping dock', 'Pre-packed box'] },
      { label: 'You get', values: ['Control over models, frameworks and settings', 'A model already optimised, wrapped with an interface'] },
      { label: 'Setup', values: ['You assemble and tune it', 'Pull it and run it'] },
      { label: 'Best when', values: ['You need a custom mix of models', 'You want a ready endpoint fast'] },
    ],
    whyConfused:
      'Both are ways to serve a model to requests, and both can run inside the same stack, so they look like rivals. Triton is a server you configure; NIM is a finished package, and a NIM can even use Triton inside it.',
  },
  {
    id: 'slurm-vs-kubernetes',
    title: 'Slurm vs Kubernetes',
    zones: ['control-room'],
    columns: ['Slurm', 'Kubernetes'],
    rows: [
      { label: 'In the factory', values: ['Dispatcher desk with tickets', 'Container yard with cranes'] },
      { label: 'Unit of work', values: ['A batch job that ends', 'A container that can run for ever'] },
      { label: 'Best for', values: ['Training runs queued for a block of GPUs', 'Always-on services and many small workloads'] },
      { label: 'Familiar to', values: ['HPC and research teams', 'Cloud and platform teams'] },
    ],
    whyConfused:
      'Both decide which machines run which work and both can hand out GPUs, so they look like two brands of the same thing. Slurm queues finite jobs and gives them machines until they finish; Kubernetes keeps services running and moves containers around. Many sites run both.',
  },
  {
    id: 'gpu-sharing',
    title: 'MIG vs time-slicing vs vGPU',
    zones: ['control-room'],
    columns: ['MIG', 'Time-slicing', 'vGPU'],
    rows: [
      { label: 'In the factory', values: ['Hall split by walls', 'Shift schedule', 'Rented booths'] },
      { label: 'Split by', values: ['Hardware slices with their own SMs and memory', 'Time: jobs take turns', 'The hypervisor, per virtual machine'] },
      { label: 'Jobs run', values: ['At the same time', 'One after another', 'Taking turns, per virtual GPU'] },
      { label: 'Isolation', values: ['Strong, in hardware', 'None', 'Strong, between virtual machines'], best: 0 },
    ],
    whyConfused:
      'All three let more than one job use a single GPU, and nvidia-smi can show a busy GPU in every case. They share it differently: walls give each job its own part of the GPU, a schedule gives each job all of it for a moment, and a booth gives each virtual machine a fixed share.',
  },
];
