import { BadgeCheck, CreditCard, PackageCheck, SearchCheck, ShoppingCart } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'انتخاب محصول و مقایسه',
    description:
      'محصول موردنظرت را بررسی کن و قبل از خرید، مشخصات، قیمت و ویژگی‌های آن را با گزینه‌های دیگر مقایسه کن.',
    icon: SearchCheck,
  },
  {
    number: 2,
    title: 'افزودن به سبد خرید',
    description:
      'محصول موردنظر را به سبد خرید اضافه کن و تعداد یا گزینه‌های انتخاب‌شده را پیش از ادامه بررسی کن.',
    icon: ShoppingCart,
  },
  {
    number: 3,
    title: 'تکمیل اطلاعات ارسال',
    description:
      'در صفحه تسویه‌حساب، اطلاعات گیرنده و آدرس ارسال را وارد کن و جزئیات سفارش را بررسی کن.',
    icon: PackageCheck,
  },
  {
    number: 4,
    title: 'پرداخت',
    description:
      'روش پرداخت را انتخاب کن و پس از بررسی نهایی اطلاعات، سفارش خود را ثبت و پرداخت کن.',
    icon: CreditCard,
  },
  {
    number: 5,
    title: 'پیگیری سفارش',
    description:
      'بعد از ثبت موفق سفارش، می‌توانی وضعیت سفارش و جزئیات ارسال آن را از حساب کاربری خود پیگیری کنی.',
    icon: BadgeCheck,
  },
];

export default function HowToBuyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <section className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            راهنمای خرید
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            خرید از سایت چطور انجام می‌شود؟
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            برای خرید محصول فقط کافی است این ۵ مرحله ساده را دنبال کنی.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {steps.map(step => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="group relative rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                {/* Number */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </div>

                  <span className="flex size-8 items-center justify-center rounded-full border bg-muted text-sm font-bold text-muted-foreground">
                    {step.number}
                  </span>
                </div>

                <h2 className="text-base font-bold leading-7">{step.title}</h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </article>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 text-center">
          <p className="text-sm leading-6 text-muted-foreground">
            تمام مراحل خرید به‌صورت ساده و مرحله‌به‌مرحله انجام می‌شوند تا بتوانی سفارش خود را با
            خیال راحت ثبت و پیگیری کنی.
          </p>
        </div>
      </section>
    </main>
  );
}
