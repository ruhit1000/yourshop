"use server";

import { protectedFetch } from "../core/server";

export const getAdminStats = async () => {
  return protectedFetch(`admin/stats`);
};
