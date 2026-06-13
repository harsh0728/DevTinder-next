"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    router.replace(user ? "/feed" : "/login");
  }, [user, router]);
  
  return (
    <div className="bg-navy-950 min-h-screen bg-linear-to-br from-slate-950 via-indigo-950 to-slate-950">
      {user && <Navbar />}

    <div className="max-w-6xl mx-auto px-4 py-6">
      Redirecting...
    </div>
    </div>
  );
}