import { FooterBottom } from './FooterBottom';
import { FooterColumns } from './FooterColumns';

export function Footer() {
  return (
    <footer className="py-0.5 bg-[oklch(15%_0.01_270)] bg-linear-to-b from-[oklch(18%_0.015_270)] to-[oklch(12%_0.01_270)] border-t border-white/5 text-gray-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-2 py-2 lg:flex-row">
        <FooterColumns />
      </div>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 ">
        <FooterBottom />
      </div>
    </footer>
  );
}
