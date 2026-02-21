// components/product/info/ProductVariants.tsx
export default function ProductVariants({
  colors,
  variants,
}: {
  colors: { name: string; hex: string }[];
  variants: { ram: string; storage: string }[];
}) {
  return (
    <div className="space-y-4">
      {/* رنگ‌ها */}
      {colors.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">رنگ‌ها</h4>
          <div className="flex gap-3">
            {colors.map((c, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full border cursor-pointer"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* نسخه‌ها */}
      {variants.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">نسخه‌ها</h4>
          <div className="flex gap-3 flex-wrap">
            {variants.map((v, i) => (
              <button
                key={i}
                className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {v.ram} / {v.storage}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
