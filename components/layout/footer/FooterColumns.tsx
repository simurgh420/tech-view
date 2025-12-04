'use client';

import { Button } from '@/components/ui';
import { SocialIcons } from './SocialIcons';
import { LiaUserSolid, LiaArrowRightSolid } from 'react-icons/lia';

export function FooterColumns() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
      {/* ستون 1 */}
      <div className="px-10">
        <h4 className="font-semibold mb-3">Company</h4>
        <ul className="space-y-2">
          <li>About Us</li>
          <li>Blog</li>
          <li>Returns</li>
          <li>Order Status</li>
        </ul>
      </div>

      {/* ستون 2 */}
      <div className="px-10">
        <h4 className="font-semibold mb-3">Info</h4>
        <ul className="space-y-2">
          <li>How it works?</li>
          <li>Our promises</li>
          <li>FAQ</li>
        </ul>
      </div>

      {/* ستون 3 */}
      <div className="px-10">
        <h4 className="font-semibold mb-3">Contact Us</h4>
        <ul className="space-y-2">
          <li> 011 Main Street</li>
          <li>+98 936 876 6577</li>
          <li>mohamadrezah420@gmail.com</li>
        </ul>
      </div>

      {/* ستون 4 */}
      <div className="px-10">
        <h4 className="font-semibold mb-3">Sign up for News</h4>

        {/* ورودی ایمیل با آیکن و فلش */}
        <div className="relative mt-2">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-500">
            <LiaUserSolid className="size-5" />
          </span>
          <input
            type="email"
            placeholder="E-mail Address"
            className="w-full rounded-md border border-[#CBCBCB] text-[#2D2D2D] placeholder:text-[#CBCBCB]
                       pl-10 pr-12 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#179BD7] focus:border-transparent
                       shadow-sm bg-white/10"
            aria-label="Email address"
          />
          <Button
            type="button"
            aria-label="Submit email"
            className="absolute inset-y-0 right-1 top-0.5 flex items-center justify-center rounded-md
                       text-[#179BD7] hover:text-white bg-transparent hover:bg-[#179BD7]
                       transition-colors px-2"
          >
            <LiaArrowRightSolid className="size-4" />
          </Button>
        </div>

        {/* آیکن‌های شبکه اجتماعی */}
        <div className="mt-4">
          <SocialIcons />
        </div>
      </div>
    </div>
  );
}
