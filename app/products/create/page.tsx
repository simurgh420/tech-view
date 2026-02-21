'use client';

import { ProductForm } from '@/components/admin/product-form/ProductForm';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { toSlug } from '@/lib/slug';
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleSubmit(data: any) {
    const slug = toSlug(data.title);
    let thumbnailUrl = '';

    // اگر تصویر آپلود شده بود
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

    createMutation.mutate(
      {
        ...data,
        slug,
        thumbnail: thumbnailUrl,
        isFeatured: false,
        isNew: true,
        stockQuantity: data.stockQuantity ?? 0,
        images: [],
        specifications: data.specifications ?? {},
        status: 'PUBLISHED',
        publishedAt: null,
      },
      { onSuccess: () => router.push('/products') }
    );
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
