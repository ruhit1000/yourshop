"use client";

import Link from "next/link";
import { HelpCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="w-24 h-24 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-8 animate-bounce">
          <HelpCircle size={48} />
        </div>

        {/* 404 Header */}
        <h1 className="text-8xl font-black tracking-tighter text-white mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-white mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 active:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Home size={18} />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-colors w-full sm:w-auto"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
