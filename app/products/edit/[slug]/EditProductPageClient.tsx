'use client';

import { ProductForm } from '@/components/admin/product-form/ProductForm';
import { Skeleton } from '@/components/ui/skeleton';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useNotify } from '@/hooks/useNotify';
import { useProducts } from '@/hooks/useProducts';
import { ProductFormType, UpdateProductInput } from '@/lib/validation/product';

import axios from 'axios';
import { useRouter } from 'next/navigation';

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
  const notify = useNotify();

  async function handleSubmit(data: ProductFormType) {
    // Thumbnail
    let thumbnailUrl: string | null | undefined = undefined;
    if (data.thumbnail instanceof File) {
      if (product?.thumbnail) {
        await axios.post('/api/images/delete', { imagePath: product.thumbnail });
      }
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
    } else if (data.thumbnail === undefined) {
      // اگر کاربر تصویر را حذف کرده بود (thumbnail = undefined)
      if (product?.thumbnail) {
        await axios.post('/api/images/delete', { imagePath: product.thumbnail });
      }
      thumbnailUrl = null;
    }

    // Gallery
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

    /* ------------------ UPDATE ------------------ */
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
      specifications: data.specifications ?? [],
      isFeatured: data.isFeatured,
      isNew: data.isNew,
      status: data.status,
      // slug can be changed if title changed, but we'll handle on server if needed
    };

    updateMutation.mutate(
      { slug, data: updateData },
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
          console.error(error);
        },
      }
    );
  }
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <Skeleton variant="text" className="h-8 w-2/3 mb-6" />
        <Skeleton variant="rect" className="h-10 w-full" />
        <Skeleton variant="rect" className="h-32 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="rect" className="h-10 w-full" />
          <Skeleton variant="rect" className="h-10 w-full" />
        </div>
        <Skeleton variant="rect" className="h-10 w-full" />
        <Skeleton variant="rect" className="h-40 w-full" />
        <Skeleton variant="rect" className="h-40 w-full" />
        <Skeleton variant="rect" className="h-12 w-full rounded-lg" />
      </div>
    );
  }
  if (isError || !product) return <p>خطا در دریافت محصول ❌</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">✏️ ویرایش محصول</h1>
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        initialValues={{
          title: product.title,
          description: product.description,
          price: Number(product.price),
          discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
          brandSlug: product.brand?.slug ?? '',
          categorySlug: product.category?.slug ?? '',
          stockQuantity: product.stockQuantity,
          thumbnail: product.thumbnail ?? undefined,
          images: product.images ?? [],
          keyFeatures: product.keyFeatures ?? [],
          colors: product.colors ?? [],
          variants: product.variants ?? [],
          specifications: product.specifications ?? [],
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          status: product.status,
        }}
        brands={brands}
        categories={categories}
      />
      {updateMutation.isError && <p className="text-red-500">خطا در ویرایش محصول</p>}
      {updateMutation.isSuccess && <p className="text-green-600">محصول با موفقیت ویرایش شد ✅</p>}
    </div>
  );
}
