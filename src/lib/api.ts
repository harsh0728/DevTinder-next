const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    nextCursor: string | null;
    hasMore: boolean;
    count: number;
  };
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Generic API fetch function with proper error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

/**
 * Fetch paginated data with cursor-based pagination
 */
export async function apiFetchPaginated<T>(
  endpoint: string,
  cursor?: string,
  limit?: number
): Promise<PaginatedResponse<T>> {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());

  const url = `${endpoint}${params.toString() ? `?${params.toString()}` : ""}`;
  return apiFetch<PaginatedResponse<T>>(url);
}