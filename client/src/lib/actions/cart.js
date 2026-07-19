"use server";

import { serverMutation } from "../core/server";
import { revalidatePath } from "next/cache";

export const addToCart = async (productId, quantity = 1) => {
  const result = await serverMutation("cart", "POST", { productId, quantity });
  revalidatePath("/cart");
  return result;
};

export const updateCartItem = async (productId, quantity) => {
  const result = await serverMutation("cart", "PATCH", { productId, quantity });
  revalidatePath("/cart");
  return result;
};
