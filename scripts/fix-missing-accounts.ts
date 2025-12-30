// اسکریپت برای ایجاد Account برای کاربرانی که Account ندارند
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

// لود کردن متغیرهای محیطی
config({ path: '.env' });

// بررسی اینکه DATABASE_URL وجود دارد
if (!process.env.DATABASE_URL) {
  console.error('❌ خطا: DATABASE_URL در فایل .env یافت نشد');
  process.exit(1);
}

// ایجاد Prisma Client مستقیم (بدون extension)
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function fixMissingAccounts() {
  console.log('🔍 در حال بررسی کاربران بدون Account...\n');

  try {
    // پیدا کردن همه کاربران
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    });

    console.log(`📊 تعداد کل کاربران: ${users.length}\n`);

    if (users.length === 0) {
      console.log('⚠️  هیچ کاربری در دیتابیس وجود ندارد.');
      return;
    }

    // نمایش لیست کاربران
    console.log('👥 لیست کاربران:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
      console.log(`     Accounts: ${user.accounts.length}`);
      if (user.accounts.length > 0) {
        user.accounts.forEach(account => {
          console.log(`       - Provider: ${account.provider}, Type: ${account.type}`);
        });
      }
      console.log('');
    });

    let fixedCount = 0;
    const usersWithoutAccount = users.filter(user => user.accounts.length === 0);

    if (usersWithoutAccount.length === 0) {
      console.log('✅ همه کاربران Account دارند.');
      return;
    }

    console.log(`⚠️  ${usersWithoutAccount.length} کاربر Account ندارند:\n`);

    for (const user of usersWithoutAccount) {
      console.log(`⚠️  کاربر ${user.email} Account ندارد. در حال ایجاد...`);

      try {
        // ایجاد Account برای کاربر
        await prisma.account.create({
          data: {
            userId: user.id,
            provider: 'credential',
            providerAccountId: user.id, // برای credential provider، providerAccountId همان userId است
            type: 'credential',
            // password در Account ذخیره نمی‌شود، در BetterAuth به صورت جداگانه مدیریت می‌شود
          },
        });

        console.log(`✅ Account برای ${user.email} ایجاد شد\n`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ خطا در ایجاد Account برای ${user.email}:`, error);
        console.error('');
      }
    }

    console.log(`\n✨ ${fixedCount} Account ایجاد شد`);
  } catch (error) {
    console.error('❌ خطا در بررسی کاربران:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// اجرای اسکریپت
fixMissingAccounts()
  .then(() => {
    console.log('✅ اسکریپت با موفقیت اجرا شد');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ خطا در اجرای اسکریپت:', error);
    process.exit(1);
  });
