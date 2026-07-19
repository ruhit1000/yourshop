import { requireRole } from "@/lib/core/session";
import { serverMutation } from "@/lib/core/server";
import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Order Successful | YourShop",
  description: "Your order has been placed successfully.",
};

export default async function CheckoutSuccessPage({ searchParams }) {
  await requireRole();
  const sessionId = (await searchParams)?.session_id;

  let isSuccess = false;
  let orderData = null;
  let errorMsg = null;

  try {
    if (sessionId) {
      // Process the order on the backend
      orderData = await serverMutation("checkout", "POST");
      isSuccess = true;
    } else {
      errorMsg = "Invalid session.";
    }
  } catch (error) {
    // If the cart is already empty (e.g. user refreshed the page), the backend returns 400
    if (error.message && error.message.includes("empty")) {
      isSuccess = true; // Order was likely already processed
    } else {
      errorMsg = error.message || "Failed to process order";
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-[#1E293B] p-10 rounded-3xl border border-white/10 shadow-2xl text-center">
        {isSuccess ? (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="text-green-500 w-24 h-24" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-gray-400 mb-8">
              Thank you for your purchase. Your order has been placed successfully and is now being processed.
            </p>
            {orderData?.orderId && (
              <p className="text-sm text-gray-500 mb-8">
                Order ID: {orderData.orderId}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/shop"
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold py-3 px-6 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                <ShoppingBag className="mr-2" size={18} />
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-4xl">!</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Oops!</h1>
            <p className="text-gray-400 mb-8">
              {errorMsg || "Something went wrong processing your order."}
            </p>
            <Link 
              href="/cart"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              Return to Cart
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
