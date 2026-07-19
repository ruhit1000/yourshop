import { protectedFetch } from "../core/server";

export const getAdminCustomers = async (page = 1) => {
  return protectedFetch(`admin/customers?page=${page}`);
};
