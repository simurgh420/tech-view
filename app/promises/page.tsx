import {
  BadgeCheck,
  Headphones,
  LockKeyhole,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
} from 'lucide-react';

const promises = [
  {
    number: 1,
    title: 'اصالت و سلامت کالا',
    description:
      'ما تلاش می‌کنیم کالاها با اطلاعات دقیق و از منابع معتبر ارائه شوند تا با اطمینان بیشتری خرید خود را انجام دهید.',
    icon: BadgeCheck,
  },
  {
    number: 2,
    title: 'قیمت‌گذاری شفاف',
    description:
      'قیمت محصولات و تخفیف‌ها به‌صورت شفاف نمایش داده می‌شوند تا پیش از ثبت سفارش از مبلغ نهایی مطلع باشید.',
    icon: ReceiptText,
  },
  {
    number: 3,
    title: 'حفظ امنیت اطلاعات',
    description:
      'اطلاعات حساب کاربری و سفارش‌های شما با رعایت اصول امنیتی نگهداری می‌شوند و حریم خصوصی شما برای ما اهمیت دارد.',
    icon: LockKeyhole,
  },
  {
    number: 4,
    title: 'ارسال مطمئن سفارش',
    description:
      'سفارش‌ها با دقت آماده و ارسال می‌شوند تا محصول در شرایط مناسب و در سریع‌ترین زمان ممکن به دست شما برسد.',
    icon: PackageCheck,
  },
  {
    number: 5,
    title: 'پشتیبانی و پاسخ‌گویی',
    description:
      'در مسیر خرید تنها نیستید؛ تیم پشتیبانی آماده است تا در صورت بروز سؤال یا مشکل، شما را راهنمایی کند.',
    icon: Headphones,
  },
  {
    number: 6,
    title: 'احترام به حقوق مشتری',
    description:
      'رضایت و اعتماد شما برای ما ارزشمند است و تلاش می‌کنیم تجربه‌ای شفاف، منصفانه و قابل اعتماد برایتان ایجاد کنیم.',
    icon: ShieldCheck,
  },
];

export default function PromisesPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <section className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            تعهدات ما
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            تعهد ما به شما چیست؟
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            اعتماد شما مهم‌ترین بخش تجربه خرید است. ما برای ایجاد یک خرید امن، شفاف و مطمئن به این
            اصول پایبند هستیم.
          </p>
        </div>

        {/* Promise Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promises.map(promise => {
            const Icon = promise.icon;

            return (
              <article
                key={promise.number}
                className="group relative rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>

                  <span className="flex size-8 items-center justify-center rounded-full border bg-muted text-sm font-bold text-muted-foreground">
                    {promise.number}
                  </span>
                </div>

                <h2 className="text-base font-bold leading-7">{promise.title}</h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {promise.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Bottom Message */}
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 text-center">
          <p className="text-sm font-medium leading-7 text-muted-foreground">
            اعتماد شما برای ما یک مسئولیت است؛ به همین دلیل تلاش می‌کنیم در تمام مراحل خرید، از
            انتخاب محصول تا دریافت سفارش، همراه شما باشیم.
          </p>
        </div>
      </section>
    </main>
  );
}
