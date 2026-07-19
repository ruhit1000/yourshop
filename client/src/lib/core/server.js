import { getUserToken } from "./session";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const authHeader = async () => {
  const token = await getUserToken();
  const header = {
    authorization: `Bearer ${token}`,
  };
  return token ? header : {};
};

// Public GET — no auth required
export const serverFetch = async (path) => {
  const res = await fetch(`${baseUrl}/api/${path}`, {
    cache: "no-store",
  });
  return res.json();
};

// Protected GET — attaches Bearer token
export const protectedFetch = async (path) => {
  const res = await fetch(`${baseUrl}/api/${path}`, {
    cache: "no-store",
    headers: await authHeader(),
  });
  return res.json();
};

// Protected POST / PATCH / PUT
export const serverMutation = async (path, method, data) => {
  const res = await fetch(`${baseUrl}/api/${path}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || json.message || "Request failed");
  }
  return json;
};

// Protected DELETE
export const serverDelete = async (path) => {
  const res = await fetch(`${baseUrl}/api/${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(await authHeader()),
    },
  });
  return res.json();
};
