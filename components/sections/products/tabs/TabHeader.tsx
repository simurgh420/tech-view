'use client';

type TabId = 'description' | 'specs' | 'reviews' | 'questions';

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

export default function TabHeader({ active, onChange }: Props) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'description', label: 'توضیحات' },
    { id: 'specs', label: 'مشخصات فنی' },
    { id: 'reviews', label: 'نظرات کاربران' },
    { id: 'questions', label: 'پرسش و پاسخ' },
  ];

  return (
    <div
      className="
        flex gap-6 overflow-x-auto no-scrollbar border-b rtl
        px-2 py-3 relative
      "
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative pb-3 text-sm font-medium whitespace-nowrap transition-all
            ${
              active === tab.id
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }
          `}
        >
          {tab.label}

          {/* indicator انیمیشنی */}
          {active === tab.id && (
            <span
              className="
                absolute bottom-0 right-0 left-0 h-0.5
                bg-blue-600 rounded-full
                transition-all duration-300
              "
            />
          )}
        </button>
      ))}
    </div>
  );
}
