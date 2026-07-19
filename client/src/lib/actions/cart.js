"use server";

import { serverMutation } from "../core/server";

export async function updateCartItem(productId, quantity) {
  try {
    const data = await serverMutation("cart", "PATCH", {
      productId,
      quantity,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return { success: false, error: "Failed to update cart item" };
  }
}
