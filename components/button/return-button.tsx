// components/ui/return-button.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import { BackButtonClient } from './back-button-client';

interface ReturnButtonProps {
  href?: string;
  label?: string;
  useBack?: boolean;
}

export const ReturnButton = ({ href, label = 'بازگشت', useBack = false }: ReturnButtonProps) => {
  if (useBack) {
    return <BackButtonClient label={label} />;
  }

  if (href) {
    return (
      <Button size="sm" variant="outline" asChild>
        <Link href={href}>
          <ArrowLeftIcon className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      </Button>
    );
  }

  // fallback (نباید رخ دهد)
  return null;
};
