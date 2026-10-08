import type { ZoneSlug } from '@/content/types';

export const zonePath = (zone: ZoneSlug, itemId?: string | null) => (itemId ? `/zone/${zone}/${itemId}` : `/zone/${zone}`);
export const comparePath = (id: string) => `/compare/${id}`;
