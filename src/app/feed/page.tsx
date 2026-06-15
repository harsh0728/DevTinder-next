"use client";

import { apiFetch } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeUserFromFeed, setFeed } from "@/store/slices/feedSlice";
import { ApiResponse } from "@/types/api-types";
import { FeedData } from "@/types/feed";
import { ConnectionRequestState } from "@/types/request";
import { Heart, Loader, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function FeedPage() {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const feed = useAppSelector((state) => state.feed);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    if (feed.length > 0) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch<ApiResponse<FeedData[]>>("/feed");
      if (res.success && res.data) {
        dispatch(setFeed(res.data));
        setCurrent(0);
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (status: "interested" | "ignored") => {
    if (current >= feed.length) return;
    const userId = feed[current]._id;

    dispatch(removeUserFromFeed(userId));
    try {
      await apiFetch<ApiResponse<ConnectionRequestState>>(
        `/request/send/${userId}`,
        {
          method: "POST",
          body: JSON.stringify({ status }),
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  if (feed.length === 0 || current >= feed.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold text-slate-300">No more developers!</h2>
        <p className="text-slate-400">Come back later for more connections</p>
      </div>
    );
  }

  const dev = feed[current];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">

        {/* Counter */}
        <div className="mb-4 text-center text-slate-400 text-sm font-medium">
          Profile {current + 1} of {feed.length}
        </div>

        {/* Card */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl">

          {/* Photo */}
          <div className="h-96 bg-gradient-to-br from-indigo-600 to-cyan-600 relative overflow-hidden">
            {dev.photoUrl ? (
              <Image
                src={dev.photoUrl}
                alt={dev.firstName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                👤
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-4xl font-bold text-white">{dev.firstName}</h2>
              <p className="text-cyan-200 font-medium">{dev.about || "Developer"}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="p-6 space-y-4">
            {dev.skills && dev.skills.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-400 mb-3">SKILLS</p>
                <div className="flex flex-wrap gap-2">
                  {dev.skills.map((skill) => (
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

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => handleAction("ignored")}
            className="p-4 rounded-full bg-slate-800/50 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition duration-200"
          >
            <X size={32} />
          </button>
          <button
            onClick={() => handleAction("interested")}
            className="p-4 rounded-full bg-gradient-to-r from-indigo-600/50 to-cyan-600/50 border border-indigo-500/40 hover:from-indigo-500/70 hover:to-cyan-500/70 text-cyan-300 hover:text-cyan-200 transition duration-200"
          >
            <Heart size={32} />
          </button>
        </div>

      </div>
    </div>
  );
}