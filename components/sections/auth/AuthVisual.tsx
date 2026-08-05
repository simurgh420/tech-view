import Image from 'next/image';

export function AuthVisual() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <Image
        src="/img/auth/cover.jpg"
        alt="TechView"
        fill
        sizes="100vw"
        priority
        className="object-cover opacity-50"
      />

      {/* گرید نئونی */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #00f0ff 1px, transparent 1px),
            linear-gradient(to bottom, #00f0ff 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* گرادیانت تیره برای خوانایی مرکز */}
      <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-radial-[at_center] from-transparent via-black/30 to-black/70" />

      {/* گلوهای نئونی */}
      <div className="absolute -right-32 -top-32 h-128 w-lg rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="absolute -bottom-32 -left-32 h-128 w-lg rounded-full bg-fuchsia-500/15 blur-[120px]" />

      {/* خط اسکن */}
      <div className="absolute inset-x-0 top-0 h-px animate-[scan_5s_linear_infinite] bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_2px_rgba(34,211,238,0.6)]" />

      {/* برندینگ بالا راست */}
      <div className="absolute right-6 top-6 z-10 flex items-center gap-3 md:right-10 md:top-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-400/50 bg-black/60 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
          <span className="font-mono text-xs font-black text-cyan-400">TV</span>
        </div>
        <span className="font-mono text-base font-bold tracking-widest text-white">
          TECH<span className="text-cyan-400">VIEW</span>
        </span>
      </div>

      {/* براکت‌های HUD گوشه‌ها */}
      <div className="absolute left-6 top-6 h-6 w-6 border-l-2 border-t-2 border-cyan-400/50 md:left-10 md:top-8" />
      <div className="absolute bottom-6 right-6 h-6 w-6 border-b-2 border-r-2 border-fuchsia-400/50 md:bottom-8 md:right-10" />
    </div>
  );
}
