import type { Comparison } from './types';

// Zone 1 comparisons. The remaining comparisons arrive with their zones.
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
];
