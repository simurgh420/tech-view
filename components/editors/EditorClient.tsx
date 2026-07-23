'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => (
    <div dir="rtl" className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800" />
    </div>
  ),
});

type Props = {
  value: string;
  onChange: (val: string) => void;
  slug: string;
};

export default function EditorClient({ value, onChange, slug }: Props) {
  return <Editor value={value} onChange={onChange} slug={slug} />;
}
