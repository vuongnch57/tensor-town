import { createContext, useContext } from 'react';

/** Visual quality tiers. PerformanceMonitor lowers them: AO and soft shadows go first (SPEC §4.13.8). */
export type Quality = 'high' | 'medium' | 'low';

export const QualityContext = createContext<Quality>('high');
export const useQuality = () => useContext(QualityContext);
