// components/product/info/ProductKeyFeatures.tsx
export default function ProductKeyFeatures({ features }: { features: string[] }) {
  if (!features.length) return null;

  return (
    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="text-blue-500 mt-1">•</span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}
