import type { Anchor } from '@/content/types';
import { anchors } from '../zones/gpu-hall/anchors';
import { FACTORY_ORIGIN } from './layout';

/** The Zone 1 scene is built around its own origin and placed at FACTORY_ORIGIN in the town. */
export const DATA_SIGN: [number, number] = [-2.8, 6.4];

/** Zone 1 anchors in town world coordinates. The data depot has no room beside the tower block, so its sign stands by the gate road. */
export const factoryAnchors: Record<string, Anchor> = Object.fromEntries(
  Object.entries({
    ...anchors,
    data: { position: [DATA_SIGN[0] + 0.1, 0.9, DATA_SIGN[1]], label: 'Data', focus: [DATA_SIGN[0], 0, DATA_SIGN[1] - 0.6] },
  } as Record<string, Anchor>).map(([id, a]) => {
    const shift = (p: [number, number, number]): [number, number, number] => [p[0] + FACTORY_ORIGIN[0], p[1], p[2] + FACTORY_ORIGIN[1]];
    return [id, { ...a, position: shift(a.position), focus: a.focus ? shift(a.focus) : a.focus }];
  }),
);
