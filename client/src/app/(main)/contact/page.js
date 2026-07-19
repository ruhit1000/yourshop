"use client";

import { useState } from "react";
import { Mail, Phone, Clock, Send, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) tempErrors.subject = "Subject is required.";
    if (!formData.message.trim()) {
      tempErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      tempErrors.message = "Message must be at least 10 characters long.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    try {
      // Simulate API submit delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-semibold tracking-widest text-blue-500 uppercase">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            We'd Love to <span className="gradient-text">Hear From You</span>
          </h1>
          <p className="text-gray-400">
            Have a question about our products, an existing order, or just want to send feedback? Send us a message and our support team will respond within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card */}
          <div className="md:col-span-5 space-y-6">
            <div className="glass border border-white/10 p-8 rounded-3xl space-y-8">
              <h2 className="text-xl font-bold text-white">Contact Info</h2>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email Us</h3>
                  <p className="text-sm text-gray-400 mt-1">support@yourshop.com</p>
                  <p className="text-xs text-gray-500 mt-0.5">Replies within 1 business day</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Call Us</h3>
                  <p className="text-sm text-gray-400 mt-1">+1 (800) 555-0199</p>
                  <p className="text-xs text-gray-500 mt-0.5">Mon-Fri • 9:00 AM - 6:00 PM EST</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Hours</h3>
                  <p className="text-sm text-gray-400 mt-1">Online Support: 24/7</p>
                  <p className="text-xs text-gray-500 mt-0.5">Warehouse pickups: Mon-Sat</p>
                </div>
              </div>
            </div>

            {/* Stylized SVG Map Illustration */}
            <div className="glass border border-white/10 p-6 rounded-3xl h-64 relative overflow-hidden flex flex-col justify-between">
              <div className="z-10">
                <h3 className="font-bold text-white">Global Headquarters</h3>
                <p className="text-xs text-gray-400 mt-1">100 Tech Venture Pkwy, Suite 400<br />Boston, MA 02110</p>
              </div>

              {/* Decorative SVG grid representation */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <circle cx="150" cy="120" r="10" fill="#3B82F6" className="animate-ping" />
                  <circle cx="150" cy="120" r="6" fill="#3B82F6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7">
            <div className="glass border border-white/10 p-8 rounded-3xl">
              {status === "success" ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Message Sent!</h2>
                  <p className="text-gray-400 max-w-sm mx-auto">
                    Thank you for contacting us. We have received your inquiry and will respond as soon as possible.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-6 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-full transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="text-xl font-bold text-white mb-4">Send a Message</h2>
                  
                  {status === "error" && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                      <AlertTriangle size={18} />
                      <span>An error occurred. Please try again.</span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-300">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-[#111827]/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.name ? "border-red-500" : "border-white/10 focus:border-blue-500"
                        }`}
                        placeholder="Your Name"
                      />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full bg-[#111827]/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.email ? "border-red-500" : "border-white/10 focus:border-blue-500"
                        }`}
                        placeholder="you@example.com"
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-300">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full bg-[#111827]/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.subject ? "border-red-500" : "border-white/10 focus:border-blue-500"
                      }`}
                      placeholder="Subject of message"
                    />
                    {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-300">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className={`w-full bg-[#111827]/50 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                        errors.message ? "border-red-500" : "border-white/10 focus:border-blue-500"
                      }`}
                      placeholder="Type your message here..."
                    />
                    {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                  >
                    {status === "loading" ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
