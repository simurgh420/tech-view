'use client';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from 'next/navigation';

import { ProductForm } from '@/components/admin/product-form/ProductForm';

import { useNotify } from '@/hooks/useNotify';

import { useGetProduct, useUpdateProduct } from '@/hooks/useProducts';

import { logger } from '@/lib/logger';

import { productFormSchema, ProductFormType, UpdateProductInput } from '@/lib/validation/product';

import { deleteImage, uploadImage } from '@/services/upload/api/images';

type ProductEditFormProps = {
  slug: string;

  product: NonNullable<ReturnType<typeof useGetProduct>['data']>;

  brands?: {
    slug: string;
    name: string;
  }[];

  categories?: {
    slug: string;
    title: string;
  }[];
};

export default function ProductEditForm({
  slug,
  product,
  brands,
  categories,
}: ProductEditFormProps) {
  const router = useRouter();

  const updateMutation = useUpdateProduct();

  const notify = useNotify();

  const form = useForm<ProductFormType>({
    resolver: zodResolver(productFormSchema),

    defaultValues: {
      title: product.title,

      description: product.description,

      price: Number(product.price),

      discountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,

      brandSlug: product.brand?.slug ?? '',

      categorySlug: product.category?.slug ?? '',

      stockQuantity: product.stockQuantity,

      thumbnail: product.thumbnail ?? undefined,

      images: product.images ?? [],

      keyFeatures: product.keyFeatures ?? [],

      colors: product.colors ?? [],

      variants: product.variants ?? [],

      specifications: (product.specifications ?? [])
        .flatMap(group => group.items)
        .filter(item => item.attributeId && String(item.value).trim() !== '')
        .map(item => ({
          attributeId: item.attributeId as string,

          value: String(item.value),
        })),

      isFeatured: product.isFeatured,

      isNew: product.isNew,

      status: product.status,
    },
  });

  async function handleSubmit(data: ProductFormType) {
    try {
      // --------------------------------------------------
      // Thumbnail
      // --------------------------------------------------

      let thumbnailUrl: string | null | undefined = undefined;

      if (data.thumbnail instanceof File) {
        // اول Upload تصویر جدید

        thumbnailUrl = await uploadImage(data.thumbnail, `products/${slug}/thumbnail`, data.title);

        // بعد حذف تصویر قبلی

        if (product.thumbnail && product.thumbnail !== thumbnailUrl) {
          await deleteImage(product.thumbnail);
        }
      } else if (typeof data.thumbnail === 'string') {
        thumbnailUrl = data.thumbnail;
      } else if (data.thumbnail === undefined) {
        if (product.thumbnail) {
          await deleteImage(product.thumbnail);
        }

        thumbnailUrl = null;
      }

      // --------------------------------------------------
      // Gallery
      // --------------------------------------------------

      const imageUrls: string[] = [];

      for (const img of data.images ?? []) {
        if (img instanceof File) {
          const imageUrl = await uploadImage(img, `products/${slug}/gallery`, data.title);

          imageUrls.push(imageUrl);
        } else if (typeof img === 'string') {
          imageUrls.push(img);
        }
      }

      // --------------------------------------------------
      // Specifications
      // --------------------------------------------------

      const cleanedSpecs = (data.specifications ?? []).filter(
        spec => spec.attributeId && String(spec.value).trim() !== ''
      );

      // --------------------------------------------------
      // UPDATE
      // --------------------------------------------------

      const updateData: UpdateProductInput = {
        title: data.title,

        description: data.description,

        price: data.price,

        discountPrice: data.discountPrice ?? null,

        brandSlug: data.brandSlug,

        categorySlug: data.categorySlug,

        stockQuantity: data.stockQuantity ?? 0,

        thumbnail: thumbnailUrl,

        images: imageUrls,

        keyFeatures: data.keyFeatures ?? [],

        colors: data.colors ?? [],

        variants: data.variants ?? [],

        specifications: cleanedSpecs,

        isFeatured: data.isFeatured,

        isNew: data.isNew,

        status: data.status,
      };

      updateMutation.mutate(
        {
          slug,
          data: updateData,
        },
        {
          onSuccess: () => {
            notify.success('محصول با موفقیت ویرایش شد ✅');

            router.push('/products');
          },

          onError: (error: any) => {
            const serverError = error?.response?.data?.error;

            if (serverError) {
              notify.error(serverError);
            } else if (error?.response?.status === 409) {
              notify.error('اسلاگ تکراری است');
            } else {
              notify.error('خطا در ویرایش محصول');
            }

            logger.error(error);
          },
        }
      );
    } catch (error: any) {
      logger.error(error);

      notify.error('خطا در آپلود یا حذف تصاویر محصول');
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">✏️ ویرایش محصول</h1>

      <ProductForm
        form={form}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
