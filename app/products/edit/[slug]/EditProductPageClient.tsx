'use client';

import { ProductFormValues } from '@/components/admin/product-form/product.schema';
import { ProductForm } from '@/components/admin/product-form/ProductForm';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';

import axios from 'axios';
import {  useRouter } from 'next/navigation';

type EditProductProps = {
  slug: string;
};

export default function EditProductClientPage({ slug }: EditProductProps) {

  const router = useRouter();
  const { useGetProduct, useUpdateProduct } = useProducts();

  const { data: product, isLoading, isError } = useGetProduct(slug);

  const { useGetBrands } = useBrands();
  const { data: brands } = useGetBrands();

  const { useGetCategories } = useCategories();
  const { data: categories } = useGetCategories();

  const updateMutation = useUpdateProduct();

  async function handleSubmit(data: ProductFormValues) {
    const currentSlug = product?.slug ?? '';

    /* ------------------ THUMBNAIL ------------------ */
    let thumbnailUrl: string | null = null;

    if (data.thumbnail instanceof File) {
      if (product?.thumbnail) {
        await axios.post('/api/images/delete', { imagePath: product.thumbnail });
      }

      const formData = new FormData();
      formData.append('file', data.thumbnail);
      formData.append('folder', `products/${currentSlug}/thumbnail`);
      formData.append('baseName', data.title);

      const res = await axios.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      thumbnailUrl = res.data.imageUrl;
    } else if (typeof data.thumbnail === 'string') {
      thumbnailUrl = data.thumbnail;
    } else {
      if (product?.thumbnail) {
        await axios.post('/api/images/delete', { imagePath: product.thumbnail });
      }
      thumbnailUrl = null;
    }

    /* ------------------ GALLERY ------------------ */
    const galleryUrls: string[] = [];

    for (const img of data.images) {
      if (img instanceof File) {
        const formData = new FormData();
        formData.append('file', img);
        formData.append('folder', `products/${currentSlug}/gallery`);
        formData.append('baseName', data.title);

        const res = await axios.post('/api/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        galleryUrls.push(res.data.imageUrl);
      } else if (typeof img === 'string') {
        galleryUrls.push(img);
      }
    }

    /* ------------------ UPDATE ------------------ */
    updateMutation.mutate(
      {
        slug: currentSlug,
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice ?? null,
          brandSlug: data.brandSlug,
          categorySlug: data.categorySlug,
          stockQuantity: data.stockQuantity ?? 0,

          thumbnail: thumbnailUrl,
          images: galleryUrls,

          keyFeatures: data.keyFeatures ?? [],
          colors: data.colors ?? [],
          variants: data.variants ?? [],
          specifications: data.specifications ?? {},

          status: product?.status ?? 'PUBLISHED',
        },
      },
      { onSuccess: () => router.push('/products') }
    );
  }

  if (isLoading) return <p>در حال بارگذاری محصول...</p>;
  if (isError || !product) return <p>خطا در دریافت محصول ❌</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">✏️ ویرایش محصول</h1>

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        initialValues={{
          ...product,

          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
          stockQuantity: product.stockQuantity ?? 0,

          thumbnail: product.thumbnail ?? undefined,
          images: product.images ?? [],

          keyFeatures: product.keyFeatures ?? [],
          colors: product.colors ?? [],
          variants: product.variants ?? [],
          specifications: product.specifications ?? [],
          brandSlug: product.brand?.slug ?? '',
          categorySlug: product.category?.slug ?? '',
        }}
        brands={brands}
        categories={categories}
      />

      {updateMutation.isError && <p className="text-red-500">خطا در ویرایش محصول</p>}
      {updateMutation.isSuccess && <p className="text-green-600">محصول با موفقیت ویرایش شد ✅</p>}
    </div>
  );
}
