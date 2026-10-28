'use server';

import dns from 'dns/promises';

export async function isValidEmailDomain(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  try {
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('DNS timeout')), 3000)),
    ]);
    return records && records.length > 0;
  } catch {
    return false;
  }
}
