// اسکریپت برای بررسی جزئیات Account
import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

// لود کردن متغیرهای محیطی
config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  console.error('❌ خطا: DATABASE_URL در فایل .env یافت نشد');
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function checkAccountDetails() {
  console.log('🔍 در حال بررسی جزئیات Account...\n');

  try {
    // پیدا کردن کاربر با ایمیل
    const user = await prisma.user.findUnique({
      where: {
        email: 'mohamadrezah420@gmail.com',
      },
      include: {
        accounts: true,
      },
    });

    if (!user) {
      console.log('❌ کاربر یافت نشد');
      return;
    }

    console.log('👤 اطلاعات کاربر:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name || 'N/A'}`);
    console.log(`  تعداد Accounts: ${user.accounts.length}\n`);

    if (user.accounts.length === 0) {
      console.log('⚠️  کاربر Account ندارد');
      return;
    }

    console.log('🔐 اطلاعات Account ها:');
    user.accounts.forEach((account, index) => {
      console.log(`\n  Account ${index + 1}:`);
      console.log(`    ID: ${account.id}`);
      console.log(`    User ID: ${account.userId}`);
      console.log(`    Provider: ${account.provider}`);
      console.log(`    Provider Account ID: ${account.providerAccountId}`);
      console.log(`    Type: ${account.type}`);
      console.log(`    Password: ${account.password ? 'موجود' : 'ندارد'}`);
      console.log(`    Created At: ${account.createdAt}`);
    });

    // بررسی اینکه آیا providerAccountId با userId مطابقت دارد
    const credentialAccount = user.accounts.find(
      acc => acc.provider === 'credential' && acc.type === 'credential'
    );

    if (credentialAccount) {
      console.log('\n✅ Account credential پیدا شد');
      console.log(`   Provider Account ID: ${credentialAccount.providerAccountId}`);
      console.log(`   User ID: ${user.id}`);

      if (credentialAccount.providerAccountId !== user.id) {
        console.log('\n⚠️  مشکل: providerAccountId با userId مطابقت ندارد!');
        console.log('   در حال اصلاح...');

        await prisma.account.update({
          where: {
            id: credentialAccount.id,
          },
          data: {
            providerAccountId: user.id,
          },
        });

        console.log('✅ providerAccountId اصلاح شد');
      } else {
        console.log('✅ providerAccountId درست است');
      }
    } else {
      console.log('\n❌ Account credential پیدا نشد');
    }
  } catch (error) {
    console.error('❌ خطا:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAccountDetails()
  .then(() => {
    console.log('\n✅ بررسی با موفقیت انجام شد');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ خطا در اجرای اسکریپت:', error);
    process.exit(1);
  });
