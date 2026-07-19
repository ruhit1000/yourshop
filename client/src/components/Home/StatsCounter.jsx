"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";

const STATS = [
  { label: "Happy Customers", value: 25000, suffix: "+" },
  { label: "Products Sold", value: 100000, suffix: "+" },
  { label: "Brands Partnered", value: 150, suffix: "" },
  { label: "Years in Business", value: 10, suffix: "+" },
];

function Counter({ endValue, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function: easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeOut * endValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, endValue, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function StatsCounter() {
  return (
    <section className="py-20 bg-[#0F1929] border-y border-white/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 font-mono flex items-center">
                <Counter endValue={stat.value} />
                <span className="text-blue-500 ml-1">{stat.suffix}</span>
              </div>
              <p className="text-gray-400 font-medium uppercase tracking-wider text-xs md:text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
