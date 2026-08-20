import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  PackageCheck,
  RefreshCcw,
  XCircle,
} from 'lucide-react';

const returnSteps = [
  {
    number: 1,
    title: 'ثبت درخواست',
    description:
      'وارد حساب کاربری شوید و از بخش سفارش‌ها، درخواست مرجوعی محصول موردنظر را ثبت کنید.',
    icon: ClipboardList,
  },
  {
    number: 2,
    title: 'بررسی درخواست',
    description:
      'درخواست شما و شرایط کالا توسط تیم پشتیبانی بررسی می‌شود و نتیجه به شما اطلاع داده خواهد شد.',
    icon: AlertCircle,
  },
  {
    number: 3,
    title: 'ارسال کالا',
    description: 'پس از تأیید درخواست، کالا را طبق دستورالعمل اعلام‌شده برای بازگشت ارسال کنید.',
    icon: PackageCheck,
  },
  {
    number: 4,
    title: 'بررسی کالا',
    description:
      'پس از دریافت، وضعیت و شرایط کالا بررسی می‌شود تا مطابقت آن با شرایط مرجوعی مشخص شود.',
    icon: RefreshCcw,
  },
  {
    number: 5,
    title: 'بازگشت وجه',
    description:
      'در صورت تأیید مرجوعی، مبلغ قابل بازگشت مطابق شرایط سفارش به شما بازگردانده خواهد شد.',
    icon: CheckCircle2,
  },
];

const acceptedConditions = [
  'کالا باید در شرایط قابل قبول برای مرجوعی باشد.',
  'در صورت وجود بسته‌بندی یا لوازم جانبی، بهتر است همراه محصول بازگردانده شوند.',
  'هرگونه مغایرت یا آسیب‌دیدگی باید در اولین فرصت به پشتیبانی اطلاع داده شود.',
  'مرجوعی پس از بررسی و تأیید تیم پشتیبانی انجام خواهد شد.',
];

const rejectedConditions = [
  'استفاده نامناسب یا آسیب واردشده توسط مشتری.',
  'تغییر، بازشدگی یا دستکاری غیرمجاز محصول.',
  'مرجوعی خارج از شرایط و مهلت تعیین‌شده برای محصول.',
  'محصولاتی که طبق شرایط فروش، امکان مرجوعی ندارند.',
];

export default function ReturnsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-background">
      <section className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-muted-foreground">
          <span>خانه</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">شرایط مرجوعی</span>
        </nav>

        {/* Hero */}
        <header className="rounded-3xl border bg-card px-5 py-8 shadow-sm sm:px-8 lg:px-10 lg:py-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              قوانین مرجوعی
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              شرایط بازگشت و مرجوعی کالا
            </h1>

            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              در صورت وجود مشکل در سفارش، مغایرت یا شرایطی که شامل مرجوعی می‌شود، می‌توانید درخواست
              خود را ثبت کنید. درخواست‌ها پس از بررسی شرایط کالا و سفارش تعیین تکلیف خواهند شد.
            </p>
          </div>
        </header>

        {/* Important Notice */}
        <div className="mt-6 flex gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />

          <div>
            <h2 className="font-semibold">قبل از ثبت درخواست</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              شرایط هر محصول ممکن است با توجه به نوع کالا، وضعیت استفاده و سیاست فروش متفاوت باشد.
              پیش از ارسال کالا، دستورالعمل پشتیبانی را دریافت و بررسی کنید.
            </p>
          </div>
        </div>

        {/* Conditions */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </div>

              <div>
                <h2 className="font-bold">شرایط قابل قبول</h2>
                <p className="text-xs text-muted-foreground">مواردی که امکان بررسی مرجوعی دارند</p>
              </div>
            </div>

            <div className="space-y-3">
              {acceptedConditions.map(item => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <XCircle className="size-5" />
              </div>

              <div>
                <h2 className="font-bold">موارد خارج از شرایط مرجوعی</h2>
                <p className="text-xs text-muted-foreground">
                  مواردی که ممکن است درخواست را رد کنند
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {rejectedConditions.map(item => (
                <div key={item} className="flex gap-3">
                  <XCircle className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Steps */}
        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-xl font-bold sm:text-2xl">مراحل ثبت درخواست مرجوعی</h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              فرآیند مرجوعی به‌صورت مرحله‌به‌مرحله انجام می‌شود.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {returnSteps.map(step => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>

                    <span className="flex size-8 items-center justify-center rounded-full border bg-muted text-sm font-bold text-muted-foreground">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-bold leading-7">{step.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Footer Note */}
        <div className="mt-8 rounded-2xl border bg-muted/40 p-5">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" />

            <div>
              <h2 className="font-semibold">نیاز به راهنمایی دارید؟</h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                اگر درباره شرایط مرجوعی سفارش خود مطمئن نیستید، پیش از ارسال کالا با پشتیبانی تماس
                بگیرید تا وضعیت سفارش شما بررسی شود.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
