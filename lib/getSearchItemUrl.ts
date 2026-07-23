import { NormalizedSearchResult } from '@/types/search';
import { ROUTES } from './searchRoutes';

const SEARCH_ROUTES = {
  blog: ROUTES.BLOGS,
  product: ROUTES.PRODUCTS,
  category: ROUTES.CATEGORIES,
  tag: ROUTES.TAGS,
} as const;

export function getSearchItemUrl(item: NormalizedSearchResult): string {
  return `${SEARCH_ROUTES[item.type]}/${item.slug}`;
}
