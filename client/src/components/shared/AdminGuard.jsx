import { requireRole } from "@/lib/core/session";

// Server Component guard — wrap any admin page to auto-redirect non-admins
export default async function AdminGuard({ children }) {
  await requireRole("admin");
  return <>{children}</>;
}
