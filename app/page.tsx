import { PromoBanners } from '@/components/sections/products/banner/PromoBanner/PromoBanners';
import { CategoriesSection } from '@/components/sections/categories/CategoriesSection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { TopBrands } from '@/components/sections/products/TopBrands/TopBrands';
import { ProductBanner } from '@/components/sections/products/banner/ProductBanner/ProductBanner';
import { BlogSection } from '@/components/sections/blog/BlogSection';
import { FeatureBar } from '@/components/sections/services/FeatureBar';
import ProductsOnSale from '@/components/sections/products/ProductsOnSale/ProductsOnSale';
import NewProducts from '@/components/sections/products/NewProducts/NewProducts';
import BestSellers from '@/components/sections/products/BestSeller/BestSellers';
import { Reveal } from '@/components/shared/Reveal';

export default function Home() {
  return (
    <main>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 lg:space-y-24">
        {/* Hero Section */}
        <HeroSection />
        {/* Categories Section */}
        <Reveal>
          <CategoriesSection />
        </Reveal>
        {/* Products On Sale */}
        <Reveal>
          <ProductsOnSale />
        </Reveal>
        {/* NewProducts */}
        <Reveal>
          <NewProducts />
        </Reveal>
        {/* Banners */}
        <Reveal>
          <PromoBanners />
        </Reveal>
        {/* Best Sellers */}
        <Reveal>
          <BestSellers />
        </Reveal>
        {/* Top Brands */}
        <Reveal>
          <TopBrands />
        </Reveal>
        {/* Product Banner */}
        <Reveal>
          <ProductBanner />
        </Reveal>
        {/* Blog Section */}
        <Reveal>
          <BlogSection />
        </Reveal>
        {/* Feature Bar */}
        <Reveal>
          <FeatureBar />
        </Reveal>
      </div>
    </main>
  );
}
