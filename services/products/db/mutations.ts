import prisma from '@/services/db/client';
import type { CreateProductInput, UpdateProductInput } from '@/lib/validation/product';
import { Prisma } from '@/app/generated/prisma/client';
import { generateUniqueSlug } from '@/lib/server/slug';
import { logger } from '@/lib/logger';
import { toSlug } from '@/lib/slug-common';
import { formatProduct } from '../utils/formatProduct';
import { productIncludes } from '../productIncludes';

function calculateDiscount(price: number, discountPrice: number | null) {
  if (discountPrice !== null && discountPrice < price) {
    return {
      isDiscounted: true,
      discountPercentage: Math.round(((price - discountPrice) / price) * 100),
    };
  }

  return {
    isDiscounted: false,
    discountPercentage: null,
  };
}

function prepareSpecifications(
  productId: string,
  specifications?: CreateProductInput['specifications']
) {
  if (!specifications || !Array.isArray(specifications)) {
    return [];
  }

  return specifications.flatMap(group =>
    (group.items ?? []).map(item => ({
      productId,
      key: item.label,
      value: item.value,
      groupName: group.group,
    }))
  );
}

export async function createProduct(data: CreateProductInput) {
  const startTime = Date.now();

  try {
    const priceNum = data.price;
    const discountNum = data.discountPrice ?? null;

    const { isDiscounted, discountPercentage } = calculateDiscount(priceNum, discountNum);

    const baseSlug = data.slug?.trim() || toSlug(data.title);

    const uniqueSlug = await generateUniqueSlug(baseSlug);

    const created = await prisma.$transaction(
      async tx => {
        /**
         * فقط id می‌گیریم
         * چون داخل transaction نیازی به relation نداریم
         */
        const product = await tx.product.create({
          data: {
            title: data.title,
            slug: uniqueSlug,

            description: data.description,

            price: priceNum,
            discountPrice: discountNum,
            discountPercentage,
            isDiscounted,

            isFeatured: data.isFeatured ?? false,
            isNew: data.isNew ?? true,

            stockQuantity: data.stockQuantity ?? 0,

            thumbnail: data.thumbnail ?? null,
            images: data.images ?? [],

            keyFeatures: data.keyFeatures ?? [],
            colors: data.colors ?? [],
            variants: data.variants ?? [],

            status: data.status ?? 'DRAFT',

            brand: {
              connect: {
                slug: data.brandSlug,
              },
            },

            category: {
              connect: {
                slug: data.categorySlug,
              },
            },

            ...(data.subCategorySlug
              ? {
                  subCategory: {
                    connect: {
                      slug: data.subCategorySlug,
                    },
                  },
                }
              : {}),

            publishedAt: data.publishedAt
              ? new Date(data.publishedAt)
              : data.status === 'PUBLISHED'
                ? new Date()
                : null,
          },

          select: {
            id: true,
          },
        });

        /**
         * bulk insert specifications
         */
        const specifications = prepareSpecifications(product.id, data.specifications);

        if (specifications.length > 0) {
          await tx.productSpecification.createMany({
            data: specifications,
          });
        }

        return product;
      },
      {
        timeout: 15000,
      }
    );

    /**
     * بعد از commit محصول کامل را می‌گیریم
     */
    const product = await prisma.product.findUniqueOrThrow({
      where: {
        id: created.id,
      },
      include: productIncludes,
    });

    const formatted = formatProduct(product);

    logger.info('createProduct success', {
      productId: product.id,
      slug: uniqueSlug,
      title: data.title,
      duration: Date.now() - startTime,
    });

    return formatted;
  } catch (error: any) {
    logger.error('createProduct failed', {
      title: data.title,
      brandSlug: data.brandSlug,
      error: error instanceof Error ? error.message : 'Unknown',

      code: error.code,

      duration: Date.now() - startTime,
    });

    if (error.code === 'P2002') {
      throw new Error(`Product with slug "${data.slug}" already exists`);
    }

    throw error;
  }
}
export async function updateProduct(slug: string, data: UpdateProductInput) {
  const startTime = Date.now();

  try {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, title: true, price: true, discountPrice: true },
    });

    if (!existing) {
      logger.info('updateProduct: product not found', { slug, duration: Date.now() - startTime });
      return null;
    }

    // ✅ محاسبه‌ی slug جدید قبل از شروع تراکنش
    let newSlug: string | undefined;
    if (data.slug !== undefined || data.title !== undefined) {
      const baseSlug = data.slug || toSlug(data.title ?? existing.title);
      newSlug = await generateUniqueSlug(baseSlug, existing.id);
    }

    const updated = await prisma.$transaction(
      async tx => {
        const updateData: Prisma.ProductUpdateInput = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
        if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
        if (data.images !== undefined) updateData.images = data.images;
        if (data.keyFeatures !== undefined) updateData.keyFeatures = data.keyFeatures;
        if (data.colors !== undefined) updateData.colors = data.colors;
        if (data.variants !== undefined) updateData.variants = data.variants;
        if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
        if (data.isNew !== undefined) updateData.isNew = data.isNew;
        if (data.status !== undefined) updateData.status = data.status;

        if (data.publishedAt !== undefined) {
          updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null;
        }

        // ✅ از قبل حساب شده، دیگه await داخل تراکنش نداره
        if (newSlug !== undefined) {
          updateData.slug = newSlug;
        }

        if (data.brandSlug !== undefined) {
          updateData.brand = { connect: { slug: data.brandSlug } };
        }

        if (data.categorySlug !== undefined) {
          updateData.category = { connect: { slug: data.categorySlug } };
        }

        if (data.subCategorySlug === null) {
          updateData.subCategory = { disconnect: true };
        } else if (data.subCategorySlug !== undefined) {
          updateData.subCategory = { connect: { slug: data.subCategorySlug } };
        }

        if (data.price !== undefined || data.discountPrice !== undefined) {
          const finalPrice = data.price ?? Number(existing.price);
          const finalDiscountPrice =
            data.discountPrice !== undefined
              ? data.discountPrice
              : existing.discountPrice
                ? Number(existing.discountPrice)
                : null;

          const { isDiscounted, discountPercentage } = calculateDiscount(
            finalPrice,
            finalDiscountPrice
          );

          updateData.price = finalPrice;
          updateData.discountPrice = finalDiscountPrice;
          updateData.isDiscounted = isDiscounted;
          updateData.discountPercentage = discountPercentage;
        }

        await tx.product.update({
          where: { id: existing.id },
          data: updateData,
        });

        if (data.specifications !== undefined) {
          await tx.productSpecification.deleteMany({
            where: { productId: existing.id },
          });

          const specifications = data.specifications.flatMap(group =>
            (group.items ?? []).map(item => ({
              productId: existing.id,
              key: item.label,
              value: item.value,
              groupName: group.group,
            }))
          );

          if (specifications.length > 0) {
            await tx.productSpecification.createMany({ data: specifications });
          }
        }

        return { id: existing.id };
      },
      { timeout: 15000 }
    );

    const product = await prisma.product.findUniqueOrThrow({
      where: { id: updated.id },
      include: productIncludes,
    });

    const formatted = formatProduct(product);

    logger.info('updateProduct success', {
      productId: product.id,
      slug: product.slug,
      duration: Date.now() - startTime,
    });

    return formatted;
  } catch (error: any) {
    logger.error('updateProduct failed', {
      slug,
      error: error instanceof Error ? error.message : 'Unknown',
      code: error.code,
      duration: Date.now() - startTime,
    });

    throw error;
  }
}

export async function deleteProduct(slug: string): Promise<boolean> {
  const startTime = Date.now();

  try {
    const product = await prisma.product.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
      },
    });

    if (!product) {
      logger.info('deleteProduct: product not found', {
        slug,
        duration: Date.now() - startTime,
      });

      return false;
    }

    await prisma.product.delete({
      where: {
        slug,
      },
    });

    logger.info('deleteProduct success', {
      slug,

      duration: Date.now() - startTime,
    });

    return true;
  } catch (error) {
    logger.error('deleteProduct failed', {
      slug,

      error: error instanceof Error ? error.message : 'Unknown',

      duration: Date.now() - startTime,
    });

    throw error;
  }
}
