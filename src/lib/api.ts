const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch <T>(endpoint:string, options:RequestInit = {}):Promise<T>  {

  console.log("API_BASE:", API_BASE);
  console.log("ENDPOINT:", endpoint);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include"
  });

  const data=await response.json();

  if (!response.ok){
    throw new Error(data.message || "Something went wrong")
  }

  return data;
};