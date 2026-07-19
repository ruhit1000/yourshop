"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Check } from "lucide-react";

const CATEGORIES = ["Laptops", "Smartphones", "Audio", "Wearables", "Cameras", "Gaming", "Accessories"];

export default function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");

  const setCategory = (category) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentCategory === category) {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    params.set("page", "1"); // reset page
    router.push(`${pathname}?${params.toString()}`);
  };

  const setPriceRange = (min, max) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="bg-[#0A0F1E] border border-white/10 p-6 rounded-2xl w-full h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-white text-lg">Filters</h3>
        {(searchParams.toString().length > 0) && (
          <button onClick={clearFilters} className="text-sm text-blue-400 hover:text-blue-300">
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-semibold text-white mb-3">Categories</h4>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="flex items-center w-full group"
                >
                  <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors ${isActive ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-600 group-hover:border-blue-500'}`}>
                    {isActive && <Check size={14} className="text-white" />}
                  </div>
                  <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range (Simplified) */}
        <div>
          <h4 className="font-semibold text-white mb-3">Price Range</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPriceRange(null, null)}
              className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
            >
              Any Price
            </button>
            <button
              onClick={() => setPriceRange(null, "100")}
              className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
            >
              Under $100
            </button>
            <button
              onClick={() => setPriceRange("100", "500")}
              className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
            >
              $100 - $500
            </button>
            <button
              onClick={() => setPriceRange("500", null)}
              className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
            >
              Over $500
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
