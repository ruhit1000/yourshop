"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Gradient Band */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900 opacity-90" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=20')] bg-cover bg-center mix-blend-overlay opacity-30" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center bg-black/40 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 mx-auto bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30"
          >
            <Mail size={32} className="text-white" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get Weekly Tech Insights
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Subscribe to our newsletter and receive exclusive deals, tech news, and early access to our biggest sales.
          </p>

          <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-6 py-4 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all pr-32"
              required
              disabled={status !== "idle"}
            />
            <button
              type="submit"
              disabled={status !== "idle"}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-full flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait">
                {status === "idle" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Subscribe
                  </motion.div>
                )}
                {status === "loading" && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </motion.div>
                )}
                {status === "success" && (
                  <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-green-300">
                    <CheckCircle2 size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
