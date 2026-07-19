"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/lib/api/products";
import { deleteProduct } from "@/lib/actions/products";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Search, Edit } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({ limit: 100 }); // fetch more for admin
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Failed to delete product: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-zinc-400 mt-1">Manage your store's inventory and catalog.</p>
        </div>
        <Link 
          href="/admin/products/add" 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Search products..."
              className="w-full bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-zinc-500">
                    No products found. Create one to get started.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLowStock = product.stock > 0 && product.stock < 5;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <tr 
                      key={product._id} 
                      className={`border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors
                        ${isOutOfStock ? "bg-red-500/5" : isLowStock ? "bg-amber-500/5" : ""}
                      `}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`relative h-12 w-12 rounded-lg overflow-hidden shrink-0 bg-zinc-800
                            ${isOutOfStock ? "ring-1 ring-red-500/50" : isLowStock ? "ring-1 ring-amber-500/50" : ""}
                          `}>
                            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-zinc-500 mt-0.5 max-w-[200px] truncate">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-zinc-400">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(product.priceCents)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                          ${isOutOfStock ? "bg-red-500/10 text-red-500" : 
                            isLowStock ? "bg-amber-500/10 text-amber-500" : 
                            "bg-emerald-500/10 text-emerald-500"}
                        `}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            disabled={deletingId === product._id}
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
