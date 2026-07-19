"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ChevronDown, ArrowRight } from "lucide-react";

export default function HeroSection() {
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight * 0.65,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full h-[65vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-[#0A0F1E] pt-20">
      {/* Background Particles/Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight"
            >
              The Future of <br className="hidden md:block" />
              <span className="gradient-text">Premium Electronics</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0"
            >
              Discover curated tech gear that elevates your everyday life. From immersive audio to cutting-edge computing, find it all at YourShop.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop?sort=newest"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 flex items-center justify-center transition-all active:scale-95"
              >
                View Latest
              </Link>
            </motion.div>
          </div>

          {/* Image/Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex justify-center items-center relative"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Abstract elements to simulate 3D showcase */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-white/5 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-blue-500/20 rounded-full border-dashed"
              />
              <img
                src="https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?auto=format&fit=crop&w=800&q=80"
                alt="Premium Headphones"
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl z-10"
                style={{ filter: "drop-shadow(0 25px 25px rgb(0 0 0 / 0.5))" }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Down Chevron */}
      <motion.button
        onClick={scrollToNext}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 1, duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-white transition-colors"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
}
