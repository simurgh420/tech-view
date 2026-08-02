import { FooterBottom } from './FooterBottom';
import { FooterColumns } from './FooterColumns';

export function Footer() {
  return (
    <footer
      dir="rtl"
      className="border-t border-white/5 bg-[oklch(15%_0.01_270)] bg-linear-to-b from-[oklch(18%_0.015_270)] to-[oklch(12%_0.01_270)] text-gray-200"
    >
      <div className="container mx-auto flex flex-col gap-8 px-4 py-10">
        <FooterColumns />
      </div>
      <div className="container mx-auto">
        <FooterBottom />
      </div>
    </footer>
  );
}
