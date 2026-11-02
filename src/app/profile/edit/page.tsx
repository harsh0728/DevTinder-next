"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addUser } from "@/store/slices/userSlice";
import { apiFetch } from "@/lib/api";
import { ApiResponse } from "@/types/api-types";
import { User } from "@/types/user";

interface EditForm {
  about: string;
  skills: string;
}

export default function EditProfilePage() {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<EditForm>({
    about: user?.about ?? "",
    skills: user?.skills?.join(", ") ?? "",
  });

  // sync form if user loads after mount (e.g. AuthProvider delay)
  useEffect(() => {
    if (user) {
      setForm({
        about: user.about ?? "",
        skills: user.skills?.join(", ") ?? "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<ApiResponse<User>>("/profile/edit", {
        method: "PATCH",
        body: JSON.stringify({
          about: form.about,
          skills: form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      if (res.success && res.data) {
        dispatch(addUser(res.data));
        router.push("/profile");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="p-2 hover:bg-indigo-500/20 rounded-lg transition"
          >
            <ChevronLeft size={24} className="text-slate-300" />
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Edit Profile
          </h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* About */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              About
            </label>
            <textarea
              name="about"
              placeholder="Tell us about yourself..."
              value={form.about}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-indigo-500/20 focus:border-indigo-500/60 focus:outline-none text-white placeholder-slate-500 transition resize-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Skills (comma separated)
            </label>
            <input
              type="text"
              name="skills"
              placeholder="React, Node.js, MongoDB, Python"
              value={form.skills}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-indigo-500/20 focus:border-indigo-500/60 focus:outline-none text-white placeholder-slate-500 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="flex-1 px-6 py-3 rounded-lg border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-medium transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}