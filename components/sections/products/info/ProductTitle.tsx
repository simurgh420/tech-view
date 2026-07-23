// components/product/info/ProductTitle.tsx
type Props = {
  title: string;
  brand: string;
  model?: string;
};

export default function ProductTitle({ title, brand, model }: Props) {
  return (
    <header className="space-y-4 text-start">
      <div className="space-y-2">
        <span
          className="
            inline-flex
            rounded-full
            bg-neutral-100
            px-3
            py-1
            text-xs
            font-medium
            text-neutral-600

            dark:bg-neutral-800
            dark:text-neutral-300
          "
        >
          {brand}
        </span>

        <h1
          className="
    text-3xl
    font-extrabold
    leading-tight
    tracking-tight
    text-neutral-900
    dark:text-neutral-100
    text-right
    [direction:ltr]
    [unicode-bidi:plaintext]
  "
        >
          {title}
        </h1>
      </div>

      {model && (
        <p
          className="
            text-sm
            text-neutral-500

            dark:text-neutral-400
          "
        >
          مدل
          <span className="ms-2 font-semibold text-neutral-700 dark:text-neutral-200">{model}</span>
        </p>
      )}
    </header>
  );
}
