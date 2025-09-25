// Centralized fetch wrapper with JSON + error handling
// Automatically includes credentials for session-based auth

export interface ApiError extends Error {
  status: number;
  payload?: any;
}

async function parseJSON(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await parseJSON(res);

  if (!res.ok) {
    const err: ApiError = Object.assign(new Error(`API ${res.status}: ${res.statusText}`), {
      status: res.status,
      payload: data
    });
    throw err;
  }
  return data as T;
}

export function buildQuery(params: Record<string, any | undefined | null>): string {
  const entries = Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  const qs = new URLSearchParams();
  for (const [k, v] of entries) {
    qs.append(k, String(v));
  }
  return `?${qs.toString()}`;
}
