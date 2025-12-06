import { PromoBanners } from '@/components/PromoBanner/PromoBanners';
import { CategoriesSection } from '@/components/sections/categories/CategoriesSection';
import { HeroSection } from '@/components/sections/hero/HeroSection';
import { BestSellers } from '@/components/sections/products/BestSellers';
import { NewProducts } from '@/components/sections/products/NewProducts';
import { ProductsOnSale } from '@/components/sections/products/ProductsOnSale';

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
      </div>
    </main>
  );
}
