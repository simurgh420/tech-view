# 🛍️ TechView

فروشگاه اینترنتی محصولات تکنولوژی ساخته‌شده با **Next.js 16**، **React 19**، **Prisma 7** و **PostgreSQL**. این پروژه شامل فروشگاه کامل (محصولات، سبد خرید، سفارش‌ها، نظرات و امتیازدهی)، بخش بلاگ، پنل مدیریت (ادمین) و سیستم احراز هویت کاربران است.

---

## 📋 فهرست مطالب

- [ویژگی‌ها](#-ویژگی‌ها)
- [تکنولوژی‌های استفاده‌شده](#-تکنولوژی‌های-استفاده‌شده)
- [پیش‌نیازها](#-پیش‌نیازها)
- [نصب و راه‌اندازی](#-نصب-و-راه‌اندازی)
- [متغیرهای محیطی (Environment Variables)](#-متغیرهای-محیطی-environment-variables)
- [دیتابیس و Prisma](#-دیتابیس-و-prisma)
- [اسکریپت‌های موجود](#-اسکریپت‌های-موجود)
- [ساختار پروژه](#-ساختار-پروژه)
- [مدل‌های اصلی دیتابیس](#-مدل‌های-اصلی-دیتابیس)
- [تست‌ها](#-تست‌ها)
- [استقرار (Deployment)](#-استقرار-deployment)
- [مشارکت در پروژه](#-مشارکت-در-پروژه)
- [لایسنس](#-لایسنس)

---

## ✨ ویژگی‌ها

- 🛒 **فروشگاه محصولات**: دسته‌بندی، برند، مشخصات فنی (Specifications)، تخفیف، محصولات جدید و ویژه
- 🧺 **سبد خرید و سفارش‌ها**: مدیریت کامل سبد خرید، ثبت سفارش و آدرس ارسال
- ⭐ **نظرات و امتیازدهی**: نظرات محصول (تودرتو / Nested Comments)، ریویو و امتیاز محصولات
- ❤️ **لیست علاقه‌مندی‌ها (Wishlist)**
- 🔍 **جستجوی پیشرفته** با نرمال‌سازی متن
- 📝 **بلاگ**: پست‌، تگ، کامنت با پشتیبانی از ویرایشگر متن غنی (Tiptap)
- 👤 **احراز هویت کاربران**: ثبت‌نام، ورود، بازیابی رمز عبور، مدیریت نقش‌ها (User / Admin / Super Admin)
- 🛡️ **پنل مدیریت**: مدیریت کاربران (بن کردن، تغییر نقش)، محصولات، سفارش‌ها، گزارش‌های داشبورد
- 📧 **ارسال ایمیل** با Nodemailer و React Email
- 📤 **آپلود تصویر** برای محصولات، بلاگ و آواتار کاربران
- 🌐 **پیام تماس با ما**

---

## 🧰 تکنولوژی‌های استفاده‌شده

| بخش | تکنولوژی |
|---|---|
| فریم‌ورک | [Next.js 16](https://nextjs.org/) (App Router) |
| کتابخانه UI | [React 19](https://react.dev/) |
| زبان | TypeScript |
| دیتابیس | PostgreSQL |
| ORM | [Prisma 7](https://www.prisma.io/) |
| استایل‌دهی | [Tailwind CSS 4](https://tailwindcss.com/) |
| کامپوننت‌های UI | Radix UI / shadcn (`new-york` style) |
| مدیریت state سرور | [TanStack Query](https://tanstack.com/query) |
| جدول‌ها | [TanStack Table](https://tanstack.com/table) |
| مدیریت state کلاینت | [Zustand](https://zustand-demo.pmnd.rs/) |
| فرم‌ها و اعتبارسنجی | React Hook Form + [Zod](https://zod.dev/) |
| احراز هویت | NextAuth / Better Auth + `@auth/prisma-adapter` |
| هش رمز عبور | Argon2 (`@node-rs/argon2`) / bcryptjs |
| ویرایشگر متن | Tiptap (`reactjs-tiptap-editor`) |
| ایمیل | Nodemailer + `@react-email/components` |
| نمودارها | Recharts |
| تست | Vitest + Testing Library + MSW |
| لینت / فرمت | ESLint + Prettier + Husky + lint-staged |

---

## ✅ پیش‌نیازها

قبل از شروع، مطمئن شوید موارد زیر روی سیستم شما نصب است:

- **Node.js** نسخه ۲۰ یا بالاتر
- **pnpm** (پروژه با pnpm مدیریت می‌شود)
- **PostgreSQL** (یک دیتابیس در دسترس، محلی یا ابری مثل Neon)

نصب pnpm در صورت نیاز:

```bash
npm install -g pnpm
```

---

## 🚀 نصب و راه‌اندازی

1. کلون کردن پروژه:

```bash
git clone <repository-url>
cd tech-view
```

2. نصب پکیج‌ها:

```bash
pnpm install
```

3. ساخت فایل `.env` بر اساس بخش [متغیرهای محیطی](#-متغیرهای-محیطی-environment-variables)

4. اجرای مایگریشن‌های دیتابیس:

```bash
pnpm prisma:migrate
```

5. تولید Prisma Client:

```bash
pnpm prisma:generate
```

6. اجرای پروژه در حالت توسعه:

```bash
pnpm dev
```

پروژه روی آدرس [http://localhost:3000](http://localhost:3000) در دسترس خواهد بود.

---

## 🔐 متغیرهای محیطی (Environment Variables)

یک فایل `.env` در ریشه پروژه بسازید. بر اساس پکیج‌های استفاده‌شده (Prisma/PostgreSQL، NextAuth/Better Auth، Nodemailer) موارد زیر مورد نیاز است — مقادیر را متناسب با محیط خودتان تنظیم کنید:

```env
# --- دیتابیس ---
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# --- احراز هویت ---
AUTH_SECRET="یک-رشته-تصادفی-و-امن"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="یک-رشته-تصادفی-و-امن"

# --- ایمیل (Nodemailer) ---
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
EMAIL_FROM="no-reply@example.com"

# --- آپلود فایل ---
UPLOAD_DIR="public/uploads"
```

> ⚠️ **توجه**: مقادیر دقیق متغیرهای محیطی را بر اساس کدهای موجود در پوشه‌های `services/auth`، `services/action/user` و `services/upload` بررسی و تکمیل کنید، چون نام دقیق برخی متغیرها ممکن است در کد پروژه متفاوت باشد.

---

## 🗄️ دیتابیس و Prisma

این پروژه از **Prisma 7** با آداپتور PostgreSQL (`@prisma/adapter-pg`) استفاده می‌کند.

### تولید Prisma Client

```bash
pnpm prisma:generate
```

خروجی کلاینت در مسیر `app/generated/prisma` قرار می‌گیرد.

### اجرای مایگریشن‌ها (Production)

```bash
pnpm prisma:migrate
```

### ساخت مایگریشن جدید در محیط توسعه

```bash
npx prisma migrate dev --name your_migration_name
```

### مشاهده دیتابیس با Prisma Studio

```bash
npx prisma studio
```

---

## 📜 اسکریپت‌های موجود

| اسکریپت | توضیح |
|---|---|
| `pnpm dev` | اجرای پروژه در حالت توسعه (به همراه `prisma generate`) |
| `pnpm build` | ساخت نسخه Production (به همراه `prisma generate`) |
| `pnpm start` | اجرای نسخه ساخته‌شده |
| `pnpm lint` | بررسی کد با ESLint |
| `pnpm test` | اجرای تست‌ها با Vitest |
| `pnpm type-check` | بررسی خطاهای TypeScript بدون تولید خروجی |
| `pnpm prisma:generate` | تولید Prisma Client |
| `pnpm prisma:migrate` | اجرای مایگریشن‌های دیتابیس در Production |
| `pnpm prepare` | فعال‌سازی Husky (git hooks) |

---

## 🗂️ ساختار پروژه

```
tech-view/
├── prisma/
│   ├── schema.prisma          # اسکیمای دیتابیس
│   └── migrations/            # تاریخچه مایگریشن‌ها
├── public/
│   ├── icons/, img/           # تصاویر ثابت سایت
│   └── uploads/               # فایل‌های آپلودی (محصولات، بلاگ، آواتار)
├── services/                  # لایه سرویس / دسترسی به داده
│   ├── auth/                  # احراز هویت (login, register, logout)
│   ├── blog/                  # بلاگ (queries/mutations)
│   ├── brands/                # برندها
│   ├── cart/                  # سبد خرید
│   ├── categories/            # دسته‌بندی‌ها
│   ├── comments/              # کامنت‌های بلاگ
│   ├── contact/                # پیام‌های تماس با ما
│   ├── orders/                # سفارش‌ها
│   ├── productComments/       # کامنت‌های محصول
│   ├── products/               # محصولات
│   ├── reports/               # گزارش‌های داشبورد ادمین
│   ├── reviews/               # نظرات و امتیازدهی محصول
│   ├── search/                # جستجو
│   ├── upload/                # آپلود / حذف تصویر
│   ├── wishlist/              # لیست علاقه‌مندی‌ها
│   ├── db/                    # کلاینت Prisma
│   └── action/                # Server Actionها
├── stores/                    # استورهای Zustand
├── types/                     # تایپ‌های TypeScript مشترک
├── tests/
│   ├── unit/                  # تست واحد (services, hooks, lib)
│   ├── integration/           # تست یکپارچگی (API routes)
│   └── e2e/                   # تست سرتاسری
├── package.json
├── tsconfig.json
├── next.config.ts
└── components.json            # تنظیمات shadcn/ui
```

> ساختار هر دامنه (`services/<domain>`) معمولاً شامل دو زیرپوشه است:
> - `api/` → کوئری/میوتیشن‌های سمت کلاینت (React Query)
> - `db/` → کوئری/میوتیشن‌های مستقیم روی دیتابیس (Prisma)

---

## 🧬 مدل‌های اصلی دیتابیس

بر اساس `prisma/schema.prisma`:

- **User / Session / Account / Verification** — کاربران و احراز هویت (سازگار با Better Auth / NextAuth)
- **Product / ProductSpecification / ProductPrice** — محصولات، مشخصات فنی و قیمت‌گذاری چندارزی
- **Brand / Category** — برندها و دسته‌بندی‌های سلسله‌مراتبی (والد/فرزند)
- **Cart / CartItem** — سبد خرید
- **Order / OrderItem / OrderAddress** — سفارش‌ها و آدرس ارسال
- **Review** — امتیاز و نظر محصول (یک نظر به ازای هر کاربر و محصول)
- **ProductComment** — کامنت‌های تودرتوی محصول (پاسخ به پاسخ)
- **WishlistItem** — لیست علاقه‌مندی‌ها
- **BlogPost / Tag / TagOnPost / Comment** — بلاگ، تگ‌گذاری و کامنت
- **ContactMessage** — پیام‌های تماس با ما

نقش‌های کاربری (`UserRole`): `USER`, `ADMIN`, `SUPER_ADMIN`

---

## 🧪 تست‌ها

پروژه از **Vitest** به همراه **Testing Library** و **MSW** (برای موک کردن API) استفاده می‌کند.

```bash
# اجرای همه تست‌ها
pnpm test

# اجرای تست‌ها در حالت watch
pnpm test --watch
```

تست‌ها در مسیرهای زیر قرار دارند:
- `tests/unit/hooks` — تست هوک‌های React Query
- `tests/unit/services` — تست لایه سرویس/دیتابیس
- `tests/unit/lib` — تست توابع کمکی
- `tests/integration/app` — تست API routeها

---

## ☁️ استقرار (Deployment)

این پروژه با هر پلتفرمی که از Next.js پشتیبانی می‌کند (مثل [Vercel](https://vercel.com)) قابل استقرار است.

### مراحل کلی استقرار

1. تنظیم متغیرهای محیطی در پلتفرم میزبانی
2. اتصال به یک دیتابیس PostgreSQL (مثل [Neon](https://neon.tech))
3. اجرای دستور build:

```bash
pnpm build
```

4. اجرای مایگریشن‌ها روی دیتابیس Production:

```bash
pnpm prisma:migrate
```

5. اجرای پروژه:

```bash
pnpm start
```

---

## 🤝 مشارکت در پروژه

1. یک Fork از پروژه بسازید
2. یک برنچ جدید بسازید: `git checkout -b feature/my-feature`
3. تغییرات را کامیت کنید: `git commit -m "feat: توضیح تغییر"`
4. برنچ را پوش کنید: `git push origin feature/my-feature`
5. یک Pull Request باز کنید

پیش از کامیت، `husky` و `lint-staged` به‌صورت خودکار `eslint --fix` و `prettier` را روی فایل‌های تغییر‌یافته اجرا می‌کنند.

---

## 📄 لایسنس

این پروژه خصوصی (Private) است. کلیه حقوق محفوظ است — مگر اینکه لایسنس دیگری تعیین شود.

---

<p align="center">ساخته‌شده با ❤️ با استفاده از Next.js و Prisma</p>
