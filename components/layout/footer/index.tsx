import { FooterBottom } from './FooterBottom';
import { FooterColumns } from './FooterColumns';

export function Footer() {
  return (
    <footer className="py-6 px-10 sm:px-6 lg:px-8 bg-linear-to-r from-[#081438] via-[#00283a] to-[#081438] text-white border-t border-[#CBCBCB]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-2 py-2 lg:flex-row">
        <FooterColumns />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <FooterBottom />
      </div>
    </footer>
  );
}
