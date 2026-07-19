"use client";

import { useEffect, useState } from "react";
import { getAdminOrders } from "@/lib/api/orders";
import { updateOrderStatus } from "@/lib/actions/orders";
import { Search, MoreVertical, Edit } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const data = await getAdminOrders(page);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch admin orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editingOrder || !newStatus) return;
    
    setIsUpdating(true);
    try {
      await updateOrderStatus(editingOrder._id, newStatus);
      setOrders(orders.map(o => o._id === editingOrder._id ? { ...o, status: newStatus } : o));
      setEditingOrder(null);
    } catch (error) {
      alert("Failed to update status: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (o.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.customer?.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-zinc-400 mt-1">Manage and track customer orders.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium font-mono text-zinc-400">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{order.customer?.name || "Unknown User"}</p>
                        <p className="text-xs text-zinc-500">{order.customer?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(order.totalCents)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 
                          order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500' : 
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 
                          'bg-amber-500/10 text-amber-500'}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setEditingOrder(order);
                          setNewStatus(order.status);
                        }}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Status Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Order: <span className="font-mono text-zinc-300">{editingOrder._id}</span>
            </p>
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
