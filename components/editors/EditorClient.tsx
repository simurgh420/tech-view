'use client';

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), {
  ssr: false,
  loading: () => <p>در حال بارگذاری ادیتور...</p>,
});
type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function EditorClient({ value, onChange }: Props) {
  return <Editor value={value} onChange={onChange} />;
}
