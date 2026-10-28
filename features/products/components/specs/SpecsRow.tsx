type Props = {
  label: string;
  value: string | number;
};

export default function SpecsRow({ label, value }: Props) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-6
        rounded-xl
        border-b
        border-neutral-200/70
        py-4
        transition-colors
        duration-200
        hover:bg-neutral-50
        last:border-b-0
        dark:border-neutral-800/70
        dark:hover:bg-white/5
      "
    >
      <span
        className="
          min-w-36
          text-sm
          font-medium
          text-neutral-500
          dark:text-neutral-400
        "
      >
        {label}
      </span>

      <span
        className="
          flex-1
          wrap-break-word
          text-start
          text-sm
          font-semibold
          text-neutral-900
          dark:text-neutral-100
        "
      >
        {value}
      </span>
    </div>
  );
}
