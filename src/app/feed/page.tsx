"use client";

import { apiFetch, apiFetchPaginated } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeUserFromFeed, setFeed } from "@/store/slices/feedSlice";
import { PaginatedResponse } from "@/lib/api";
import { FeedData } from "@/types/feed";
import { ConnectionRequestState } from "@/types/request";
import { Heart, Loader, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";

export default function FeedPage() {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const feed = useAppSelector((state) => state.feed);
  const dispatch = useAppDispatch();

  // For pagination, we'll use a local state that tracks all loaded profiles
  const [allFeedProfiles, setAllFeedProfiles] = useState<FeedData[]>([]);

  // Derived state - use Redux feed when available, otherwise local state
  // This avoids the need for a sync effect
  const effectiveFeed = useMemo(() => {
    return feed.length > 0 ? feed : allFeedProfiles;
  }, [feed, allFeedProfiles]);

  const fetchFeed = useCallback(async (cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await apiFetchPaginated<FeedData>("/feed", cursor, 10);
      if (res.success && res.data) {
        if (cursor) {
          // Append to existing feed for infinite scroll
          setAllFeedProfiles((prev: FeedData[]) => [...prev, ...res.data]);
        } else {
          // Replace feed for initial load
          dispatch(setFeed(res.data));
          setAllFeedProfiles(res.data);
          setCurrent(0);
        }

        if (res.pagination) {
          setHasMore(res.pagination.hasMore);
          setNextCursor(res.pagination.nextCursor);
        }
      }
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dispatch]);

  const loadMoreFeed = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      fetchFeed(nextCursor);
    }
  }, [fetchFeed, hasMore, loadingMore, nextCursor]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFeed();
  }, [fetchFeed]);

  // Auto-load more profiles when user reaches near the end (infinite scroll)
  useEffect(() => {
    if (hasMore && !loadingMore && nextCursor && current >= effectiveFeed.length - 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadMoreFeed();
    }
  }, [current, effectiveFeed.length, hasMore, loadingMore, nextCursor, loadMoreFeed]);

  const handleAction = async (status: "interested" | "ignored") => {
    // Prevent double submissions
    if (isProcessing || current >= effectiveFeed.length) return;

    const userId = effectiveFeed[current]._id;
    setIsProcessing(true);

    dispatch(removeUserFromFeed(userId));
    setAllFeedProfiles((prev) => prev.filter((user) => user._id !== userId));

    try {
      await apiFetch<PaginatedResponse<ConnectionRequestState>>(
        `/request/send/${userId}`,
        {
          method: "POST",
          body: JSON.stringify({ status }),
        }
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  if (effectiveFeed.length === 0 || current >= effectiveFeed.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-3xl font-bold text-slate-300">No more developers!</h2>
        <p className="text-slate-400">Come back later for more connections</p>
      </div>
    );
  }

  const dev = effectiveFeed[current];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">

        {/* Counter */}
        <div className="mb-4 text-center text-slate-400 text-sm font-medium">
          Profile {current + 1} of {effectiveFeed.length}
          {hasMore && <span className="text-indigo-400 ml-2">(+ more loading)</span>}
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
                sizes="100vw"
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl" style={{display: 'flex'}}>
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
            disabled={isProcessing}
            className="p-4 rounded-full bg-slate-800/50 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={32} />
          </button>
          <button
            onClick={() => handleAction("interested")}
            disabled={isProcessing}
            className="p-4 rounded-full bg-gradient-to-r from-indigo-600/50 to-cyan-600/50 border border-indigo-500/40 hover:from-indigo-500/70 hover:to-cyan-500/70 text-cyan-300 hover:text-cyan-200 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart size={32} />
          </button>
        </div>

        {/* Loading indicator when auto-loading more */}
        {loadingMore && (
          <div className="mt-8 flex justify-center">
            <Loader className="animate-spin text-indigo-400" size={24} />
            <span className="ml-2 text-sm text-slate-400">Loading more profiles...</span>
          </div>
        )}

        {/* End of feed message */}
        {!hasMore && effectiveFeed.length > 0 && current >= effectiveFeed.length - 1 && (
          <div className="mt-8 text-center text-slate-400 text-sm">
            You&apos;ve seen all available profiles!
          </div>
        )}

      </div>
    </div>
  );
}