// components/product/specs/SpecsRow.tsx
export default function SpecsRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-gray-200">{value}</span>
    </div>
  );
}
