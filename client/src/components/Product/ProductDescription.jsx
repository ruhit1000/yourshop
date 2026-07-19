export default function ProductDescription({ description }) {
  return (
    <div className="prose prose-invert prose-blue max-w-none">
      <p className="text-gray-300 leading-relaxed text-lg">
        {description || "No description available for this product."}
      </p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/5">
          <h4 className="text-white font-semibold mb-3">Premium Build</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Crafted with the finest materials to ensure durability and a premium feel that lasts.
          </p>
        </div>
        <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/5">
          <h4 className="text-white font-semibold mb-3">Next-Gen Performance</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Equipped with the latest technology to deliver unmatched speed and efficiency.
          </p>
        </div>
      </div>
    </div>
  );
}
