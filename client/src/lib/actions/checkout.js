"use server";

import { stripe } from "../stripe";
import { getUserCart } from "../api/cart";
import { getUserSession } from "../core/session";

export const createStripeCheckoutSession = async () => {
  const user = await getUserSession();
  if (!user) throw new Error("Not authenticated");

  const cartData = await getUserCart();
  const cart = cartData?.items || [];

  if (cart.length === 0) throw new Error("Cart is empty");

  const lineItems = cart.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.product?.name || "Product",
        images: item.product?.imageUrl ? [item.product.imageUrl] : [],
      },
      unit_amount: item.product?.priceCents || 0,
    },
    quantity: item.quantity,
  }));

  const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: lineItems,
    mode: "payment",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    metadata: { userId: user.id },
  });

  return { url: session.url };
};
