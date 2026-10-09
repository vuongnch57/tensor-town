import type { LineNeed } from '@/content/types';

/**
 * Zone 6 "simulation": pick a business need and see which station of the production line is the one that answers it.
 * A rule of thumb, not a measurement and not a recommendation engine. There are no numbers in this zone's model.
 */
export type LineStation = 'ngc' | 'rapids' | 'training-line' | 'tensorrt' | 'shipping-dock';
export type LineResult = {
  /** The station that lights up. */
  station: LineStation;
  /** For the shipping dock: which bay answers the need. */
  bay?: 'triton' | 'nim';
};

export const NEEDS: LineNeed[] = ['tools', 'prepare', 'train', 'optimize', 'serve-custom', 'serve-ready'];

export function simulate({ need }: { need: LineNeed }): LineResult {
  switch (need) {
    case 'tools':
      return { station: 'ngc' };
    case 'prepare':
      return { station: 'rapids' };
    case 'train':
      return { station: 'training-line' };
    case 'optimize':
      return { station: 'tensorrt' };
    case 'serve-custom':
      return { station: 'shipping-dock', bay: 'triton' };
    case 'serve-ready':
      return { station: 'shipping-dock', bay: 'nim' };
  }
}
