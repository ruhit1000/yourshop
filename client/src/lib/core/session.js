import { headers, cookies } from "next/headers";
import { auth } from "../auth";
import { redirect } from "next/navigation";

export const getUserSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
};

export const getUserToken = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value || 
                cookieStore.get("__Secure-better-auth.session_token")?.value;
  return token || null;
};

export const requireRole = async (role) => {
  const user = await getUserSession();
  if (!user) {
    redirect("/login");
  }
  if (role && user?.role !== role) {
    redirect("/unauthorized");
  }
  return user;
};
