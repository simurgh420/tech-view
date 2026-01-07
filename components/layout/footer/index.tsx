import { FooterBottom } from './FooterBottom';
import { FooterColumns } from './FooterColumns';

export function Footer() {
  return (
    <footer className=" py-4 px-10 sm:px-6 lg:px-8 bg-[oklch(15%_0.01_270)] bg-linear-to-b from-[oklch(18%_0.015_270)] to-[oklch(12%_0.01_270)] border-t border-white/5 text-[oklch(85%_0.01_270)] ">
      {' '}
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-2 py-2 lg:flex-row">
        <FooterColumns />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <FooterBottom />
      </div>
    </footer>
  );
}
