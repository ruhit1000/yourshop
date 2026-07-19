"use client";

import { motion } from "motion/react";
import { Truck, ShieldCheck, HeadphonesIcon, CreditCard } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over $100. Fast, reliable delivery straight to your door.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Your data is protected with military-grade encryption and Stripe processing.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Our dedicated tech experts are always here to help you via chat or email.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: CreditCard,
    title: "Easy Returns",
    description: "30-day money-back guarantee. Return your items hassle-free.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-[#0A0F1E]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose YourShop</h2>
          <p className="text-gray-400">We're committed to providing the best shopping experience for tech enthusiasts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#1E293B] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors text-center group"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={32} className={feature.color} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
