"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg("");

    const { data: signInData, error } = await signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setErrorMsg(error.message || "Invalid credentials");
      setIsSubmitting(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  // --- DEMO LOGIN BLOCK ---
  // You can easily remove this function and the button below when deploying to production
  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    const { error } = await signIn.email({
      email: "demo@yourshop.com",
      password: "Demo@123",
    });

    if (error) {
      setErrorMsg("Demo login failed: " + error.message);
      setIsSubmitting(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };
  // ------------------------

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-[#0A0F1E]">
      <div className="w-full max-w-md bg-[#1E293B] p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-200">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full bg-[#0A0F1E] border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="w-full bg-[#0A0F1E] border border-white/10 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Login"}
          </button>
        </form>

        {/* --- DEMO LOGIN BUTTON --- */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold py-3 rounded-xl flex items-center justify-center transition-all duration-200"
          >
            Use Demo Login
          </button>
        </div>
        {/* ------------------------- */}

        <p className="text-center text-sm text-gray-400 mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
