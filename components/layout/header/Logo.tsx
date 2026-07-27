import Link from 'next/link';

// ModeToggle قبلاً اینجا بود؛ به UserActions منتقل شد چون یک کامپوننت
// «لوگو» نباید مسئولیت دکمهٔ تغییر تم را هم بر عهده بگیرد — اگر لوگو در
// جای دیگری (مثلاً فوتر) دوباره استفاده شود، دکمهٔ تم هم زوری همراهش می‌آمد
export function Logo() {
  return (
    <Link href="/" className="px-5 text-xl font-bold text-primary">
      TechView
    </Link>
  );
}
