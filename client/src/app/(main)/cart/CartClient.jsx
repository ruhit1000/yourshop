"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { updateCartItem } from "@/lib/actions/cart";

export default function CartClient({ initialCart }) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart || { items: [], cartTotal: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateQuantity = async (productId, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    setIsProcessing(true);
    
    // Optimistic update
    const updatedItems = cart.items.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0);
    
    const newTotal = updatedItems.reduce((acc, item) => acc + (item.product?.priceCents || 0) * item.quantity, 0);
    setCart({ ...cart, items: updatedItems, cartTotal: newTotal });
    
    // Server update
    await updateCartItem(productId, newQty);
    setIsProcessing(false);
    router.refresh();
  };

  const handleRemove = async (productId) => {
    await handleUpdateQuantity(productId, 1, -1);
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/payment", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      setIsProcessing(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#0A0F1E] text-white">
        <div className="bg-[#1E293B] p-8 rounded-full mb-6 border border-white/5">
          <ShoppingBag size={64} className="text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-400 mb-8 max-w-sm text-center">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link 
          href="/shop"
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] pt-32 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="w-full lg:w-2/3 space-y-4">
            {cart.items.map((item) => {
              const product = item.product;
              if (!product) return null;
              
              const price = `$${(product.priceCents / 100).toFixed(2)}`;
              const total = `$${((product.priceCents * item.quantity) / 100).toFixed(2)}`;
              
              return (
                <div key={item.productId} className="flex gap-4 bg-[#1E293B] p-4 rounded-2xl border border-white/10 relative">
                  <div className="w-24 h-24 bg-[#0A0F1E] rounded-xl relative overflow-hidden flex-shrink-0">
                    {product.imageUrl ? (
                      <Image 
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-2 mix-blend-lighten"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-grow justify-between py-1">
                    <div>
                      <h3 className="text-white font-semibold line-clamp-1 pr-8">{product.name}</h3>
                      <p className="text-sm text-gray-400">{product.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3 bg-[#0A0F1E] border border-white/10 rounded-lg p-1">
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                          disabled={isProcessing}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-white font-semibold w-4 text-center text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1)}
                          disabled={isProcessing || item.quantity >= product.stock}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-amber-400 font-bold">{total}</span>
                        {item.quantity > 1 && (
                          <div className="text-xs text-gray-500 mt-0.5">{price} each</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemove(item.productId)}
                    disabled={isProcessing}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-[#1E293B] p-6 rounded-2xl border border-white/10 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${(cart.cartTotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300 pb-4 border-b border-white/10">
                  <span>Shipping</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl pt-2">
                  <span>Total</span>
                  <span className="text-amber-400">${(cart.cartTotal / 100).toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-amber-500/20 disabled:opacity-70"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Proceed to Checkout"}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock size={14} />
                <span>Secure Checkout powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
