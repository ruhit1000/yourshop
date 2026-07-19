import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserCart } from "@/lib/api/cart";
import { requireRole } from "@/lib/core/session";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(req) {
  try {
    await requireRole();
    const cart = await getUserCart();
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const line_items = cart.items.map((item) => {
      const product = item.product;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.imageUrl ? [product.imageUrl] : [],
          },
          unit_amount: product.priceCents,
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe payment error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
