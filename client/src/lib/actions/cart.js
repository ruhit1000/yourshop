"use server";

import { serverMutation, protectedFetch } from "../core/server";

export async function getCartCount() {
  try {
    const data = await protectedFetch("cart");
    if (!data || data.error || data.message) return 0;
    const items = data.items || [];
    return items.reduce((acc, item) => acc + item.quantity, 0);
  } catch (error) {
    console.error("Failed to get cart count:", error);
    return 0;
  }
}

export async function updateCartItem(productId, quantity) {
  try {
    const data = await serverMutation("cart", "PATCH", {
      productId,
      quantity,
    });
    if (data && data.error) throw new Error(data.error);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return { success: false, error: error.message || "Failed to update cart item" };
  }
}

export async function addToCart(productId, quantity = 1) {
  try {
    const data = await serverMutation("cart", "POST", {
      productId,
      quantity,
    });
    if (data && data.error) throw new Error(data.error);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to add cart item:", error);
    return { success: false, error: error.message || "Failed to add cart item" };
  }
}
