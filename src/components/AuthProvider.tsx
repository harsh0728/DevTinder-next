"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addUser } from "@/store/slices/userSlice";
import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api-types";
import { User } from "@/types/user";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    if (user) return; // already in Redux, skip

    const fetchUser = async () => {
      try {
        const res = await apiFetch<ApiResponse<User>>("/profile/view");
        if (res.success && res.data) {
          dispatch(addUser(res.data));
        }
      } catch {
        // not logged in — stay as null, NavbarWrapper hides Navbar
      }
    };

    fetchUser();
  }, []);

  return <>{children}</>;
}