import prisma from '@/services/db/client';

export async function dbSearch(query: string) {
  if (!query || query.trim() === '') {
    return {
      blogs: [],
      products: [],
      categories: [],
    };
  }

  const q = query.trim();

  const blogsPromise = prisma.blogPost.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        {
          tags: {
            some: {
              tag: {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { slug: { contains: q, mode: 'insensitive' } },
                ],
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const productsPromise = prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        {
          specifications: {
            some: {
              OR: [
                { key: { contains: q, mode: 'insensitive' } },
                { value: { contains: q, mode: 'insensitive' } },
                { groupName: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          brand: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        {
          category: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        {
          subCategory: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      thumbnail: true,
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      category: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  const categoriesPromise = prisma.category.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        {
          parent: {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { slug: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
        {
          children: {
            some: {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      icon: true,
      parentId: true,
      parent: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  const [blogs, products, categories] = await Promise.all([
    blogsPromise,
    productsPromise,
    categoriesPromise,
  ]);

  return {
    blogs,
    products,
    categories,
  };
}
