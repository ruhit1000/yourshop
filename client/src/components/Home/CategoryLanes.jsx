import Link from "next/link";
import { Laptop, Smartphone, Headphones, Watch, Camera, Gamepad2 } from "lucide-react";

const CATEGORIES = [
  { name: "Laptops", icon: Laptop, color: "text-blue-500", bg: "bg-blue-500/10", border: "hover:border-blue-500/50" },
  { name: "Smartphones", icon: Smartphone, color: "text-purple-500", bg: "bg-purple-500/10", border: "hover:border-purple-500/50" },
  { name: "Audio", icon: Headphones, color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
  { name: "Wearables", icon: Watch, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50" },
  { name: "Cameras", icon: Camera, color: "text-rose-500", bg: "bg-rose-500/10", border: "hover:border-rose-500/50" },
  { name: "Gaming", icon: Gamepad2, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "hover:border-indigo-500/50" },
];

export default function CategoryLanes() {
  return (
    <section className="py-20 bg-[#0A0F1E]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Shop by Category</h2>
          <Link href="/shop" className="text-sm font-medium text-blue-400 hover:text-blue-300 hidden sm:block">
            View All Categories →
          </Link>
        </div>

        {/* Scrollable container on mobile, grid on desktop */}
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4 snap-x snap-mandatory hide-scrollbar">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/shop?category=${category.name}`}
                className={`flex-none w-[140px] sm:w-auto flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-[#1E293B] border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl snap-start ${category.border} group`}
              >
                <div className={`w-16 h-16 rounded-full ${category.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon size={32} className={category.color} />
                </div>
                <span className="font-semibold text-gray-300 group-hover:text-white transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
