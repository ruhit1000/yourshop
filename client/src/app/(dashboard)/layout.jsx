import { requireRole } from "@/lib/core/session";
import DashboardNavbar from "@/components/Dashboard/DashboardNavbar";

export const metadata = {
  title: "YourShop — Admin Dashboard",
  description: "Admin panel for YourShop",
};

export default async function DashboardLayout({ children }) {
  await requireRole("admin");

  return (
    <div className="bg-[#0A0F1E] text-white min-h-screen">
      <DashboardNavbar />
      <main className="md:pl-64 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
