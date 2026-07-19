export default function SkeletonCard() {
  return (
    <div className="bg-[#1E293B] rounded-2xl overflow-hidden border border-white/5 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-52 bg-[#0F1929]" />

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category pill */}
        <div className="h-5 w-20 bg-[#0F1929] rounded-full" />
        {/* Title */}
        <div className="h-4 bg-[#0F1929] rounded-lg w-full" />
        <div className="h-4 bg-[#0F1929] rounded-lg w-3/4" />
        {/* Stars */}
        <div className="h-3 bg-[#0F1929] rounded w-24" />
        {/* Price + Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-7 w-16 bg-[#0F1929] rounded-lg" />
        </div>
        <div className="h-10 bg-[#0F1929] rounded-xl" />
      </div>
    </div>
  );
}
