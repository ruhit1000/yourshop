"use server";

import { protectedFetch } from "../core/server";

export const getUserCart = async () => {
  return protectedFetch("cart");
};
