"use client";

import { apiFetch, apiFetchPaginated } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addConnection } from "@/store/slices/connectionSlice";
import { PaginatedResponse } from "@/lib/api";
import { FeedData } from "@/types/feed";
import { Loader, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";

export default function ConnectionsPage() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [connections, setConnections] = useState<FeedData[]>([]);
  const dispatch = useAppDispatch();

  const fetchConnections = useCallback(async (cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await apiFetchPaginated<FeedData>("/user/connections", cursor, 20);
      if (res.success && res.data) {
        if (cursor) {
          setConnections((prev: FeedData[]) => [...prev, ...res.data]);
        } else {
          dispatch(addConnection(res.data));
          setConnections(res.data);
        }

        if (res.pagination) {
          setHasMore(res.pagination.hasMore);
          setNextCursor(res.pagination.nextCursor);
        }
      }
    } catch {
      console.error("Failed to load connections");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dispatch]);

  const loadMoreConnections = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      fetchConnections(nextCursor);
    }
  }, [fetchConnections, hasMore, loadingMore, nextCursor]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConnections();
  }, [fetchConnections]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
          Your Connections
        </h1>
        <p className="text-slate-400">
          {connections.length} developer{connections.length !== 1 ? "s" : ""} connected
        </p>
      </div>

      {connections.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No connections yet. Start swiping to connect!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((conn) => (
              <div
                key={conn._id}
                className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-xl overflow-hidden hover:border-indigo-500/40 transition duration-200 group cursor-pointer"
              >
                {/* Photo */}
                <div className="h-40 bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-6xl overflow-hidden relative">
                  {conn.photoUrl ? (
                    <>
                      <Image
                        src={conn.photoUrl}
                        alt={conn.firstName}
                        fill
                        sizes="100%"
                        className="object-cover group-hover:scale-110 transition duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-6xl" style={{display: 'none'}}>
                        👤
                      </div>
                    </>
                  ) : (
                    "👤"
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-3">{conn.firstName}</h3>

                  {/* Skills */}
                  {conn.skills && conn.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {conn.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {conn.skills.length > 3 && (
                        <span className="px-2 py-1 rounded-full bg-slate-700/50 text-slate-400 text-xs font-medium">
                          +{conn.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* About */}
                  {conn.about && (
                    <div className="text-white py-2">{conn.about}</div>
                  )}

                  {/* Chat button */}
                  <Link href={`/chat/${conn._id}`}>
                    <button className="w-full mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600/50 to-cyan-600/50 border border-indigo-500/40 hover:from-indigo-500/70 hover:to-cyan-500/70 text-cyan-300 hover:text-cyan-200 font-medium transition duration-200 flex items-center justify-center gap-2">
                      Chat
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && !loadingMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMoreConnections}
                className="px-6 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 transition duration-200 font-medium"
              >
                Load More Connections
              </button>
            </div>
          )}

          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader className="animate-spin text-indigo-400" size={24} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}