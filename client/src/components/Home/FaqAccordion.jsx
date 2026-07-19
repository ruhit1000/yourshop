"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const FAQS = [
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide. International shipping times typically range from 5-14 business days depending on the destination.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day hassle-free return policy. If you're not completely satisfied with your purchase, you can return it in its original packaging for a full refund.",
  },
  {
    question: "Are your products covered by a warranty?",
    answer: "Absolutely. All electronics come with a minimum 1-year manufacturer warranty. We also offer extended YourShop protection plans at checkout.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a confirmation email with a tracking number. You can also view real-time tracking updates in the 'My Orders' section of your account.",
  },
  {
    question: "Do you price match?",
    answer: "Yes! If you find an identical item in stock at a major competitor for a lower price, we'll match it. Contact our support team with the link to request a price match.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We process all payments securely through Stripe. We accept all major credit cards (Visa, MasterCard, Amex), Apple Pay, and Google Pay.",
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  return (
    <section className="py-20 bg-[#0A0F1E]">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400">Everything you need to know about shopping with us.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`border border-white/5 rounded-2xl overflow-hidden transition-colors ${isOpen ? 'bg-[#1E293B] border-white/10' : 'bg-transparent hover:bg-white/5'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-medium text-lg ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`shrink-0 ml-4 ${isOpen ? 'text-blue-500' : 'text-gray-500'}`}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
