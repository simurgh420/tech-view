// components/product/SortMenu.tsx
'use client';

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function SortMenu({ value, onChange }: Props) {
  return (
    <select
      className="border rounded px-2 py-1 text-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="featured">ویژه‌ها</option>
      <option value="price-asc">قیمت: صعودی</option>
      <option value="price-desc">قیمت: نزولی</option>
      <option value="new">جدیدترین‌ها</option>
    </select>
  );
}
