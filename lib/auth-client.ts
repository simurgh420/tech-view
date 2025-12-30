import { createAuthClient } from 'better-auth/react';

// بهتر است baseURL به صورت خودکار از window.location استفاده کند
function getBaseURL(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // برای SSR
  return (
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  );
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});
