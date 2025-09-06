// Frontend debug utility to force sparse arrays for fallback testing.
// Query param formats supported (dev only):
//   ?debugSparse=1            -> force primary only
//   ?debugSparse=primary      -> force primary only
//   ?debugSparse=primary,tv   -> force primary & tv
//   ?debugSparse=all          -> force all stages (primary, tv, trending)
//   ?debugSparse=tv           -> force tv only (after primary fetch)
//   ?debugSparse=trending     -> force trending fallback list sparse

declare global {
  interface Window {
    __bbDebugLevel?: 0 | 1 | 2; // 0=off 1=badge 2=expanded
  __bbDebugPersist?: boolean; // persist logs in sessionStorage
  }
}

function getDebugSparseModes(): Set<string> {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return new Set();
  const params = new URLSearchParams(window.location.search);
  const val = params.get('debugSparse');
  if (!val) return new Set();
  if (val === '1') return new Set(['primary']);
  return new Set(val.split(',').map(v => v.trim().toLowerCase()).filter(Boolean));
}

const sparseModes = () => getDebugSparseModes();

export function forceSparse<T>(arr: T[], stage: 'primary' | 'tv' | 'trending'): T[] {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return arr;
  const modes = sparseModes();
  if (!modes.size) return arr;
  if (modes.has('all') || modes.has(stage)) {
    // eslint-disable-next-line no-console
    console.debug(`[debugSparse] forcing empty array for stage: ${stage}`);
    return [];
  }
  return arr;
}

// Helper to check if debug badge/panel should render
export function getDebugLevel(): 0 | 1 | 2 {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return 0;
  // Priority: global override (hotkey) > query param
  if (typeof window.__bbDebugLevel === 'number') return window.__bbDebugLevel;
  const params = new URLSearchParams(window.location.search);
  const sd = params.get('showDebug');
  if (sd === '2') return 2;
  if (sd === '1') return 1;
  return 0;
}

export function setDebugLevel(level: 0 | 1 | 2) {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  window.__bbDebugLevel = level;
  // Mutate URL without reload for visibility
  const url = new URL(window.location.href);
  if (level === 0) url.searchParams.delete('showDebug');
  else url.searchParams.set('showDebug', String(level));
  window.history.replaceState({}, '', url.toString());
}

export function isDebugEnabled(): boolean {
  return getDebugLevel() > 0;
}

export function isExpandedDebug(): boolean {
  return getDebugLevel() === 2;
}

// Cycle through levels via hotkey
export function cycleDebugLevel() {
  const next = (getDebugLevel() + 1) % 3 as 0 | 1 | 2;
  setDebugLevel(next);
  // eslint-disable-next-line no-console
  console.debug('[debug] set debug level ->', next);
}

// Simple telemetry stub (dev only) you can extend later
export function recordDebugEvent(event: string, data?: Record<string, any>) {
  if (process.env.NODE_ENV !== 'development') return;
  const ts = Date.now();
  const entry = { ts, event, ...(data || {}) };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_ENTRIES) logBuffer.shift();
  if (typeof window !== 'undefined' && window.__bbDebugPersist) {
    try {
      sessionStorage.setItem(LOG_KEY, JSON.stringify(logBuffer));
    } catch { /* ignore */ }
  }
  // eslint-disable-next-line no-console
  console.debug('[debugEvent]', event, data || {});
  if (typeof window !== 'undefined') {
    try { window.dispatchEvent(new CustomEvent('debug-log', { detail: entry })); } catch { /* ignore */ }
  }
}

// ===== Logging subsystem =====
interface DebugLogEntry { ts: number; event: string; [k: string]: any }
const LOG_KEY = '__bbDebugLog';
const MAX_LOG_ENTRIES = 500; // rotated cap to protect memory/render perf
let logBuffer: DebugLogEntry[] = [];

// Initialize from sessionStorage if persistence flag present
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    if (window.__bbDebugPersist) {
      const raw = sessionStorage.getItem(LOG_KEY);
      if (raw) logBuffer = JSON.parse(raw) as DebugLogEntry[];
    }
  } catch { /* ignore */ }
}

export function getDebugLogs(): DebugLogEntry[] {
  return [...logBuffer];
}

export function clearDebugLogs() {
  logBuffer = [];
  if (typeof window !== 'undefined') {
    try { sessionStorage.removeItem(LOG_KEY); } catch { }
  }
}

export function setLogPersistence(persist: boolean) {
  if (typeof window === 'undefined') return;
  window.__bbDebugPersist = persist;
  if (persist) {
    try { sessionStorage.setItem(LOG_KEY, JSON.stringify(logBuffer)); } catch { }
  } else {
    try { sessionStorage.removeItem(LOG_KEY); } catch { }
  }
}

export function isLogPersistenceEnabled(): boolean {
  return typeof window !== 'undefined' && !!window.__bbDebugPersist;
}
