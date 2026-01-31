// components/product/SortMenu.tsx
export default function SortMenu() {
  return (
    <select className="border rounded px-2 py-1 text-sm">
      <option value="featured">ویژه‌ها</option>
      <option value="price-asc">قیمت: صعودی</option>
      <option value="price-desc">قیمت: نزولی</option>
      <option value="new">جدیدترین‌ها</option>
    </select>
  );
}
