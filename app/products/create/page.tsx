'use client';

import { ProductFormValues } from '@/components/admin/product-form/product.schema';
import { ProductForm } from '@/components/admin/product-form/ProductForm';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { toSlug } from '@/lib/slug';
import { ProductPayload } from '@/types/product';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateProductPage() {
  const router = useRouter();
  const { useCreateProduct } = useProducts();
  const createMutation = useCreateProduct();
  const { useGetBrands } = useBrands();
  const { data: brands } = useGetBrands();
  const { useGetCategories } = useCategories();
  const { data: categories } = useGetCategories();

  async function handleSubmit(data: ProductFormValues) {
    const slug = toSlug(data.title);
    let thumbnailUrl = '';

    /* ------------------ thumbnail ------------------ */
    if (data.thumbnail instanceof File) {
      const formData = new FormData();
      formData.append('file', data.thumbnail);
      formData.append('folder', `products/${slug}/thumbnail`);
      formData.append('baseName', data.title);

      const res = await axios.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      thumbnailUrl = res.data.imageUrl;
    }
    /* ------------------ gallery images ------------------ */
    const galleryUrls: string[] = [];
    for (const img of data.images) {
      if (img instanceof File) {
        const formData = new FormData();
        formData.append('file', img);
        formData.append('folder', `products/${slug}/gallery`);
        formData.append('baseName', data.title);

        const res = await axios.post('/api/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        galleryUrls.push(res.data.imageUrl);
      } else if (typeof img === 'string') {
        galleryUrls.push(img);
      }
    }
    /* ------------------ final payload ------------------ */
    const payload: ProductPayload = {
      ...data,
      slug,
      thumbnail: thumbnailUrl,
      images: galleryUrls,
      keyFeatures: data.keyFeatures ?? [],
      colors: data.colors ?? [],
      variants: data.variants ?? [],
      specifications: data.specifications ?? {},
      stockQuantity: data.stockQuantity ?? 0,
      isFeatured: false,
      isNew: true,
      status: 'PUBLISHED',
      publishedAt: null,
    };
    createMutation.mutate(payload, {
      onSuccess: () => router.push('/products'),
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">📦 ایجاد محصول جدید</h1>
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        initialValues={{}}
        brands={brands}
        categories={categories}
      />
      {createMutation.isError && <p className="text-red-500">خطا در ایجاد محصول</p>}
      {createMutation.isSuccess && <p className="text-green-600">محصول با موفقیت ایجاد شد ✅</p>}
    </div>
  );
}
