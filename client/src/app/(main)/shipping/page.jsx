import Link from "next/link";
import { Truck, ArrowLeft } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-gray-300 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Shipping Policy</h1>
            <p className="text-sm text-gray-500 mt-1">Last Updated: July 19, 2026</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-400">
          <p>
            Thank you for shopping at YourShop. Below are the terms and conditions that constitute our Shipping Policy.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Shipping Processing Time</h2>
          <p>
            All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.
          </p>
          <p>
            If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there is a significant delay in shipment of your order, we will contact you via email.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Shipping Rates & Delivery Estimates</h2>
          <p>
            Shipping charges for your order will be calculated and displayed at checkout. We offer the following shipping methods:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Standard Shipping (3-5 business days): **Free** on all orders.</li>
            <li>Expedited Shipping (2 business days): **$9.99 USD**.</li>
            <li>Overnight Shipping (1 business day): **$24.99 USD** (Orders must be placed before 1:00 PM PST).</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Shipment Confirmation & Order Tracking</h2>
          <p>
            You will receive a Shipment Confirmation email containing your tracking number(s) once your order has shipped. The tracking number will be active within 24 hours. You can view your order progress in your **Orders** history page in your profile.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Customs, Duties, and Taxes</h2>
          <p>
            YourShop is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Damages</h2>
          <p>
            YourShop is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Returns & Exchanges</h2>
          <p>
            Our Return & Refund Policy provides detailed information about options and procedures for returning your order. We offer a 30-day money-back guarantee for all products returned in original condition.
          </p>
        </div>
      </div>
    </div>
  );
}
