// components/product/info/ProductKeyFeatures.tsx
import { Check } from 'lucide-react';

type Props = {
  features: string[];
};

export default function ProductKeyFeatures({ features }: Props) {
  if (!features.length) return null;

  return (
    <div className="space-y-3">
      <h3
        className="
          text-sm
          font-semibold
          text-neutral-900
          dark:text-neutral-100
        "
      >
        ویژگی‌های کلیدی
      </h3>

      <ul className="space-y-2.5">
        {features.map((feature, index) => (
          <li
            key={index}
            className="
              flex
              items-start
              gap-3
              text-sm
              leading-7
              text-neutral-700
              dark:text-neutral-300
            "
          >
            <span
              className="
                mt-1
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-emerald-500/10
                text-emerald-600
                dark:bg-emerald-500/15
                dark:text-emerald-400
              "
            >
              <Check size={12} strokeWidth={3} />
            </span>

            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
