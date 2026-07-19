"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image as ImageIcon } from "lucide-react";

export default function ImageGallery({ images = [], alt = "Product image" }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If there are no images, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-[#1E293B] rounded-3xl flex items-center justify-center border border-white/5">
        <ImageIcon size={64} className="text-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="w-full aspect-square bg-[#1E293B] rounded-3xl overflow-hidden border border-white/5 relative group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${alt} - View ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-contain mix-blend-lighten p-8"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-none w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === idx
                  ? "border-blue-500 opacity-100"
                  : "border-transparent opacity-50 hover:opacity-100 bg-[#1E293B]"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain mix-blend-lighten p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
