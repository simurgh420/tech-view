'use server';

import { z } from 'zod';
import transporter from '@/lib/auth/nodemailer';
import { logger } from '@/lib/logger';

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

const sendEmailSchema = z.object({
  to: z.string().trim().email({ message: 'آدرس ایمیل گیرنده معتبر نیست' }),
  subject: z.string().trim().min(1, 'موضوع ایمیل نامعتبر است').max(150, 'موضوع ایمیل طولانی است'),
  meta: z.object({
    description: z
      .string()
      .trim()
      .min(1, 'محتوای ایمیل کامل نیست')
      .max(1000, 'محتوای ایمیل طولانی است'),
    link: z.string().trim().url({ message: 'لینک نامعتبر است' }),
  }),
});

type SendEmailInput = z.infer<typeof sendEmailSchema>;

// ─────────────────────────────────────────────
// Sanitization
// ─────────────────────────────────────────────

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────

function buildEmailHtml({
  subject,
  description,
  link,
  ctaLabel = 'ادامه / مشاهده',
}: {
  subject: string;
  description: string;
  link: string;
  ctaLabel?: string;
}): string {
  const safeSubject = escapeHtml(subject);
  const safeDescription = escapeHtml(description).replace(/\n/g, '<br/>');
  const safeLink = escapeHtml(link);
  const safeCta = escapeHtml(ctaLabel);
  const preheader = escapeHtml(description).slice(0, 100);

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${safeSubject}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family: Tahoma, 'Segoe UI', Arial, sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; opacity:0;">
    ${preheader}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:16px; border:1px solid #e5e7eb;">

          <tr>
            <td style="background-color:#e11d48; border-radius:16px 16px 0 0; padding: 28px; text-align:center;">
              <h1 style="margin:0; font-size:20px; font-weight:700; color:#ffffff; font-family: Tahoma, Arial, sans-serif;">
                ${safeSubject}
              </h1>
              <p style="margin:6px 0 0; font-size:13px; color:rgba(255,255,255,0.85);">
                BetterAuthy
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 28px;">
              <p style="margin:0 0 28px; font-size:15px; line-height:1.9; color:#374151; text-align:right;">
                ${safeDescription}
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius:10px; background-color:#e11d48;">
                    <a href="${safeLink}" target="_blank"
                       style="display:inline-block; padding:13px 36px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; font-family: Tahoma, Arial, sans-serif;">
                      ${safeCta}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size:12px; line-height:1.8; color:#9ca3af; text-align:center;">
                اگر دکمه بالا کار نکرد، این لینک را کپی و در مرورگر خود باز کنید:<br/>
                <span style="word-break:break-all; color:#6b7280;">${safeLink}</span>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 28px; border-top:1px solid #e5e7eb; text-align:center; border-radius:0 0 16px 16px;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                این ایمیل به صورت خودکار ارسال شده است. لطفاً پاسخ ندهید.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText({ description, link }: { description: string; link: string }): string {
  return `${description}\n\nلینک: ${link}\n\n---\nاین ایمیل به صورت خودکار ارسال شده است. لطفاً پاسخ ندهید.`;
}

// ─────────────────────────────────────────────
// Retry با backoff نمایی برای خطاهای موقت SMTP
// ─────────────────────────────────────────────

async function sendWithRetry(
  mailOptions: Parameters<typeof transporter.sendMail>[0],
  maxAttempts = 3
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      logger.warn('Email send attempt failed', {
        attempt,
        maxAttempts,
        error: error instanceof Error ? error.message : 'Unknown',
      });

      if (attempt < maxAttempts) {
        const delayMs = 500 * 2 ** (attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

// ─────────────────────────────────────────────
// Server Action
// ─────────────────────────────────────────────

export async function sendEmailAction(input: SendEmailInput) {
  logger.info('sendEmailAction started', { to: input?.to, subject: input?.subject });

  const parsed = sendEmailSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'ورودی ارسال‌شده نامعتبر است';
    logger.warn('sendEmailAction validation failed', { issues: parsed.error.issues });
    return { success: false, error: message };
  }

  const { to, subject, meta } = parsed.data;

  if (!process.env.NODEMAILER_USER || !transporter) {
    logger.error('SMTP configuration missing');
    return { success: false, error: 'سیستم ارسال ایمیل پیکربندی نشده است' };
  }

  const html = buildEmailHtml({ subject, description: meta.description, link: meta.link });
  const text = buildEmailText({ description: meta.description, link: meta.link });

  try {
    await sendWithRetry({
      from: `"BetterAuthy" <${process.env.NODEMAILER_USER}>`,
      to,
      subject: `BetterAuthy - ${subject}`,
      html,
      text,
    });

    logger.info('Email sent successfully', { to, subject });
    return { success: true, error: null };
  } catch (err) {
    logger.error('sendEmailAction failed after retries', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
    return { success: false, error: 'خطا در ارسال ایمیل. لطفاً دقایقی دیگر تلاش کنید.' };
  }
}
