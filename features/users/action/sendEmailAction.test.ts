import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { transporter } = vi.hoisted(() => ({
  transporter: { sendMail: vi.fn() },
}));

vi.mock('@/lib/auth/nodemailer', () => ({ default: transporter }));
vi.mock('@/lib/logger', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import { sendEmailAction } from './sendEmailAction';

describe('sendEmailAction', () => {
  const previousUser = process.env.NODEMAILER_USER;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODEMAILER_USER = 'sender@example.com';
  });

  afterEach(() => {
    if (previousUser === undefined) delete process.env.NODEMAILER_USER;
    else process.env.NODEMAILER_USER = previousUser;
    vi.useRealTimers();
  });

  const validInput = {
    to: 'recipient@example.com',
    subject: 'Account update',
    meta: { description: 'Your account was updated.', link: 'https://example.com/account' },
  };

  it('rejects invalid input without sending mail', async () => {
    await expect(sendEmailAction({ ...validInput, to: 'invalid' })).resolves.toMatchObject({
      success: false,
    });
    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it('sends an email with escaped HTML content', async () => {
    transporter.sendMail.mockResolvedValue({ messageId: 'message-id' });

    await expect(
      sendEmailAction({
        ...validInput,
        subject: '<hello>',
        meta: { ...validInput.meta, description: '<script>bad</script>' },
      })
    ).resolves.toEqual({ success: true, error: null });

    const [mail] = transporter.sendMail.mock.calls[0];
    expect(mail.to).toBe('recipient@example.com');
    expect(mail.subject).toBe('BetterAuthy - <hello>');
    expect(mail.html).toContain('&lt;hello&gt;');
    expect(mail.html).toContain('&lt;script&gt;bad&lt;/script&gt;');
    expect(mail.html).not.toContain('<script>');
  });

  it('retries temporary SMTP failures and returns an error after the final attempt', async () => {
    vi.useFakeTimers();
    transporter.sendMail.mockRejectedValue(new Error('SMTP unavailable'));

    const result = sendEmailAction(validInput);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toMatchObject({
      success: false,
      error: expect.stringContaining('ارسال ایمیل'),
    });
    expect(transporter.sendMail).toHaveBeenCalledTimes(3);
  });
});
