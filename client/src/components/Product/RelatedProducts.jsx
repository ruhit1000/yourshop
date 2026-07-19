import ProductCard from "../shared/ProductCard";
import SkeletonCard from "../shared/SkeletonCard";
import { getProducts } from "@/lib/api/products";

export default async function RelatedProducts({ category, currentProductId }) {
  let products = [];
  
  try {
    const data = await getProducts({ category, limit: 5 });
    // Filter out the current product and take 4
    products = (data?.products || [])
      .filter((p) => p._id !== currentProductId)
      .slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch related products", error);
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-24 pt-12 border-t border-white/5">
      <h3 className="text-2xl font-bold text-white mb-8">You Might Also Like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
