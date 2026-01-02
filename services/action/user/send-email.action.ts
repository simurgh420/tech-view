'use server';

import transporter from '@/lib/auth/nodemailer';

export async function sendEmailAction({
  to,
  subject,
  meta,
}: {
  to: string;
  subject: string;
  meta: {
    description: string;
    link: string;
  };
}) {
  const html = `
  <div style="
    max-width: 520px;
    margin: 40px auto;
    padding: 32px;
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    font-family: 'Inter', sans-serif;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  ">
    
    <!-- Header -->
    <div style="text-align:center; margin-bottom: 28px;">
      <h1 style="
        font-size: 24px;
        font-weight: 700;
        color: #111827;
        margin: 0;
      ">
        ${subject}
      </h1>
      <p style="
        font-size: 14px;
        color: #6b7280;
        margin-top: 6px;
      ">
        BetterAuthy Notification
      </p>
    </div>

    <!-- Body -->
    <p style="
      font-size: 16px;
      line-height: 1.7;
      color: #374151;
      margin-bottom: 24px;
    ">
      ${meta.description}
    </p>

    <!-- Button -->
    <div style="text-align:center; margin-top: 32px;">
      <a href="${meta.link}" style="
        display: inline-block;
        padding: 12px 24px;
        background: #2563eb;
        color: #ffffff;
        text-decoration: none;
        font-size: 15px;
        font-weight: 600;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(37,99,235,0.25);
      ">
        ادامه / مشاهده
      </a>
    </div>

    <!-- Footer -->
    <div style="
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    ">
      این ایمیل به صورت خودکار ارسال شده است. لطفاً پاسخ ندهید.
    </div>

  </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to,
      subject: `BetterAuthy - ${subject}`,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error('[SendEmail]:', err);
    return { success: false };
  }
}
