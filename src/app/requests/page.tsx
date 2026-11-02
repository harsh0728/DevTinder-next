"use client";

import { apiFetch, apiFetchPaginated } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addRequests, removeRequest } from "@/store/slices/requestSlice";
import { PaginatedResponse } from "@/lib/api";
import { ConnectionRequestState } from "@/types/request";
import { Check, Loader, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";

export default function RequestsPage() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [requests, setRequests] = useState<ConnectionRequestState[]>([]);
  const dispatch = useAppDispatch();

  const fetchRequests = useCallback(async (cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await apiFetchPaginated<ConnectionRequestState>(
        "/user/request/received",
        cursor,
        20
      );
      if (res.success && res.data) {
        if (cursor) {
          setRequests((prev: ConnectionRequestState[]) => [...prev, ...res.data]);
        } else {
          dispatch(addRequests(res.data));
          setRequests(res.data);
        }

        if (res.pagination) {
          setHasMore(res.pagination.hasMore);
          setNextCursor(res.pagination.nextCursor);
        }
      }
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [dispatch]);

  const loadMoreRequests = useCallback(() => {
    if (hasMore && !loadingMore && nextCursor) {
      fetchRequests(nextCursor);
    }
  }, [fetchRequests, hasMore, loadingMore, nextCursor]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ✅ plain params instead of a destructured object — matches source
  const handleReview = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      await apiFetch(`/request/review/${requestId}`, {
        method: "POST",
        body: JSON.stringify({ status }),
      });
      dispatch(removeRequest(requestId));
      setRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (error) {
      console.error("Failed to review request", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader className="animate-spin text-indigo-400" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-8">
        Connection Requests
      </h1>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No connection requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-500/40 transition duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex gap-4 flex-1">

                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden relative">
                    {req.fromUserId.photoUrl ? (
                      <>
                        <Image
                          src={req.fromUserId.photoUrl}
                          alt={req.fromUserId.firstName}
                          fill
                          sizes="64px"
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full flex items-center justify-center text-3xl" style={{display: 'none'}}>
                          👤
                        </div>
                      </>
                    ) : (
                      "👤"
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {req.fromUserId.firstName}
                    </h3>
                    {req.fromUserId.skills && req.fromUserId.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {req.fromUserId.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(req._id, "rejected")}
                  className="flex-1 px-4 py-2 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-medium transition duration-200 flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Reject
                </button>
                <button
                  onClick={() => handleReview(req._id, "accepted")}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600/50 to-cyan-600/50 border border-indigo-500/40 hover:from-indigo-500/70 hover:to-cyan-500/70 text-cyan-300 hover:text-cyan-200 font-medium transition duration-200 flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Accept
                </button>
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && !loadingMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMoreRequests}
                className="px-6 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-300 transition duration-200 font-medium"
              >
                Load More Requests
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