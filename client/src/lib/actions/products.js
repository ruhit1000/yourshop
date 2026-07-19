"use server";

import { serverMutation, serverDelete } from "../core/server";
import { revalidatePath } from "next/cache";

export const createProduct = async (data) => {
  const result = await serverMutation("products", "POST", data);
  revalidatePath("/admin/products");
  return result;
};

export const deleteProduct = async (id) => {
  const result = await serverDelete(`products/${id}`);
  revalidatePath("/admin/products");
  return result;
};
