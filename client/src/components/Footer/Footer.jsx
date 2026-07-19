import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { IoLogoFacebook, IoLogoTwitter } from "react-icons/io5";
import { AiFillInstagram } from "react-icons/ai";
import { FaYoutube } from "react-icons/fa";


export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0F1E] border-t-2 border-blue-600/50 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Socials */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold tracking-tighter inline-block mb-4">
              <span className="text-white">Your</span>
              <span className="gradient-text">Shop</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Discover the latest and greatest in premium electronics. We bring you cutting-edge technology with unbeatable customer support and exclusive deals.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-white/10 transition-colors">
                <IoLogoFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-colors">
                <IoLogoTwitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-pink-500 hover:bg-white/10 transition-colors">
                <AiFillInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white/10 transition-colors">
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Shop</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/shop" className="hover:text-blue-400 transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=Laptops" className="hover:text-blue-400 transition-colors">Laptops</Link></li>
              <li><Link href="/shop?category=Smartphones" className="hover:text-blue-400 transition-colors">Smartphones</Link></li>
              <li><Link href="/shop?category=Audio" className="hover:text-blue-400 transition-colors">Audio</Link></li>
              <li><Link href="/shop?category=Accessories" className="hover:text-blue-400 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <span>123 Tech Boulevard,<br />Silicon Valley, CA 94025</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <a href="mailto:support@yourshop.com" className="hover:text-blue-400 transition-colors">support@yourshop.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} YourShop Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/shipping" className="hover:text-gray-300 transition-colors">Shipping Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
