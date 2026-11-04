import { GovernmentService } from './serviceTypes';
import { GOVERNMENT_SERVICES as RAW_SERVICES } from '../data/governmentServices';

export const GOVERNMENT_SERVICES: GovernmentService[] = RAW_SERVICES.map((s) => ({
  ...s,
  official_source: 'Government of India / National Portals',
  last_verified: '2026-08-01',
  searchKeywords: [
    ...(s.tags || []),
    s.title.toLowerCase(),
    s.category.toLowerCase(),
    s.slug,
    s.id,
  ],
  searchKeywords_ta: [
    ...(s.tags_ta || []),
    s.title_ta,
    s.category_ta,
  ],
}));

export const POPULAR_SERVICES: GovernmentService[] = GOVERNMENT_SERVICES.filter((s) => s.is_popular);
export const NEW_ONLINE_SERVICES: GovernmentService[] = GOVERNMENT_SERVICES.filter((s) => s.is_new);
