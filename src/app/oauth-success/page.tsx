"use client"

import { apiFetch } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { addUser } from "@/store/slices/userSlice";
import { ApiResponse } from "@/types/api-types";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OAuthSuccess() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const res = await apiFetch<ApiResponse<User>>("/profile/view");
    if (res.success && res.data) {
      dispatch(addUser(res.data));
      router.push("/feed");
    }
  };

  return <div className="text-white">Logging you in...</div>;
}