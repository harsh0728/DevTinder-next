"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AlertCircle, Eye, EyeOff, Loader } from "lucide-react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { addUser } from "@/store/slices/userSlice";
import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api-types";
import { User } from "@/types/user";
import GoogleLoginButton from "@/components/GoogleLoginButton";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<ApiResponse<User>>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.success && response.data) {
        dispatch(addUser(response.data));
        router.push("/feed");
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">
                DevTinder
              </span>
            </h1>
            <p className="text-slate-400">
              Connect with developers. Collaborate. Grow together.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${
                  errors.email
                    ? "border-red-500/60"
                    : "border-indigo-500/20 focus:border-indigo-500/60"
                } focus:outline-none text-white placeholder-slate-500`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${
                    errors.password
                      ? "border-red-500/60"
                      : "border-indigo-500/20 focus:border-indigo-500/60"
                  } focus:outline-none text-white placeholder-slate-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-slate-400 text-sm hover:text-indigo-400 transition"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 
              hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold 
              transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 
              transform hover:scale-[1.02]"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : "Login"}
            </button>
          </form>

              <GoogleLoginButton/>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900/50 text-slate-400">or</span>
            </div>
          </div>

          {/* Create Account */}
          <button
            onClick={() => router.push("/signup")}
            className="w-full py-3 rounded-lg border border-cyan-500/30 
            hover:border-cyan-500/60 text-cyan-400 font-semibold transition duration-200"
          >
            Create New Account
          </button>

        </div>
      </div>
    </div>
  );
}