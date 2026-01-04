import transporter from '@/lib/auth/nodemailer';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_USER, // ایمیل فرستنده
      to: process.env.NODEMAILER_USER, // ایمیل گیرنده (خودت برای تست)
      subject: 'Test Email',
      text: 'Hello, this is a test email!',
    });
    res.status(200).json({ success: true, messageId: info.messageId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
