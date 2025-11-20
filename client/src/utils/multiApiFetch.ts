// Wrapper to call multi-api endpoints with timeout & graceful fallback
import { apiFetch } from "./api-config";
import type { MediaItem } from "./formatApiItem";

export interface MultiApiResult<T = any> {
  ok: boolean;
  status: number;
  body?: T;
  error?: string;
}

/**
 * Fetches from multi-api endpoints with timeout and error handling
 * @param path - Path after /api/multi-api (e.g., '/discover', '/availability')
 * @param opts - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default 10s)
 */
export async function multiApiFetch<T = any>(
  path: string, 
  opts: RequestInit = {}, 
  timeoutMs = 10_000
): Promise<MultiApiResult<T>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const res = await apiFetch(`/api/multi-api${path}`, { 
      ...opts, 
      signal: controller.signal 
    });
    
    clearTimeout(id);
    
    const status = res.status || (res as any).statusCode || 0;
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status, error: text || `HTTP ${status}` };
    }
    
    const body = await res.json().catch(() => null);
    return { ok: true, status, body };
    
  } catch (err: any) {
    clearTimeout(id);
    return { 
      ok: false, 
      status: 0, 
      error: err?.message ?? 'network error' 
    };
  }
}
