'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SignInOauthButtonProps {
  provider: 'google' | 'github';
  signUp?: boolean;
  className?: string;
}

export const SignInOauthButton = ({ provider, signUp, className }: SignInOauthButtonProps) => {
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);

    await signIn.social({
      provider,
      callbackURL: '/profile',
      errorCallbackURL: '/login/error',
    });

    setIsPending(false);
  }

  const action = signUp ? 'Up' : 'In';

  const GoogleIcon = (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-2 3.1l3.2 2.5c1.9-1.8 3-4.4 3-7.6 0-.7-.1-1.4-.2-2H12z"
      />
      <path
        fill="#34A853"
        d="M12 21c2.7 0 5-1 6.6-2.6l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2l-3.3 2.6C4.8 18.8 8.1 21 12 21z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 12c0-.7.1-1.4.3-2l-3.3-2.6C2.8 8.7 2 10.3 2 12c0 1.7.8 3.3 1.4 4.6l3.3-2.6c-.2-.6-.3-1.3-.3-2z"
      />
      <path
        fill="#4285F4"
        d="M12 6.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3.9 14.7 3 12 3 8.1 3 4.8 5.2 3.4 8.4l3.3 2.6C7.2 8.6 9.4 6.8 12 6.8z"
      />
    </svg>
  );

  const GitHubIcon = (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.7.5.7 5.5.7 11.8c0 5 3.2 9.2 7.6 10.7.6.1.8-.3.8-.6v-2c-3.1.7-3.8-1.3-3.8-1.3-.5-1.1-1.2-1.4-1.2-1.4-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.6 2.3 2.6 2.3.6-.6.3-1.2.3-1.2-2.5-.3-4.3-1.3-4.3-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.6-.3 2.4-.3s1.6.1 2.4.3c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-1.8 4.8-4.3 5.1 0 0-.3.6.3 1.2 2 0 2.6-2.2 2.6-2.2s.6-1.1 1.7-1.2c0 0 1.1 0 .1.7 0 0-.7.3-1.2 1.4 0 0-.7 2-3.8 1.3v2c0 .3.2.7.8.6 4.4-1.5 7.6-5.7 7.6-10.7C23.3 5.5 18.3.5 12 .5z" />
    </svg>
  );

  const providerConfig = {
    google: {
      label: 'Google',
      bg: 'hover:bg-neutral-800',
      icon: GoogleIcon,
    },
    github: {
      label: 'GitHub',
      bg: 'bg-black  hover:bg-neutral-800',
      icon: GitHubIcon,
    },
  }[provider];

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        `
        w-full h-11 rounded-lg px-4
        flex items-center justify-center gap-3
        font-medium transition-all duration-200
        active:scale-[0.98]
        shadow-sm hover:shadow-md
        disabled:opacity-60 disabled:cursor-not-allowed
      `,
        providerConfig.bg,
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {providerConfig.icon}
          <span>
            Sign {action} with {providerConfig.label}
          </span>
        </>
      )}
    </button>
  );
};
