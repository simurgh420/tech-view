// components/product/ProductFilters.tsx
export default function ProductFilters() {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-6">
      <h3 className="font-bold text-lg">فیلترها</h3>

      {/* فیلتر قیمت */}
      <div>
        <label className="block text-sm font-medium mb-1">محدوده قیمت</label>
        <input type="range" min="0" max="50000000" className="w-full" />
      </div>

      {/* فیلتر برند */}
      <div>
        <label className="block text-sm font-medium mb-1">برند</label>
        <ul className="space-y-1 text-sm">
          <li>
            <input type="checkbox" /> Apple
          </li>
          <li>
            <input type="checkbox" /> Samsung
          </li>
          <li>
            <input type="checkbox" /> TM-D
          </li>
          <li>
            <input type="checkbox" /> Cypher
          </li>
        </ul>
      </div>

      {/* فیلتر رم */}
      <div>
        <label className="block text-sm font-medium mb-1">رم</label>
        <ul className="space-y-1 text-sm">
          <li>
            <input type="checkbox" /> 4 گیگ
          </li>
          <li>
            <input type="checkbox" /> 6 گیگ
          </li>
          <li>
            <input type="checkbox" /> 8 گیگ
          </li>
        </ul>
      </div>

      {/* فیلتر رنگ، حافظه، شبکه، ارسال سریع */}
    </div>
  );
}
