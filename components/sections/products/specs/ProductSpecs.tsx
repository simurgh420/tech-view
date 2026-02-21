// components/product/specs/ProductSpecs.tsx
'use client';

import SpecsSection from './SpecsSection';

type Props = {
  specs: {
    [category: string]: {
      label: string;
      value: string | number;
    }[];
  };
};

export default function ProductSpecs({ specs }: Props) {
  const categories = Object.keys(specs);

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <SpecsSection key={category} title={category} items={specs[category]} />
      ))}
    </div>
  );
}
