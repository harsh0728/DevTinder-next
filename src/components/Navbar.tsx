"use client";

import { apiFetch } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeUser } from "@/store/slices/userSlice";
import { Home, Users, MessageCircle, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import NavButton from "./NavButton";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      dispatch(removeUser());
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/20">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => router.push("/feed")}
            className="flex items-center gap-2 text-2xl font-bold"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              💜
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              DevTinder
            </span>
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            <NavButton icon={Home} label="Feed" onClick={() => router.push("/feed")} />
            <NavButton icon={MessageCircle} label="Requests" onClick={() => router.push("/requests")} />
            <NavButton icon={Users} label="Connections" onClick={() => router.push("/connections")} />
            <NavButton icon={Users} label="Premium" onClick={() => router.push("/premium")} />
            <NavButton icon={User} label="Profile" onClick={() => router.push("/profile")} />
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition duration-200"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </div>
    </nav>
  );
}