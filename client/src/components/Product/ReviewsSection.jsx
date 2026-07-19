import { Star } from "lucide-react";

const SEEDED_REVIEWS = [
  {
    id: 1,
    name: "Alex Johnson",
    date: "2 weeks ago",
    rating: 5,
    title: "Absolutely fantastic!",
    content: "Exceeded my expectations in every way. The build quality is phenomenal and it works exactly as described. Highly recommended.",
  },
  {
    id: 2,
    name: "Maria Garcia",
    date: "1 month ago",
    rating: 4,
    title: "Great product, slightly delayed shipping",
    content: "The product itself is wonderful. Only giving 4 stars because it took an extra day to arrive, but support was very helpful.",
  },
  {
    id: 3,
    name: "James Smith",
    date: "2 months ago",
    rating: 5,
    title: "Best purchase this year",
    content: "I've tried similar products from other brands, but this one takes the cake. The premium feel is unmatched.",
  },
];

export default function ReviewsSection() {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-12 mb-12">
        {/* Rating Summary */}
        <div className="w-full md:w-1/3">
          <div className="text-5xl font-bold text-white mb-2">4.8</div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={20} className={star <= 4 ? "fill-amber-400 text-amber-400" : "text-gray-600"} />
            ))}
          </div>
          <p className="text-gray-400 mb-6">Based on 24 reviews</p>
          
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 w-3">{rating}</span>
                <Star size={12} className="text-gray-500" />
                <div className="flex-1 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: rating === 5 ? '75%' : rating === 4 ? '20%' : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Review Cards */}
        <div className="w-full md:w-2/3 space-y-6">
          {SEEDED_REVIEWS.map((review) => (
            <div key={review.id} className="bg-[#1E293B] p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-white font-medium">{review.name}</h5>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-600"} />
                  ))}
                </div>
              </div>
              <h6 className="font-semibold text-white mb-2">{review.title}</h6>
              <p className="text-gray-400 text-sm leading-relaxed">{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
