"use server";

import { serverMutation } from "../core/server";
import { revalidatePath } from "next/cache";

export const updateOrderStatus = async (orderId, status) => {
  const result = await serverMutation(`orders/${orderId}`, "PATCH", { status });
  revalidatePath("/admin/orders");
  return result;
};
