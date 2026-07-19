import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-gray-300 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
            <p className="text-sm text-gray-500 mt-1">Last Updated: July 19, 2026</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-400">
          <p>
            Welcome to YourShop. By accessing or using our website, services, or purchasing products from us, you agree to comply with and be bound by the following Terms of Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
          <p>
            These Terms govern your use of the YourShop platform. If you do not agree to all terms, you must not access or use our services. We reserve the right to modify these Terms at any time, and your continued use of the platform constitutes acceptance of those changes.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. User Account and Security</h2>
          <p>
            To purchase products or access certain features (such as our AI assistant), you must register an account. You are responsible for:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Providing accurate, current, and complete registration information.</li>
            <li>Maintaining the confidentiality of your account credentials.</li>
            <li>All activities that occur under your account. Notify us immediately of any unauthorized access.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Purchases and Payments</h2>
          <p>
            All prices are quoted in USD. We reserve the right to change prices or modify product details at any time. 
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Payments are processed securely via Stripe.</li>
            <li>By providing payment details, you authorize us to charge the specified amount for your order.</li>
            <li>We reserve the right to cancel or refuse any order for reasons including inventory limitations, price inaccuracies, or suspected fraud.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Prohibited Activities</h2>
          <p>
            You agree not to use the YourShop platform to:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Violate any local, national, or international regulations.</li>
            <li>Infringe upon our intellectual property rights or those of others.</li>
            <li>Distribute harmful software, malware, or engage in denial of service attacks.</li>
            <li>Attempt unauthorized access to other accounts, servers, or databases connected to YourShop.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">5. Intellectual Property</h2>
          <p>
            All content on the platform, including text, graphics, logos, images, code, and design, is the property of YourShop Inc. and is protected by copyright, trademark, and other intellectual property laws.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Limitation of Liability</h2>
          <p>
            YourShop is provided on an "as-is" and "as-available" basis. To the maximum extent permitted by law, YourShop Inc. shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use or inability to use our services or products.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. Any legal actions must be filed in the courts located in Santa Clara County, California.
          </p>
        </div>
      </div>
    </div>
  );
}
