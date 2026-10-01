'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { ProductForm } from '@/components/admin/product-form/ProductForm';

import { useGetBrands } from '@/hooks/useBrands';
import { useGetCategories } from '@/hooks/useCategories';
import { useNotify } from '@/hooks/useNotify';
import { useCreateProduct } from '@/hooks/useProducts';

import { logger } from '@/lib/logger';
import { toSlug } from '@/lib/slug-common';

import { CreateProductPayload, ProductFormType, productFormSchema } from '@/lib/validation/product';

import { uploadImage } from '@/services/upload/api/images';

const defaultValues: ProductFormType = {
  title: '',
  description: '',
  price: 0,
  discountPrice: null,
  brandSlug: '',
  categorySlug: '',
  stockQuantity: 0,
  thumbnail: undefined,
  images: [],
  keyFeatures: [],
  colors: [],
  variants: [],
  specifications: [],
  isFeatured: false,
  isNew: true,
  status: 'PUBLISHED',
};

export default function CreateProductPageClient() {
  const router = useRouter();

  const form = useForm<ProductFormType>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  });

  const createMutation = useCreateProduct();
  const { data: brands } = useGetBrands();
  const { data: categories } = useGetCategories();
  const notify = useNotify();

  async function handleSubmit(data: ProductFormType) {
    const slug = toSlug(data.title);

    let thumbnailUrl = '';

    if (data.thumbnail instanceof File) {
      thumbnailUrl = await uploadImage(data.thumbnail, `products/${slug}/thumbnail`, data.title);
    } else if (typeof data.thumbnail === 'string') {
      thumbnailUrl = data.thumbnail;
    }

    const imageUrls: string[] = [];

    for (const img of data.images ?? []) {
      if (img instanceof File) {
        const imageUrl = await uploadImage(img, `products/${slug}/gallery`, data.title);

        imageUrls.push(imageUrl);
      } else if (typeof img === 'string') {
        imageUrls.push(img);
      }
    }

    const cleanedColors = (data.colors ?? []).filter(color => color.name && color.hex);

    const cleanedSpecifications = (data.specifications ?? []).filter(
      spec => spec.attributeId && String(spec.value).trim() !== ''
    );

    const payload: CreateProductPayload = {
      title: data.title,
      description: data.description,
      price: data.price,
      discountPrice: data.discountPrice ?? null,
      stockQuantity: data.stockQuantity ?? 0,
      thumbnail: thumbnailUrl || null,
      images: imageUrls,
      keyFeatures: data.keyFeatures ?? [],
      colors: cleanedColors,
      variants: data.variants ?? [],
      specifications: cleanedSpecifications,
      isFeatured: data.isFeatured ?? false,
      isNew: data.isNew ?? true,
      status: data.status ?? 'PUBLISHED',
      brandSlug: data.brandSlug,
      categorySlug: data.categorySlug,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        notify.success('محصول با موفقیت ایجاد شد ✅');
        router.push('/products');
      },
      onError: (error: any) => {
        const serverError = error?.response?.data?.error;

        if (serverError) {
          notify.error(serverError);
        } else if (error?.response?.status === 409) {
          notify.error('اسلاگ تکراری است');
        } else {
          notify.error('خطا در ایجاد محصول');
        }

        logger.error(error);
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">📦 ایجاد محصول جدید</h1>

      <ProductForm
        form={form}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
