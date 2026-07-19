"use client";

import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Tech Enthusiast",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    content: "The delivery was incredibly fast and the customer service is top-notch. My new laptop works perfectly. Will definitely shop here again!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Software Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    content: "Finding the exact mechanical keyboard I wanted was so easy with their search filters. The UI is incredibly snappy and clean.",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Content Creator",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    content: "I got a fantastic deal on my camera gear during the flash sale. The whole checkout process with Stripe was seamless and secure.",
  },
  {
    id: 4,
    name: "David Kim",
    role: "Gamer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    content: "YourShop is my go-to for all gaming accessories. The quality is always guaranteed and the 30-day return policy gives me peace of mind.",
  },
  {
    id: 5,
    name: "Amanda Foster",
    role: "Audiophile",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    content: "The headphones I bought are exactly as described. The reviews section really helped me make the right choice.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#0A0F1E]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
          <p className="text-gray-400">Don't just take our word for it — hear from our community of tech lovers.</p>
        </div>

        {/* Scroll-snap Carousel */}
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex-none w-[300px] md:w-[400px] snap-center bg-[#1E293B] rounded-3xl p-8 border border-white/5 relative group hover:border-blue-500/30 transition-colors"
            >
              <Quote className="absolute top-6 right-6 text-white/5 w-16 h-16 group-hover:text-blue-500/10 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              <p className="text-gray-300 mb-8 relative z-10 italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                />
                <div>
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <p className="text-blue-400 text-xs font-medium">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
