import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-gray-300 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-8 text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mt-1">Last Updated: July 19, 2026</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-400">
          <p>
            At YourShop, we prioritize the protection and confidentiality of your personal information. This Privacy Policy details how we collect, use, store, and safeguard your data when you interact with our platform.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when registering an account, placing an order, subscribing to our newsletter, or contacting support. This may include:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Personal details: Name, email address, physical shipping address, phone number.</li>
            <li>Payment data: Processed securely through our payment provider (Stripe). We do not store raw card credentials.</li>
            <li>Technical data: IP address, browser type, device information, and interaction history.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
          <p>
            Your information helps us enhance your experience. We use it to:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Process and fulfill orders, including shipping and order tracking.</li>
            <li>Maintain, personalize, and protect your user profile.</li>
            <li>Communicate updates, promotional materials, or technical notices.</li>
            <li>Understand site usage to continuously improve our platform.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Sharing of Information</h2>
          <p>
            We do not sell or lease your personal information to third parties. We share data only with trusted service providers essential for our operations, such as:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Payment processors (Stripe) for secure billing transactions.</li>
            <li>Logistics partners for product shipping and deliveries.</li>
            <li>Compliance authorities where required to uphold laws or protect user safety.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Security</h2>
          <p>
            We implement comprehensive technical and organizational security protocols to protect your personal data from unauthorized access, modification, or exposure. Your session data is protected via secure server tokens.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Cookies and Tracking</h2>
          <p>
            We use cookies to maintain your active cart, persist user authentication sessions, and compile statistical web analytics. You can adjust your browser configuration to decline cookies, though some capabilities may not function optimally.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you have the right to request access to, correct, or delete the personal information we hold about you. For any inquiries regarding your data, please contact our support team at <a href="mailto:support@yourshop.com" className="text-blue-400 hover:underline">support@yourshop.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
