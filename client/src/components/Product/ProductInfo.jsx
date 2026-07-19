import { Star, ShieldCheck, Truck, RefreshCw } from "lucide-react";

export default function ProductInfo({ product }) {
  const price = product?.priceCents ? `$${(product.priceCents / 100).toFixed(2)}` : "$0.00";

  return (
    <div className="flex flex-col">
      {/* Category Tag */}
      {product?.category && (
        <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full w-fit mb-4 border border-blue-500/20">
          {product.category}
        </span>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
        {product?.name}
      </h1>

      {/* Rating & Stock */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={star <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-600"}
            />
          ))}
          <span className="text-sm text-gray-400 ml-1">(24 reviews)</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-600" />
        {product?.stock > 0 ? (
          <span className="text-sm font-medium text-green-400">In Stock ({product.stock})</span>
        ) : (
          <span className="text-sm font-medium text-red-400">Out of Stock</span>
        )}
      </div>

      {/* Price */}
      <div className="text-4xl font-bold text-amber-400 mb-8">
        {price}
      </div>

      {/* Short description */}
      <p className="text-gray-400 leading-relaxed mb-8">
        Experience premium quality with the {product?.name}. Designed for maximum performance and durability.
      </p>

      {/* Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 py-6 border-y border-white/10">
        <div className="flex items-center gap-3">
          <Truck size={24} className="text-blue-500 shrink-0" />
          <span className="text-sm text-gray-300">Free Shipping</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-green-500 shrink-0" />
          <span className="text-sm text-gray-300">1 Year Warranty</span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCw size={24} className="text-purple-500 shrink-0" />
          <span className="text-sm text-gray-300">30-Day Returns</span>
        </div>
      </div>
    </div>
  );
}
