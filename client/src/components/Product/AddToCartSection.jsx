"use client";

import { useState } from "react";
import { ShoppingCart, CheckCircle2, Minus, Plus } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function AddToCartSection({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("idle"); // idle, loading, success
  const { data: session } = useSession();
  const router = useRouter();

  const isOutOfStock = product.stock === 0;

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const newVal = prev + delta;
      if (newVal < 1) return 1;
      if (newVal > product.stock) return product.stock;
      return newVal;
    });
  };

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    
    setStatus("loading");
    try {
      const res = await addToCart(product._id, quantity);
      if (!res.success) throw new Error(res.error || "Failed to add to cart");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert(err.message || "Failed to add to cart");
    }
  };

  if (isOutOfStock) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center justify-center font-semibold">
        Out of Stock
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
      {/* Quantity Selector */}
      <div className="flex items-center justify-between w-full sm:w-auto bg-[#1E293B] border border-white/10 rounded-xl p-1">
        <button
          onClick={() => handleQuantityChange(-1)}
          disabled={quantity <= 1 || status !== "idle"}
          className="p-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/5"
        >
          <Minus size={18} />
        </button>
        <span className="w-12 text-center font-semibold text-white">{quantity}</span>
        <button
          onClick={() => handleQuantityChange(1)}
          disabled={quantity >= product.stock || status !== "idle"}
          className="p-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-white/5"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Add To Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={status !== "idle"}
        className="flex-1 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div key="idle" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
              <ShoppingCart size={20} />
              Add to Cart
            </motion.div>
          )}
          {status === "loading" && (
            <motion.div key="loading" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </motion.div>
          )}
          {status === "success" && (
            <motion.div key="success" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2">
              <CheckCircle2 size={20} />
              Added!
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
