import { PromoBanners } from '@/features/products/components/banner/PromoBanner/PromoBanners';
import { CategoriesSection } from '@/features/category/components/CategoriesSection';
import { HeroSection } from '@/features/hero/components/HeroSection';
import { TopBrands } from '@/features/products/components/TopBrands/TopBrands';
import { ProductBanner } from '@/features/products/components/banner/ProductBanner/ProductBanner';
import { BlogSection } from '@/features/blog/components/BlogSection';
import { FeatureBar } from '@/components/sections/services/FeatureBar';
import ProductsOnSale from '@/features/products/components/ProductsOnSale/ProductsOnSale';
import NewProducts from '@/features/products/components/NewProducts/NewProducts';
import BestSellers from '@/features/products/components/BestSeller/BestSellers';
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
