import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Heart,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const values = [
  {
    icon: ShieldCheck,
    title: 'اعتماد',
    description:
      'اطلاعات را با دقت و با تمرکز روی تجربه واقعی کاربر ارائه می‌کنیم تا انتخاب مطمئن‌تری داشته باشید.',
  },
  {
    icon: Lightbulb,
    title: 'سادگی',
    description: 'محتوای پیچیده را به زبان ساده و کاربردی تبدیل می‌کنیم تا تصمیم‌گیری راحت‌تر شود.',
  },
  {
    icon: Target,
    title: 'کاربردی بودن',
    description:
      'هدف ما فقط تولید محتوا نیست؛ می‌خواهیم هر مطلب واقعاً در انتخاب و خرید به شما کمک کند.',
  },
];

const features = [
  {
    icon: BookOpen,
    title: 'راهنمای خرید',
    description: 'راهنماهای دقیق برای انتخاب بهتر محصولات و سرویس‌ها.',
  },
  {
    icon: Award,
    title: 'بررسی و مقایسه',
    description: 'بررسی ویژگی‌ها، نقاط قوت و ضعف و مقایسه گزینه‌های مختلف.',
  },
  {
    icon: Users,
    title: 'تجربه کاربر',
    description: 'تمرکز روی چیزی که در استفاده واقعی اهمیت دارد، نه فقط مشخصات روی کاغذ.',
  },
];

const stats = [
  {
    value: '+۱۰۰',
    label: 'مقاله و راهنما',
  },
  {
    value: '+۲۰',
    label: 'دسته‌بندی محتوا',
  },
  {
    value: '۲۰۲۶',
    label: 'سال توسعه',
  },
  {
    value: '۱',
    label: 'هدف مشترک',
  },
];

export default function AboutPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.05),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary" />
                چیزی فراتر از یک وبلاگ
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
                انتخاب بهتر،
                <span className="block text-primary">با آگاهی بیشتر.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                ما اینجا هستیم تا دنیای محصولات و تکنولوژی را ساده‌تر کنیم؛ از راهنماهای خرید و
                بررسی محصولات گرفته تا مقایسه‌ها و تجربه‌های واقعی که به شما برای یک انتخاب بهتر کمک
                می‌کنند.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  مشاهده محصولات
                  <ArrowLeft className="size-4" />
                </Link>

                <Link
                  href="/blog"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  مطالعه مقالات
                  <BookOpen className="size-4" />
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="relative mx-auto aspect-square max-w-md rounded-4xl border bg-card p-3 shadow-2xl">
                <div className="flex h-full flex-col justify-between rounded-3xl border bg-muted/30 p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Sparkles className="size-6" />
                    </div>

                    <span className="text-sm text-muted-foreground">ABOUT US</span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">فلسفه ما</p>

                    <h2 className="mt-3 text-3xl font-bold leading-tight">
                      اطلاعات کمتر،
                      <br />
                      <span className="text-primary">انتخاب سخت‌تر.</span>
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                      ما تلاش می‌کنیم اطلاعات درست را در زمان درست، به ساده‌ترین شکل ممکن در اختیار
                      شما قرار دهیم.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border bg-background p-4">
                      <p className="text-2xl font-bold">۱۰۰+</p>
                      <p className="mt-1 text-xs text-muted-foreground">محتوای کاربردی</p>
                    </div>

                    <div className="rounded-xl border bg-background p-4">
                      <p className="text-2xl font-bold">۲۰+</p>
                      <p className="mt-1 text-xs text-muted-foreground">موضوع مختلف</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <span className="text-sm font-medium text-primary">درباره ما</span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              چرا اینجا ساخته شد؟
            </h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-muted-foreground">
            <p>
              انتخاب یک محصول خوب همیشه به معنی پیدا کردن گران‌ترین یا محبوب‌ترین گزینه نیست. گاهی
              تفاوت اصلی در جزئیاتی است که در نگاه اول دیده نمی‌شوند.
            </p>

            <p>
              هدف ما این است که این جزئیات را پیدا کنیم، بررسی کنیم و در اختیار شما قرار دهیم؛ به
              شکلی که بتوانید قبل از خرید، تصویر واضح‌تری از گزینه‌های پیش روی خود داشته باشید.
            </p>

            <p>
              اینجا ترکیبی از محتوای تکنولوژی، راهنمای خرید، بررسی، مقایسه و تجربه است؛ با تمرکز روی
              کیفیت و کاربرد واقعی.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="text-sm font-medium text-primary">چه کاری انجام می‌دهیم؟</span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              محتوایی که به درد تصمیم‌گیری بخورد
            </h2>

            <p className="mt-4 leading-7 text-muted-foreground">
              تمرکز ما روی محتواهایی است که بعد از خواندنشان بتوانید تصمیم بهتری بگیرید.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(feature => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">{stat.value}</p>

                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <span className="text-sm font-medium text-primary">ارزش‌های ما</span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              چیزهایی که برایمان مهم‌اند
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">
              کیفیت محتوا فقط به اطلاعات بیشتر وابسته نیست؛ به نحوه ارائه و میزان اعتمادی که ایجاد
              می‌کند هم بستگی دارد.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {values.map(value => {
              const Icon = value.icon;

              return (
                <div
                  key={value.title}
                  className="group rounded-2xl border p-6 transition-colors hover:bg-muted/40"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">{value.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-10 lg:px-16 lg:py-16">
          <div className="absolute -left-20 -top-20 size-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 size-56 rounded-full bg-black/10 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80">
                <Heart className="size-4" />
                انتخاب آگاهانه، همیشه ارزشمند است.
              </div>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                برای انتخاب بعدی آماده‌اید؟
              </h2>

              <p className="mt-4 leading-7 text-primary-foreground/80">
                راهنماها و مقالات ما را ببینید و قبل از تصمیم‌گیری، اطلاعات بیشتری به دست بیاورید.
              </p>
            </div>

            <Link
              href="/blog"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-background px-5 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              شروع مطالعه
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
