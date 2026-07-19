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
        <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={async () => {
              setIsSubmitting(true);
              setErrorMsg("");
              const { error } = await signIn.social({ provider: "google" });
              if (error) {
                setErrorMsg("Google login failed: " + error.message);
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting}
            className="w-full bg-white text-slate-900 font-semibold py-3 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          
          <button
            type="button"
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
