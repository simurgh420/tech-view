'use client';

type Props = {
  onClick?: () => void;
  'aria-label': string;
  children: React.ReactNode;
};

// دکمهٔ دایره‌ای شیشه‌ای مشترک — قبلاً این استایل عیناً هم تو دکمهٔ جستجو
// (داخل UserActions) و هم تو CartButton تکرار شده بود
export function HeaderIconButton({ onClick, children, ...rest }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...rest}
      className="
        relative flex h-11 w-11 items-center justify-center rounded-full
        border border-gray-200/50 bg-white/70 shadow-sm backdrop-blur-md
        transition-all duration-200
        hover:scale-105 hover:shadow-md active:scale-95
        dark:border-gray-700/50 dark:bg-gray-800/60
      "
    >
      {children}
    </button>
  );
}
