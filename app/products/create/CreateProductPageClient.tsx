// app//products/create/CreateProductPageClient.tsx
'use client';
import { ProductForm } from '@/components/admin/product-form/ProductForm';
import { useGetBrands } from '@/hooks/useBrands';
import { useGetCategories } from '@/hooks/useCategories';
import { useNotify } from '@/hooks/useNotify';
import { useCreateProduct } from '@/hooks/useProducts';
import { toSlug } from '@/lib/slug-common';
import { CreateProductPayload, ProductFormType } from '@/lib/validation/product';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateProductPageClient() {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const { data: brands } = useGetBrands();
  const { data: categories } = useGetCategories();
  const notify = useNotify();

  async function handleSubmit(data: ProductFormType) {
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
    } else if (typeof data.thumbnail === 'string') {
      thumbnailUrl = data.thumbnail;
    }
    /* ------------------ gallery images ------------------ */
    const imageUrls: string[] = [];
    for (const img of data.images ?? []) {
      if (img instanceof File) {
        const formData = new FormData();
        formData.append('file', img);
        formData.append('folder', `products/${slug}/gallery`);
        formData.append('baseName', data.title);
        const res = await axios.post('/api/images/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrls.push(res.data.imageUrl);
      } else if (typeof img === 'string') {
        imageUrls.push(img);
      }
    }
    const cleanedColors = (data.colors ?? []).filter(c => c.name && c.hex);
    /* ------------------ final payload ------------------ */
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
      specifications: data.specifications ?? [],
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
        console.error(error);
      },
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">📦 ایجاد محصول جدید</h1>
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        brands={brands}
        categories={categories}
      />
      {createMutation.isError && <p className="text-red-500">خطا در ایجاد محصول</p>}
      {createMutation.isSuccess && <p className="text-green-600">محصول با موفقیت ایجاد شد ✅</p>}
    </div>
  );
}
