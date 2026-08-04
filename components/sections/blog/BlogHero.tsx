import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BlogHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />

      {/* Glow */}
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right,currentColor 1px,transparent 1px),
            linear-gradient(to bottom,currentColor 1px,transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative container mx-auto grid items-center gap-14 px-6 py-14 lg:grid-cols-2 lg:px-12 lg:py-20">
        {/* Left */}
        <div className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            TECHVIEW MAGAZINE
          </div>

          <div className="space-y-5">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl xl:text-6xl">
              اخبار، آموزش و بررسی
              <br />
              <span className="text-primary">دنیای تکنولوژی</span>
            </h1>

            <p className="max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
              جدیدترین مقالات درباره سخت‌افزار، گیمینگ، هوش مصنوعی، برنامه‌نویسی و دنیای فناوری را
              در مجله تخصصی TechView دنبال کنید.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#articles">
                شروع مطالعه
                <ArrowLeft className="ms-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/blog">
                <BookOpen className="me-2 h-4 w-4" />
                مقالات
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur">
              <div className="text-2xl font-black text-primary">120+</div>

              <div className="mt-1 text-sm text-muted-foreground">مقاله تخصصی</div>
            </div>

            <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur">
              <div className="text-2xl font-black text-primary">15</div>

              <div className="mt-1 text-sm text-muted-foreground">دسته‌بندی</div>
            </div>

            <div className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur">
              <div className="text-2xl font-black text-primary">Weekly</div>

              <div className="mt-1 text-sm text-muted-foreground">بروزرسانی</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 rounded-4xl bg-primary/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-4xl border border-border bg-card shadow-2xl">
            <Image
              src="/img/blogs/blog-hero.png"
              alt="TechView Magazine"
              width={800}
              height={900}
              priority
              className="h-full w-full object-cover transition duration-700 hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
