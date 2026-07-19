export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { Suspense } from "react";
import ImageGallery from "@/components/Product/ImageGallery";
import ProductInfo from "@/components/Product/ProductInfo";
import AddToCartSection from "@/components/Product/AddToCartSection";
import ProductDescription from "@/components/Product/ProductDescription";
import SpecificationsTable from "@/components/Product/SpecificationsTable";
import ReviewsSection from "@/components/Product/ReviewsSection";
import RelatedProducts from "@/components/Product/RelatedProducts";
import { getProduct } from "@/lib/api/products";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    if (!product) return { title: "Product Not Found" };
    return {
      title: `${product.name} | YourShop`,
      description: product.description || `Buy ${product.name} at YourShop.`,
    };
  } catch (error) {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  
  let product = null;
  try {
    product = await getProduct(slug);
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-[#0A0F1E] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Top Section: Images & Info */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 mb-20">
          <div className="w-full lg:w-1/2">
            <ImageGallery 
              images={product.images?.length > 0 ? product.images : [
                product.imageUrl,
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
              ].filter(Boolean)} 
              imageUrl={product.imageUrl} 
              alt={product.name} 
            />
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <ProductInfo product={product} />
            <AddToCartSection product={product} />
          </div>
        </div>

        {/* Middle Section: Description & Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-20">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-6">Product Description</h3>
            <ProductDescription description={product.description} />
          </div>
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-6">Specifications</h3>
            <SpecificationsTable product={product} />
          </div>
        </div>

        {/* Bottom Section: Reviews */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-white mb-8">Customer Reviews</h3>
          <ReviewsSection />
        </div>

        {/* Related Products */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-white">Loading related products...</div>}>
          <RelatedProducts category={product.category} currentProductId={product._id} />
        </Suspense>

      </div>
    </div>
  );
}
