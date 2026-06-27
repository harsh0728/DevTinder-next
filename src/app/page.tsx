"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { redirect, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);

  if (user){
    redirect("/feed")
  }
  else redirect("/login")
  // useEffect(() => {
  //   router.replace(user ? "/feed" : "/login");
  // }, [user, router]);
  
  return (
   <div className="text-slate-400 text-center mt-20">Redirecting...</div>
  );
}