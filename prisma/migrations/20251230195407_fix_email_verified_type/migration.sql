-- تبدیل emailVerified از Boolean به DateTime
-- و اضافه کردن فیلدهای role و avatar

-- ابتدا فیلدهای جدید را اضافه می‌کنیم (اگر وجود ندارند)
DO $$ 
BEGIN
    -- اضافه کردن role اگر وجود ندارد
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'role'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';
    END IF;

    -- اضافه کردن avatar اگر وجود ندارد
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'avatar'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "avatar" TEXT;
    END IF;
END $$;

-- تبدیل emailVerified از Boolean به DateTime
-- ابتدا فیلد قدیمی را drop می‌کنیم و دوباره با نوع DateTime ایجاد می‌کنیم
ALTER TABLE "user" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "user" ADD COLUMN "emailVerified" TIMESTAMP(3);
