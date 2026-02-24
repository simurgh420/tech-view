// components/product/specs/ProductSpecs.tsx
'use client';

import SpecsSection from './SpecsSection';

type Props = {
  specs: {
    group: string;
    items: {
      label: string;
      value: string | number;
    }[];
  }[];
};

export default function ProductSpecs({ specs }: Props) {
  return (
    
    <div className="space-y-6">
      {specs.map(section => (
        <SpecsSection key={section.group} title={section.group} items={section.items} />
      ))}
    </div>
  );
}
