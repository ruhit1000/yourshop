import { protectedFetch } from "../core/server";

export const getUserOrders = async (page = 1) => {
  return protectedFetch(`orders?page=${page}`);
};

export const getOrderById = async (id) => {
  return protectedFetch(`orders/${id}`);
};

export const getAdminOrders = async (page = 1) => {
  return protectedFetch(`admin/orders?page=${page}`);
};
