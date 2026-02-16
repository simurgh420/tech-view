'use client';

import { ProductForm, ProductFormType } from '@/components/sections/products/ProductForm';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { toSlug } from '@/lib/slug';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

export default function EditProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { useGetProduct, useUpdateProduct } = useProducts();

  // گرفتن محصول بر اساس slug
  const { data: product, isLoading, isError } = useGetProduct(slug);

  // گرفتن برندها و کتگوری‌ها
  const { useGetBrands } = useBrands();
  const { data: brands } = useGetBrands();

  const { useGetCategories } = useCategories();
  const { data: categories } = useGetCategories();

  const updateMutation = useUpdateProduct();

  async function handleSubmit(data: ProductFormType) {
    const slug = toSlug(data.title);
    let thumbnailUrl: string | null = null;

    if (data.thumbnail instanceof File) {
      // اگر تصویر قبلی وجود داشت → حذفش کن
      if (product?.thumbnail) {
        await axios.post('/api/images/delete', {
          imagePath: product.thumbnail,
        });
      }

      // آپلود تصویر جدید
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
    } else {
      // اگر کاربر تصویر رو حذف کرده بود
      if (product?.thumbnail) {
        await axios.post('/api/images/delete', {
          imagePath: product.thumbnail,
        });
      }
      thumbnailUrl = null;
    }

    updateMutation.mutate(
      {
        slug: product?.slug ?? '',
        data: {
          title: data.title,
          slug: toSlug(data.title),
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice != null ? data.discountPrice : null,
          brandSlug: data.brandSlug,
          categorySlug: data.categorySlug,
          stockQuantity: data.stockQuantity ?? 0,
          thumbnail: thumbnailUrl,
          specifications: data.specifications ?? {},
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
