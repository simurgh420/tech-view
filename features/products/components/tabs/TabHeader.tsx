'use client';

type TabId = 'description' | 'specs' | 'reviews' | 'questions';

type Props = {
  active: TabId;
  onChange: (tab: TabId) => void;
};

export default function TabHeader({ active, onChange }: Props) {
  const tabs: { id: TabId; label: string }[] = [
    { id: 'questions', label: 'پرسش و پاسخ' },
    { id: 'reviews', label: 'نظرات کاربران' },
    { id: 'specs', label: 'مشخصات فنی' },
    { id: 'description', label: 'توضیحات' },
  ];

  return (
    <div
      className="
        flex
        justify-end
        gap-2
        overflow-x-auto
        no-scrollbar
        p-2
      "
    >
      {tabs.map(tab => {
        const activeTab = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              whitespace-nowrap
              rounded-xl
              px-4
              py-2
              text-sm
              font-medium
              transition-all
              duration-200

              ${
                activeTab
                  ? `
                    bg-red-500
                    text-white
                    shadow-md
                    shadow-red-500/20
                  `
                  : `
                    text-neutral-600
                    hover:bg-neutral-100
                    hover:text-neutral-900

                    dark:text-neutral-400
                    dark:hover:bg-neutral-800
                    dark:hover:text-neutral-100
                  `
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
