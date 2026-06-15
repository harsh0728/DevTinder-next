"use client";

import { useAppSelector } from "@/store/hooks";
import { Edit2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProfileField from "@/components/ProfileField";

export default function ProfilePage() {
  const user = useAppSelector((state) => state.user.user);
  const router = useRouter();

  if (!user) return <div className="text-center text-slate-300">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            My Profile
          </h1>
          <button
            onClick={() => router.push("/profile/edit")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 transition duration-200 font-medium"
          >
            <Edit2 size={18} />
            Edit
          </button>
        </div>

        <div className="space-y-6">

          {/* Photo */}
          <div className="w-full h-48 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center text-7xl overflow-hidden relative">
            {user.photoUrl ? (
              <Image
                src={user.photoUrl}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              "👤"
            )}
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="First Name" value={user.firstName} />
            <ProfileField label="Last Name" value={user.lastName ?? ""} />
            <ProfileField label="Email" value={user.email ?? ""} />
            <ProfileField label="Age" value={user.age?.toString() ?? ""} />
          </div>
          <ProfileField label="Gender" value={user.gender ?? ""} />
          <ProfileField label="About" value={user.about ?? "Not set"} />

          {/* Skills */}
          {user.skills && user.skills.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-400 mb-3 uppercase">Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-500/40 text-indigo-300 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}