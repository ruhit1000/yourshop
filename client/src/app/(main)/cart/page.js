import { requireRole } from "@/lib/core/session";
import { getUserCart } from "@/lib/api/cart";
import CartClient from "./CartClient";

export const metadata = {
  title: "Shopping Cart | YourShop",
  description: "View and manage your shopping cart items.",
};

export default async function CartPage() {
  // Ensure user is authenticated
  await requireRole();
  
  // Fetch cart data on server
  const cartData = await getUserCart();
  
  return <CartClient initialCart={cartData} />;
}
