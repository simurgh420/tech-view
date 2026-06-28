// components/product/info/ProductTitle.tsx
export default function ProductTitle({
  title,
  brand,
  model,
}: {
  title: string;
  brand: string;
  model?: string;
}) {
  return (
    <div className="space-y-1 text-right">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        برند <span className="font-medium">{brand}</span>
        {model && (
          <>
            {' '}
            • مدل <span className="font-medium">{model}</span>
          </>
        )}
      </p>
    </div>
  );
}
