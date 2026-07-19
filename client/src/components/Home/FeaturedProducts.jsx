import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "../shared/ProductCard";
import SkeletonCard from "../shared/SkeletonCard";
import { getFeaturedProducts } from "@/lib/api/products";

export default async function FeaturedProducts() {
  let products = [];
  try {
    const data = await getFeaturedProducts(8);
    products = data?.products || [];
  } catch (error) {
    console.error("Failed to fetch featured products", error);
  }

  return (
    <section className="py-20 bg-[#0F1929]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">New Arrivals</h2>
          <Link href="/shop?sort=newest" className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 group transition-colors">
            View All <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            // Render skeletons if no products or loading fails
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          )}
        </div>
      </div>
    </section>
  );
}
