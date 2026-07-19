import { Suspense } from "react";
import SearchBar from "@/components/Shop/SearchBar";
import FilterSidebar from "@/components/Shop/FilterSidebar";
import SortDropdown from "@/components/Shop/SortDropdown";
import ProductGrid from "@/components/Shop/ProductGrid";
import Pagination from "@/components/shared/Pagination";
import ProductSkeleton from "@/components/Shop/ProductSkeleton";
import { getProducts } from "@/lib/api/products";

export const metadata = {
  title: "Shop — YourShop",
  description: "Browse our premium selection of electronics.",
};

export default async function ShopPage({ searchParams }) {
  // searchParams in Next.js 13+ App Router (Server Components) is a Promise in Next.js 15,
  // but since we are using Next 14/15, it's safer to await it if needed, or use it directly.
  const resolvedParams = await searchParams;

  let products = [];
  let totalPages = 1;
  let currentPage = parseInt(resolvedParams?.page || "1", 10);

  try {
    const data = await getProducts(resolvedParams);
    products = data?.products || [];
    totalPages = data?.meta?.totalPages || 1;
  } catch (err) {
    console.error("Failed to load products", err);
  }

  return (
    <div className="bg-[#0A0F1E] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore Products</h1>
          <div className="max-w-xl">
            <SearchBar />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4 xl:w-1/5 shrink-0">
            <FilterSidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[#1E293B] p-4 rounded-2xl border border-white/5">
              <p className="text-gray-400 text-sm">
                Showing <span className="text-white font-medium">{products.length}</span> results
                {resolvedParams?.category && <span> for <strong className="text-blue-400">{resolvedParams.category}</strong></span>}
                {resolvedParams?.q && <span> matching "<strong className="text-white">{resolvedParams.q}</strong>"</span>}
              </p>
              <div className="shrink-0 w-full sm:w-auto">
                <SortDropdown />
              </div>
            </div>

            {/* Product Grid */}
            <Suspense fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            }>
              <ProductGrid products={products} />
            </Suspense>

            {/* Pagination */}
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </main>
        </div>
      </div>
    </div>
  );
}
