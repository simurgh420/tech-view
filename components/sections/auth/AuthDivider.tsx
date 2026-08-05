export function AuthDivider({ label = 'یا ادامه با' }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-linear-to-r from-transparent via-cyan-400/30 to-cyan-400/30" />
      <span className="font-mono text-[10px] uppercase tracking-widest text-cyan-400/60">
        {label}
      </span>
      <span className="h-px flex-1 bg-linear-to-l from-transparent via-cyan-400/30 to-cyan-400/30" />
    </div>
  );
}
