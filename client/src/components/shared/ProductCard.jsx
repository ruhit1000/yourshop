import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingCart } from "lucide-react";

export default function ProductCard({ product }) {
  const price = product?.priceCents
    ? `$${(product.priceCents / 100).toFixed(2)}`
    : "$0.00";

  return (
    <div className="group relative bg-[#1E293B] rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative h-52 overflow-hidden bg-[#0A0F1E]">
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <ShoppingCart size={48} />
          </div>
        )}
        {/* Category Pill */}
        {product?.category && (
          <span className="absolute top-3 left-3 bg-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm border border-blue-500/20">
            {product.category}
          </span>
        )}
        {/* Out of stock badge */}
        {product?.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500/90 text-white text-sm font-bold px-4 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-1 group-hover:text-blue-300 transition-colors">
          {product?.name}
        </h3>

        {/* Star Rating — static 4/5 for display */}
        <div className="flex items-center gap-0.5 my-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              className={star <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-600"}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.0)</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-amber-400 font-bold text-lg">{price}</span>
        </div>

        <Link
          href={`/products/${product?.slug || product?._id}`}
          className="mt-3 flex items-center justify-center w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
