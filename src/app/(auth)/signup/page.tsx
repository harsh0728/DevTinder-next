"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Eye, EyeOff, Loader, AlertCircle } from "lucide-react";

import { addUser } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/store/hooks";
import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api-types";
import { User } from "@/types/user";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gender: z.enum(["male", "female", "other"], {
    message: "Please select a gender" ,
  }),
  age: z.coerce.number().min(10, "Must be at least 10").max(100, "Invalid age"),
});

// ✅ Explicitly tell RHF what the INPUT type looks like (age is string from HTML)

type SignupFormInput={
  firstName:string;
  lastName:string;
  email:string;
  password:string;
  gender:"male" | "female" | "other";
  age:number | string;
}

// ✅ Output type (after Zod parses) — age is number
type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm,unknown,SignupForm>({
    resolver: zodResolver(signupSchema) as Resolver<SignupForm>,
  });

  const handleSignup = async (data: SignupForm) => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<ApiResponse<User>>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.success) {
        alert("Account created! Please login.");
        router.push("/login");
      } else {
        setError(response.message || "Signup failed");
      }
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="p-2 hover:bg-indigo-500/20 rounded-lg transition"
            >
              <ChevronLeft size={24} className="text-slate-300" />
            </button>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Create Account
            </h1>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">

            {/* First Name + Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${
                    errors.firstName
                      ? "border-red-500/60"
                      : "border-indigo-500/20 focus:border-indigo-500/60"
                  } focus:outline-none text-white placeholder-slate-500`}
                />
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${
                    errors.lastName
                      ? "border-red-500/60"
                      : "border-indigo-500/20 focus:border-indigo-500/60"
                  } focus:outline-none text-white placeholder-slate-500`}
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="25"
                  {...register("age",{ valueAsNumber: true })}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${
                    errors.age
                      ? "border-red-500/60"
                      : "border-indigo-500/20 focus:border-indigo-500/60"
                  } focus:outline-none text-white placeholder-slate-500`}
                />
                {errors.age && (
                  <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Gender
                </label>
                <select
                  {...register("gender")}
                  className={`w-full px-4 py-3 rounded-lg bg-slate-800/50 border transition ${
                    errors.gender
                      ? "border-red-500/60"
                      : "border-indigo-500/20 focus:border-indigo-500/60"
                  } focus:outline-none text-white`}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-400 text-xs mt-1">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 
              hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold 
              transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : "Create Account"}
            </button>

            {/* Login redirect */}
            <div className="text-center mt-4 text-slate-300">
              <span className="text-sm">Already have an account? </span>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-indigo-400 font-semibold hover:text-indigo-300 transition underline underline-offset-2"
              >
                Login
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}