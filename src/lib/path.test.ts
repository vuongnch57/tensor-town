import { describe, expect, it } from 'vitest';
import { pathLength, pointAt, type Pt } from './path';

const pts: Pt[] = [[0, 0], [4, 0], [4, 3]];

describe('path', () => {
  it('measures length', () => expect(pathLength(pts)).toBe(7));
  it('walks along segments and clamps at the ends', () => {
    const o = { x: 0, z: 0 };
    pointAt(pts, 2, o);
    expect(o).toEqual({ x: 2, z: 0 });
    pointAt(pts, 5, o);
    expect(o).toEqual({ x: 4, z: 1 });
    pointAt(pts, 99, o);
    expect(o).toEqual({ x: 4, z: 3 });
  });
});
