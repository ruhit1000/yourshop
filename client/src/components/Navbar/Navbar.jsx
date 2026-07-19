"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { ShoppingCart, Menu, X, User, ChevronDown, Package, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Mock cart items count for now
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
  ];

  if (user) {
    navLinks.push({ href: "/orders", label: "Orders" });
    navLinks.push({ href: "/chat", label: "Chat" });
  }

  const handleLogout = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "glass py-3 shadow-lg shadow-black/20"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            <span className="text-white">Your</span>
            <span className="gradient-text">Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors relative ${
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 border-b-2 border-blue-500 pointer-events-none"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Cart Button */}
            {user && (
              <Link
                href="/cart"
                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <ShoppingCart size={22} />
                <AnimatePresence>
                  {cartItemsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-0 right-0 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0A0F1E]"
                    >
                      {cartItemsCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}

            {/* Auth / User Menu */}
            <div className="hidden md:block">
              {!user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-300 hover:text-white px-3"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full transition-colors"
                  >
                    <User size={16} />
                    <span>{user.name?.split(" ")[0]}</span>
                    <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 glass rounded-2xl shadow-xl overflow-hidden border border-white/10"
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <div className="p-2">
                          <Link href="/orders" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Package size={16} /> My Orders
                          </Link>
                          {user.role === "admin" && (
                            <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-colors" onClick={() => setUserMenuOpen(false)}>
                              <Settings size={16} /> Admin Dashboard
                            </Link>
                          )}
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1">
                            <LogOut size={16} /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[80%] max-w-sm h-full bg-[#0A0F1E] border-l border-white/10 z-[70] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <span className="text-xl font-bold text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <div className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium px-4 py-3 rounded-xl transition-colors ${
                        pathname === link.href
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium px-4 py-3 rounded-xl transition-colors text-blue-400 hover:bg-white/5"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-white/10">
                {!user ? (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 text-center rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 text-center rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-3 text-center rounded-xl font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
