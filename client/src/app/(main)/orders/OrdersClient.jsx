"use client";

import { useState } from "react";
import { ChevronDown, Calendar, CreditCard, Box, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Pagination from "@/components/shared/Pagination";
import Image from "next/image";

function StatusBadge({ status }) {
  const styles = {
    processing: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    shipped: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    delivered: "bg-green-500/10 text-green-500 border border-green-500/20",
    cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
  };

  const currentStyle = styles[status] || styles.processing;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${currentStyle}`}>
      {status}
    </span>
  );
}

function OrderCard({ order }) {
  const [isOpen, setIsOpen] = useState(false);
  const totalAmount = (order.totalAmountCents || order.totalCents || 0) / 100;
  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="glass border border-white/10 rounded-2xl overflow-hidden mb-4 transition-all hover:border-white/20">
      {/* Header section */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-400">Order ID:</span>
            <span className="text-sm font-mono text-white bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {order._id}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {dateStr}
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard size={14} />
              Stripe • Paid
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-400">Total</div>
            <div className="text-lg font-bold text-white">${totalAmount.toFixed(2)}</div>
          </div>

          <div className="flex items-center gap-4">
            <StatusBadge status={order.status || "processing"} />
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Accordion Line Items */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 bg-white/[0.02]"
          >
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Order Items
              </h3>
              {(order.items || []).map((item, idx) => {
                const itemPrice = (item.priceCents || 0) / 100;
                return (
                  <div
                    key={item.productId || idx}
                    className="flex items-center justify-between gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.product?.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Box size={24} className="text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm line-clamp-1">
                          {item.product?.name || "Product Name"}
                        </h4>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Qty: {item.quantity} • ${itemPrice.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-bold text-white text-sm">
                      ${(itemPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrdersClient({ initialOrdersData }) {
  const { orders = [], totalPages = 1, currentPage = 1, totalOrders = 0 } = initialOrdersData;

  if (orders.length === 0) {
    return (
      <div className="glass border border-white/10 rounded-3xl p-12 text-center max-w-xl mx-auto mt-8">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 text-blue-400">
          <Box size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">No orders found</h2>
        <p className="text-gray-400 mb-8">
          You haven't placed any orders yet. Start exploring our shop!
        </p>
        <a
          href="/shop"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-full transition-colors shadow-lg shadow-blue-500/20"
        >
          Go to Shop
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-400 mb-2">
        Showing {orders.length} of {totalOrders} orders
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      <Pagination totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}
