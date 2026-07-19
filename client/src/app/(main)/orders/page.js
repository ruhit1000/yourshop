import { requireRole } from "@/lib/core/session";
import { getUserOrders } from "@/lib/api/orders";
import OrdersClient from "./OrdersClient";

export const metadata = {
  title: "My Orders | YourShop",
  description: "View and track your order history.",
};

export default async function OrdersPage({ searchParams }) {
  // Ensure customer is authenticated
  await requireRole();

  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams?.page || "1", 10);

  let ordersData = { orders: [], totalPages: 1, currentPage: 1, totalOrders: 0 };
  try {
    const res = await getUserOrders(page);
    if (res && !res.error && !res.message) {
      ordersData = res;
    }
  } catch (error) {
    console.error("Failed to fetch user orders:", error);
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] pt-28 pb-16 text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">My Orders</h1>
        <OrdersClient initialOrdersData={ordersData} />
      </div>
    </div>
  );
}
