import { PromoBanners } from '@/components/sections/products/banner/PromoBanner/PromoBanners';
import { CategoriesSection } from '@/components/sections/categories/CategoriesSection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { BestSellers } from '@/components/sections/products/BestSeller/BestSellers';
import { NewProducts } from '@/components/sections/products/NewProducts/NewProducts';
import { ProductsOnSale } from '@/components/sections/products/ProductsOnSale/ProductsOnSale';
import { TopBrands } from '@/components/sections/products/TopBrands/TopBrands';
import { ProductBanner } from '@/components/sections/products/banner/ProductBanner/ProductBanner';
import { BlogSection } from '@/components/sections/blog/BlogSection';
import { FeatureBar } from '@/components/sections/services/FeatureBar';

export default function Home() {
  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <HeroSection />
        {/* Categories Section */}
        <CategoriesSection />
        {/* Products On Sale */}
        <ProductsOnSale />
        {/* NewProducts */}
        <NewProducts />
        {/* Banners */}
        <PromoBanners />
        {/* Best Sellers */}
        <BestSellers />
        {/* Top Brands */}
        <TopBrands />
        {/* Product Banner */}
        <ProductBanner />
        {/* Blog Section */}
        <BlogSection />
        {/* Feature Bar */}
        <FeatureBar />
      </div>
    </main>
  );
}
