import {
  NormalizedBlog,
  NormalizedProduct,
  NormalizedCategory,
  NormalizedSearchResult,
} from '@/types/search';

export function normalizeSearchResults({
  blogs,
  products,
  categories,
}: {
  blogs: any[];
  products: any[];
  categories: any[];
}): NormalizedSearchResult[] {
  const normalized: NormalizedSearchResult[] = [];

  // BLOGS
  for (const b of blogs) {
    const item: NormalizedBlog = {
      type: 'blog',
      id: b.id,
      title: b.title,
      slug: b.slug,
      description: b.excerpt,
      image: b.coverImageUrl,
      publishedAt: b.publishedAt,
      tags: b.tags?.map((t: any) => t.tag.name) ?? [],
    };
    normalized.push(item);
  }

  // PRODUCTS
  for (const p of products) {
    const item: NormalizedProduct = {
      type: 'product',
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description
        ?.replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 50),
      price: p.price,
      image: p.thumbnail,
      brand: p.brand?.name ?? null,
      category: p.category?.title ?? null,
      subCategory: p.subCategory?.title ?? null,
    };
    normalized.push(item);
  }

  // CATEGORIES
  for (const c of categories) {
    const item: NormalizedCategory = {
      type: 'category',
      id: c.id,
      title: c.title,
      slug: c.slug,
      icon: c.icon,
      parent: c.parent?.title ?? null,
    };
    normalized.push(item);
  }
  return normalized;
}
