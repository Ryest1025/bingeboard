import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_CONFIG } from "./config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Build full URL from relative path
  const fullUrl = url.startsWith('http') ? url : API_CONFIG.getApiUrl(url);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T>({ on401 }: { on401: UnauthorizedBehavior }): QueryFunction<T | null> => {
  return async ({ queryKey }) => {
    return new Promise<T | null>((resolve) => {
      // Build full URL from relative path
      const endpoint = queryKey[0] as string;
      const fullUrl = endpoint.startsWith('http') ? endpoint : API_CONFIG.getApiUrl(endpoint);
      
      console.log("🔍 Querying:", fullUrl);
      
      fetch(fullUrl, {
        credentials: "include",
      })
      .then(async (res) => {
        // Handle 401 responses
        if (on401 === "returnNull" && res.status === 401) {
          console.log("✅ 401 handled, returning null");
          resolve(null as unknown as T);
          return;
        }

        // Handle other HTTP errors
        if (!res.ok) {
          const text = (await res.text()) || res.statusText;
          if (on401 === "returnNull") {
            console.log("✅ HTTP error handled, returning null:", res.status, text);
            resolve(null as unknown as T);
            return;
          }
          // For throw behavior, still resolve to prevent unhandled rejection
          resolve(null as unknown as T);
          return;
        }

        // Success case
        try {
          const data = await res.json();
          resolve(data);
        } catch (jsonError) {
          const err = jsonError as Error;
          console.log("✅ JSON parse error handled, returning null:", err.message);
          resolve(null as unknown as T);
        }
      })
      .catch((networkError) => {
        // Handle network errors (CORS, connection issues, etc.)
        const err = networkError as Error;
        console.log("✅ Network error handled, returning null:", err.message);
        resolve(null as unknown as T);
      });
    });
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      // Prevent unhandled promise rejections
  throwOnError: false,
    },
    mutations: {
      retry: false,
  throwOnError: false,
    },
  },
});
