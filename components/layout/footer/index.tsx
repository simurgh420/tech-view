import { FooterBrand } from './FooterBrand';
import { FooterColumns } from './FooterColumns';
import { FooterNewsletter } from './FooterNewsletter';
import { FooterBottom } from './FooterBottom';

export function Footer() {
  return (
    <footer dir="rtl" className="border-t border-border bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-12 lg:gap-x-0">
          {/* برند + تماس + شبکه‌های اجتماعی */}
          <div className="lg:col-span-4 lg:border-e lg:border-border lg:pe-8">
            <FooterBrand />
          </div>

          {/* ستون‌های لینک */}
          <div className="lg:col-span-5 lg:border-e lg:border-border lg:px-8">
            <FooterColumns />
          </div>

          {/* خبرنامه */}
          <div className="lg:col-span-3 lg:ps-8">
            <FooterNewsletter />
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto max-w-7xl px-4">
          <FooterBottom />
        </div>
      </div>
    </footer>
  );
}
