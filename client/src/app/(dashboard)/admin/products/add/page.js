"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/actions/products";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      brand: "",
      price: "",
      stock: "",
      tags: "",
      imageUrl: ""
    }
  });

  const onSubmit = async (data) => {
    setError("");
    try {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category.toLowerCase(),
        brand: data.brand,
        priceCents: Math.round(parseFloat(data.price) * 100),
        stock: parseInt(data.stock, 10),
        tags: data.tags.split(",").map(t => t.trim()).filter(Boolean),
        imageUrl: data.imageUrl
      };
      
      await createProduct(payload);
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create product");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/products" 
          className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-zinc-400 mt-1">Create a new product listing in your catalog.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Product Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Wireless Noise-Canceling Headphones"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Description</label>
              <textarea
                {...register("description", { required: "Description is required" })}
                rows={4}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Detailed description of the product..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Category</label>
                <select
                  {...register("category", { required: "Category is required" })}
                  className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books</option>
                  <option value="home">Home & Kitchen</option>
                  <option value="sports">Sports</option>
                  <option value="beauty">Beauty</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Brand</label>
                <input
                  {...register("brand", { required: "Brand is required" })}
                  className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Sony"
                />
                {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { required: "Price is required", min: 0 })}
                  className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="99.99"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  {...register("stock", { required: "Stock is required", min: 0 })}
                  className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="100"
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Image URL</label>
              <input
                {...register("imageUrl", { required: "Image URL is required" })}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://example.com/image.jpg"
              />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Tags (Comma-separated)</label>
              <input
                {...register("tags")}
                className="w-full bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="wireless, audio, headphones"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
            <Link 
              href="/admin/products"
              className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
