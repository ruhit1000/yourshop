"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Timer, Zap, ArrowRight } from "lucide-react";

export default function FlashDeals() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num) => num.toString().padStart(2, "0");

  const deals = [
    { id: 1, name: "Pro Noise-Cancelling Headphones", oldPrice: 349, newPrice: 199, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400", discount: 42 },
    { id: 2, name: "Ultra HD 4K Monitor", oldPrice: 599, newPrice: 449, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", discount: 25 },
    { id: 3, name: "Mechanical Gaming Keyboard", oldPrice: 149, newPrice: 89, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400", discount: 40 },
    { id: 4, name: "Wireless Gaming Mouse", oldPrice: 99, newPrice: 59, image: "https://images.unsplash.com/photo-1527814050087-379381547969?w=400", discount: 40 },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0A0F1E] to-[#1E293B] relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Deals Banner / Timer */}
          <div className="w-full lg:w-1/3 bg-amber-500 rounded-3xl p-8 text-black shadow-2xl shadow-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={28} className="fill-black" />
              <h2 className="text-3xl font-extrabold tracking-tight">Flash Deals</h2>
            </div>
            <p className="font-medium text-amber-950 mb-8 text-lg">
              Up to 50% off premium tech. Hurry, offers end soon!
            </p>
            
            <div className="flex items-center gap-4 mb-8">
              <Timer size={24} className="text-amber-950" />
              <div className="flex gap-2 text-2xl font-bold font-mono bg-black/10 px-4 py-2 rounded-xl border border-black/10">
                <span>{format(timeLeft.hours)}</span>:
                <span>{format(timeLeft.minutes)}</span>:
                <span className="text-amber-100">{format(timeLeft.seconds)}</span>
              </div>
            </div>

            <Link href="/shop" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors">
              Shop All Deals <ArrowRight size={18} />
            </Link>
          </div>

          {/* Scrolling Deal Cards */}
          <div className="w-full lg:w-2/3 flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
            {deals.map((deal) => (
              <Link key={deal.id} href={`/shop`} className="flex-none w-64 snap-center group relative bg-[#0A0F1E] rounded-2xl overflow-hidden border border-white/10 hover:border-amber-500/50 transition-all duration-300">
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10 shadow-lg shadow-red-500/30">
                  -{deal.discount}%
                </div>
                <div className="h-48 overflow-hidden bg-white">
                  <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 mb-3 group-hover:text-amber-400 transition-colors">
                    {deal.name}
                  </h3>
                  <div className="flex items-end gap-2">
                    <span className="text-xl font-bold text-amber-400">${deal.newPrice}</span>
                    <span className="text-sm text-gray-500 line-through mb-0.5">${deal.oldPrice}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
