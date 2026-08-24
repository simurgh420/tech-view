import SpecsSection from './SpecsSection';

type Props = {
  specs: {
    group: string;
    items: {
      attributeId: string | null;
      label: string;
      value: string | number;
    }[];
  }[];
};

export default function ProductSpecs({ specs }: Props) {
  if (!specs?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {specs.map(section => (
        <SpecsSection key={section.group} title={section.group} items={section.items} />
      ))}
    </div>
  );
}
