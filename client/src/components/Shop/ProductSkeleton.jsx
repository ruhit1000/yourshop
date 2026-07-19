export default function ProductSkeleton() {
  return (
    <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5 animate-pulse flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-white/5 rounded-xl mb-4 shrink-0"></div>
      
      {/* Content Skeleton */}
      <div className="flex-1 flex flex-col space-y-3">
        {/* Title */}
        <div className="h-5 bg-white/5 rounded-md w-3/4"></div>
        {/* Short description (2 lines) */}
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded-md w-full"></div>
          <div className="h-3 bg-white/5 rounded-md w-5/6"></div>
        </div>
      </div>
      
      {/* Meta info & Button Skeleton */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
        <div className="h-6 bg-white/5 rounded-md w-16"></div>
        <div className="h-8 bg-white/5 rounded-lg w-24"></div>
      </div>
    </div>
  );
}
