// components/product/tabs/TabHeader.tsx
type Props = {
  active: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (tab: any) => void;
};

export default function TabHeader({ active, onChange }: Props) {
  const tabs = [
    { id: 'description', label: 'توضیحات' },
    { id: 'specs', label: 'مشخصات فنی' },
    { id: 'reviews', label: 'نظرات کاربران' },
    { id: 'questions', label: 'پرسش و پاسخ' },
  ];

  return (
    <div className="flex gap-6 border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`pb-3 text-sm font-medium transition relative ${
            active === tab.id
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {tab.label}

          {active === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-2px bg-blue-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
