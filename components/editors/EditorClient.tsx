'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => <p>در حال بارگذاری ادیتور...</p>,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditorClient({ value, onChange, slug }: any) {
  return <Editor value={value} onChange={onChange} slug={slug} />;
}
