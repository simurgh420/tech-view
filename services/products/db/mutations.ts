// services/products/db/mutations.ts
import prisma from '@/services/db/client';
import type { CreateProductInput, UpdateProductInput } from '@/lib/validation/product';
import { Prisma } from '@/app/generated/prisma/client';
import { generateUniqueSlug } from '@/lib/server/slug';
import { logger } from '@/lib/logger';
import { toSlug } from '@/lib/slug-common';
import { formatProduct } from '../utils/formatProduct';

function calculateDiscount(price: number, discountPrice: number | null) {
  if (discountPrice !== null && discountPrice < price) {
    return {
      isDiscounted: true,
      discountPercentage: Math.round(((price - discountPrice) / price) * 100),
    };
  }
  return { isDiscounted: false, discountPercentage: null };
}

export async function createProduct(data: CreateProductInput) {
  const startTime = Date.now();
  try {
    const priceNum = data.price;
    const discountNum = data.discountPrice ?? null;
    const { isDiscounted, discountPercentage } = calculateDiscount(priceNum, discountNum);

    const baseSlug = data.slug?.trim() || toSlug(data.title);
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    const product = await prisma.$transaction(async tx => {
      // 1. ایجاد محصول
      const newProduct = await tx.product.create({
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
          brand: { connect: { slug: data.brandSlug } },
          category: { connect: { slug: data.categorySlug } },
          ...(data.subCategorySlug
            ? { subCategory: { connect: { slug: data.subCategorySlug } } }
            : {}),
          publishedAt: data.publishedAt
            ? new Date(data.publishedAt)
            : data.status === 'PUBLISHED'
              ? new Date()
              : null,
        },
        include: { brand: true, category: true, subCategory: true },
      });

      // 2. ذخیره مشخصات در جدول ProductSpecification
      if (data.specifications && Array.isArray(data.specifications)) {
        for (const group of data.specifications) {
          const groupName = group.group;
          const items = group.items ?? [];
          for (const item of items) {
            await tx.productSpecification.create({
              data: {
                productId: newProduct.id,
                key: item.label,
                value: item.value,
                groupName,
              },
            });
          }
        }
      }

      return newProduct;
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
    if (error.code === 'P2002') throw new Error(`Product with slug "${data.slug}" already exists`);
    throw error;
  }
}

export async function updateProduct(slug: string, data: UpdateProductInput) {
  const startTime = Date.now();
  try {
    const existing = await prisma.product.findUnique({
      where: { slug },
      include: { brand: true, category: true, subCategory: true },
    });
    if (!existing) {
      logger.info('updateProduct: product not found', { slug, duration: Date.now() - startTime });
      return null;
    }

    const updatedProduct = await prisma.$transaction(async tx => {
      // 1. ساخت آبجکت بروزرسانی برای فیلدهای اصلی محصول
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

      if (data.slug !== undefined || data.title !== undefined) {
        const baseSlug = data.slug || toSlug(data.title ?? existing.title);
        const newSlug = await generateUniqueSlug(baseSlug, existing.id);
        updateData.slug = newSlug;
      }
      if (data.brandSlug !== undefined) updateData.brand = { connect: { slug: data.brandSlug } };
      if (data.categorySlug !== undefined)
        updateData.category = { connect: { slug: data.categorySlug } };
      if (data.subCategorySlug === null) {
        updateData.subCategory = { disconnect: true };
      } else if (data.subCategorySlug !== undefined) {
        updateData.subCategory = { connect: { slug: data.subCategorySlug } };
      }

      const finalPrice = data.price ?? Number(existing.price);
      let finalDiscountPrice: number | null = null;
      if (data.discountPrice !== undefined) {
        finalDiscountPrice = data.discountPrice;
      } else if (existing.discountPrice) {
        finalDiscountPrice = Number(existing.discountPrice);
      }

      const { isDiscounted, discountPercentage } = calculateDiscount(
        finalPrice,
        finalDiscountPrice
      );
      if (data.price !== undefined || data.discountPrice !== undefined) {
        updateData.price = finalPrice;
        updateData.discountPrice = finalDiscountPrice;
        updateData.isDiscounted = isDiscounted;
        updateData.discountPercentage = discountPercentage;
      }

      // 2. بروزرسانی محصول
      await tx.product.update({
        where: { slug },
        data: updateData,
      });

      // 3. به‌روزرسانی مشخصات: حذف قبلی و درج مجدد
      if (data.specifications !== undefined) {
        await tx.productSpecification.deleteMany({ where: { productId: existing.id } });
        if (Array.isArray(data.specifications)) {
          for (const group of data.specifications) {
            const groupName = group.group;
            const items = group.items ?? [];
            for (const item of items) {
              await tx.productSpecification.create({
                data: {
                  productId: existing.id,
                  key: item.label,
                  value: item.value,
                  groupName,
                },
              });
            }
          }
        }
      }

      // 4. بازگرداندن محصول نهایی (همراه با مشخصات)
      return tx.product.findUnique({
        where: { id: existing.id },
        include: {
          brand: true,
          category: true,
          subCategory: true,
          specifications: true, // مهم: بارگذاری مشخصات جدید
        },
      });
    });

    const formatted = formatProduct(updatedProduct);
    logger.info('updateProduct success', {
      productId: updatedProduct!.id,
      slug: updatedProduct!.slug,
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
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!product) {
      logger.info('deleteProduct: product not found', { slug, duration: Date.now() - startTime });
      return false;
    }
    await prisma.product.delete({ where: { slug } });
    logger.info('deleteProduct success', { slug, duration: Date.now() - startTime });
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
