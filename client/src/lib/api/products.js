import { serverFetch, protectedFetch } from "../core/server";

export const getProducts = async (searchParams = {}) => {
  const query = new URLSearchParams({ limit: "30" });
  if (searchParams.q) query.append("q", searchParams.q);
  if (searchParams.category) query.append("category", searchParams.category);
  if (searchParams.minPrice) query.append("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) query.append("maxPrice", searchParams.maxPrice);
  if (searchParams.sort) query.append("sort", searchParams.sort);
  if (searchParams.page) query.append("page", searchParams.page);
  return serverFetch(`products?${query.toString()}`);
};

export const getProductBySlug = async (slug) => {
  return serverFetch(`products/${slug}`);
};

export const getFeaturedProducts = async (limit = 8) => {
  return serverFetch(`products?sort=newest&limit=${limit}`);
};
