// components/product/info/ProductKeyFeatures.tsx
export default function ProductKeyFeatures({ features }: { features: string[] }) {
  if (!features.length) return null;

  return (
    <ul className="space-y-2 text-gray-700 dark:text-gray-300 list-disc pr-5">
      {features.map((f, i) => (
        <li key={i} className="leading-relaxed">
          {f}
        </li>
      ))}
    </ul>
  );
}
