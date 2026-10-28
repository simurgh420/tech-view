// 'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';

// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Button } from '@/components/ui/button';
// import { ImageUploader } from '../image/ImageUploader';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { productFormSchema, ProductFormType } from '@/lib/validation/product';

// type Props = {
//   initialValues?: Partial<ProductFormType>;
//   onSubmit: (data: ProductFormType) => void;
//   isLoading?: boolean;
//   brands?: { slug: string; name: string }[];
//   categories?: { slug: string; title: string }[];
// };
// const formatPrice = (value: number | null | undefined) =>
//   value ? new Intl.NumberFormat().format(value) : '';

// export function ProductForm({
//   initialValues,
//   onSubmit,
//   isLoading,
//   brands = [],
//   categories = [],
// }: Props) {
//   const form = useForm<ProductFormType>({
//     resolver: zodResolver(productFormSchema),
//     defaultValues: {
//       title: initialValues?.title ?? '',
//       description: initialValues?.description ?? '',
//       price: initialValues?.price ?? 0,
//       discountPrice: initialValues?.discountPrice ?? null,
//       brandSlug: initialValues?.brandSlug ?? '',
//       categorySlug: initialValues?.categorySlug ?? '',
//       stockQuantity: initialValues?.stockQuantity ?? 0,
//       thumbnail: initialValues?.thumbnail ?? undefined,
//       images: initialValues?.images ?? [],
//       keyFeatures: initialValues?.keyFeatures ?? [],
//       colors: initialValues?.colors ?? [],
//       variants: initialValues?.variants ?? [],
//       specifications: initialValues?.specifications ?? [],
//       isFeatured: initialValues?.isFeatured ?? false,
//       isNew: initialValues?.isNew ?? true,
//       status: initialValues?.status ?? 'PUBLISHED',
//     },
//   });

//   return (
//     <Form {...form}>
//       <form
//         data-testid="product-form"
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="space-y-6"
//         dir="rtl"
//       >
//         {/* عنوان */}
//         <FormField
//           control={form.control}
//           name="title"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>عنوان محصول</FormLabel>
//               <FormControl>
//                 <Input
//                   className="text-right"
//                   placeholder="مثلاً: گوشی موبایل سامسونگ A36"
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         {/* توضیحات */}
//         <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>توضیحات</FormLabel>
//               <FormControl>
//                 <Textarea
//                   className="text-right"
//                   rows={4}
//                   placeholder="توضیحات کامل محصول..."
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* قیمت */}
//         <FormField
//           control={form.control}
//           name="price"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>قیمت</FormLabel>
//               <FormControl>
//                 <Input
//                   type="text"
//                   inputMode="numeric"
//                   value={formatPrice(field.value)}
//                   onChange={e => {
//                     const raw = e.target.value.replace(/\D/g, '');
//                     field.onChange(raw ? Number(raw) : undefined);
//                   }}
//                   placeholder="مثلاً: 1,250,000"
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* قیمت تخفیف */}
//         <FormField
//           control={form.control}
//           name="discountPrice"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>قیمت تخفیف</FormLabel>
//               <FormControl>
//                 <Input
//                   type="text"
//                   inputMode="numeric"
//                   value={field.value ? new Intl.NumberFormat('en-US').format(field.value) : ''}
//                   onChange={e => {
//                     const raw = e.target.value.replace(/\D/g, '');
//                     field.onChange(raw ? Number(raw) : null);
//                   }}
//                   placeholder="مثلاً: 950,000"
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* برند */}
//         <FormField
//           control={form.control}
//           name="brandSlug"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>برند</FormLabel>
//               <FormControl>
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="انتخاب برند" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {brands?.map(brand => (
//                       <SelectItem key={brand.slug} value={brand.slug}>
//                         {brand.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* دسته‌بندی */}
//         <FormField
//           control={form.control}
//           name="categorySlug"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>دسته‌بندی</FormLabel>
//               <FormControl>
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="انتخاب دسته‌بندی" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories?.map(category => (
//                       <SelectItem key={category.slug} value={category.slug}>
//                         {category.title}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         {/* موجودی انبار */}
//         <FormField
//           control={form.control}
//           name="stockQuantity"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>موجودی انبار</FormLabel>
//               <FormControl>
//                 <Input
//                   type="text"
//                   inputMode="numeric"
//                   value={field.value ? new Intl.NumberFormat('en-US').format(field.value) : ''}
//                   onChange={e => {
//                     const raw = e.target.value.replace(/\D/g, '');
//                     field.onChange(raw ? Number(raw) : undefined);
//                   }}
//                   placeholder="مثلاً: 150"
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {/* تصویر شاخص */}
//         <FormField
//           control={form.control}
//           name="thumbnail"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>تصویر شاخص</FormLabel>
//               <FormControl>
//                 <ImageUploader
//                   initialUrl={typeof field.value === 'string' ? field.value : null}
//                   onChange={file => field.onChange(file)}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         {/* گالری تصاویر */}
//         <FormField
//           control={form.control}
//           name="images"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>گالری تصاویر</FormLabel>
//               <FormControl>
//                 <ImageUploader
//                   multiple
//                   initialUrls={field.value?.filter((v): v is string => typeof v === 'string') ?? []}
//                   onChange={() => {}}
//                   onMultipleChange={files => {
//                     const existingUrls = (field.value ?? []).filter(
//                       (v): v is string => typeof v === 'string'
//                     );
//                     if (files) {
//                       field.onChange([...existingUrls, ...files]);
//                     }
//                   }}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <Button type="submit" disabled={isLoading}>
//           {isLoading ? 'در حال ذخیره...' : initialValues?.title ? 'ویرایش محصول' : 'ثبت محصول'}
//         </Button>
//       </form>
//     </Form>
//   );
// }
