import React, { useEffect, useState, useCallback } from 'react';
import { getDebugLevel, cycleDebugLevel, getDebugLogs, clearDebugLogs, setLogPersistence, isLogPersistenceEnabled } from '@/utils/debugSparse';

interface DebugLog { ts: number; event: string; [key: string]: any }

type SampleItem = Record<string, unknown>;

interface DebugRecBadgeProps {
  discoverCount: number;
  tvCount: number;
  trendingCount: number;
  source: string;
  discoverTime?: number;
  tvTime?: number;
  trendingTime?: number;
  renderedCount?: number; // actual items rendered in carousel/grid
  expanded?: boolean; // showDebug=2 for expanded panel
  rawPrimarySample?: SampleItem[]; // truncated raw data for primary
  rawTvSample?: SampleItem[];
  rawTrendingSample?: SampleItem[];
  requestUrls?: { primary?: string; tv?: string; trending?: string };
}

export default function DebugRecBadge({
  discoverCount,
  tvCount,
  trendingCount,
  source,
  discoverTime,
  tvTime,
  trendingTime,
  renderedCount,
  expanded,
  rawPrimarySample,
  rawTvSample,
  rawTrendingSample,
  requestUrls,
}: DebugRecBadgeProps) {
  const [enabled, setEnabled] = useState(false);
  const [level, setLevel] = useState<0|1|2>(0);
  const [showPayloads, setShowPayloads] = useState(true);
  const [activeTab, setActiveTab] = useState<'data' | 'logs'>('data');
  const [logs, setLogs] = useState<DebugLog[]>([]);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const lvl = getDebugLevel();
      setLevel(lvl);
      setEnabled(lvl > 0);
    }
  }, []);

  // Hotkey: Cmd/Ctrl + D cycles debug level (badge -> expanded -> off)
  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      cycleDebugLevel();
      const lvl = getDebugLevel();
      setLevel(lvl);
      setEnabled(lvl > 0);
    }
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  // Event-driven log updates
  useEffect(() => {
    if (!expanded) return;
    let pending = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const flush = () => {
      pending = false;
      if (activeTab === 'logs') setLogs(getDebugLogs());
    };
    const schedule = () => {
      if (pending) return; // batch multiple rapid events
      pending = true;
      timeout = setTimeout(flush, 50);
    };
    // initial load
    setLogs(getDebugLogs());
    const handler = () => schedule();
    window.addEventListener('debug-log', handler);
    return () => {
      window.removeEventListener('debug-log', handler);
      if (timeout) clearTimeout(timeout);
    };
  }, [expanded, activeTab]);

  if (!enabled) return null;

  const colorFor = (src: string) => {
    switch (src) {
      case 'primary': return 'text-green-400';
      case 'movie+tv': return 'text-yellow-300';
      case 'trending-fallback': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  const common = (
    <>
      <p className="font-bold text-blue-400">[Recs Debug]</p>
      <p>Path Source: <span className={colorFor(source)}>{source}</span></p>
      <p>Primary: {discoverCount} ({discoverTime ?? '?'}ms)</p>
      <p>TV: {tvCount} ({tvTime ?? '?'}ms)</p>
      <p>Trending: {trendingCount} ({trendingTime ?? '?'}ms)</p>
      {renderedCount !== undefined && <p>Rendered: {renderedCount}</p>}
      <p className="pt-1 border-t border-white/10 text-[10px] text-gray-400">Hotkey: Cmd/Ctrl+D (cycle)</p>
    </>
  );

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-50 space-y-0.5">
        {common}
      </div>
    );
  }

  // Expanded drawer with raw sample payloads & URLs
  return (
    <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm text-white text-xs px-4 py-3 rounded-xl shadow-2xl z-50 space-y-1 w-72 md:w-80 border border-white/10 max-h-[70vh] overflow-auto">
      {common}
      <div className="flex gap-2 mt-1" role="tablist" aria-label="Debug panels">
        <button
          onClick={() => setActiveTab('data')}
          role="tab"
          aria-selected={activeTab==='data'}
          aria-controls="bb-debug-data"
          id="bb-debug-tab-data"
          className={`px-2 py-0.5 rounded border text-[11px] ${activeTab==='data' ? 'bg-white/10 border-white/30' : 'border-white/10 hover:bg-white/5'}`}
        >Data</button>
        <button
          onClick={() => setActiveTab('logs')}
          role="tab"
          aria-selected={activeTab==='logs'}
          aria-controls="bb-debug-logs"
          id="bb-debug-tab-logs"
          className={`px-2 py-0.5 rounded border text-[11px] ${activeTab==='logs' ? 'bg-white/10 border-white/30' : 'border-white/10 hover:bg-white/5'}`}
        >Logs</button>
        <div className="ml-auto flex items-center gap-1">
          <button
            className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] hover:bg-white/5"
            aria-label="Toggle session persistence for debug logs"
            onClick={() => {
              const next = !isLogPersistenceEnabled();
              setLogPersistence(next);
            }}
            title="Toggle session persistence"
          >{isLogPersistenceEnabled() ? 'Persist✓' : 'Persist'}</button>
          <button
            className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] hover:bg-white/5"
            aria-label="Clear debug log buffer"
            onClick={() => { clearDebugLogs(); setLogs([]); }}
            title="Clear log buffer"
          >Clear</button>
          <button
            className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] hover:bg-white/5"
            aria-label="Export debug log as JSON file"
            onClick={() => {
              const blob = new Blob([JSON.stringify(getDebugLogs(), null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'bb-debug-log.json'; a.click();
              URL.revokeObjectURL(url);
            }}
            title="Download JSON export"
          >Export</button>
        </div>
      </div>
      {activeTab === 'logs' && (
        <div id="bb-debug-logs" role="tabpanel" aria-labelledby="bb-debug-tab-logs" className="mt-2 space-y-1 border border-white/10 rounded p-2 max-h-40 overflow-auto">
          {logs.length === 0 && <p className="text-[10px] text-gray-400">No events captured yet.</p>}
          {(() => {
            const ordered: DebugLog[] = (logs as any).toReversed ? (logs as any).toReversed() : [...logs].reverse();
            return ordered.map((l, idx) => (
              <div key={idx} className="border-b border-white/5 last:border-none pb-1 mb-1 last:mb-0 last:pb-0">
                <p className="text-[10px] font-medium text-white/90">{new Date(l.ts).toLocaleTimeString()} – {l.event}</p>
                {Object.keys(l).filter(k => !['ts','event'].includes(k)).length > 0 && (
                  <pre className="text-[10px] whitespace-pre-wrap text-gray-300 max-h-20 overflow-auto">{JSON.stringify(Object.fromEntries(Object.entries(l).filter(([k]) => !['ts','event'].includes(k))), null, 2)}</pre>
                )}
              </div>
            ));
          })()}
        </div>
      )}
  {activeTab === 'data' && (
        <>
          <button
            className="mt-1 text-[10px] underline text-gray-300 hover:text-white"
    aria-label={showPayloads ? 'Hide payload samples' : 'Show payload samples'}
            onClick={() => setShowPayloads(s => !s)}
          >{showPayloads ? 'Hide payload samples' : 'Show payload samples'}</button>
          {showPayloads && (
            <div id="bb-debug-data" role="tabpanel" aria-labelledby="bb-debug-tab-data" className="space-y-2">
              {(() => {
                const previewSample = (sample?: SampleItem[], limit = 3) => sample && sample.length ? { items: sample.slice(0, limit), total: sample.length } : null;
                const sections: { label: string; preview: ReturnType<typeof previewSample> | null }[] = [
                  { label: 'Primary', preview: previewSample(rawPrimarySample) },
                  { label: 'TV', preview: previewSample(rawTvSample) },
                  { label: 'Trending', preview: previewSample(rawTrendingSample) },
                ];
                return sections.filter(s => s.preview).map(({ label, preview }) => (
                  <div key={label} className="border border-white/10 rounded p-1.5">
                    <p className="font-semibold text-[11px] mb-1">{label} Sample ({preview!.total})</p>
                    <pre className="text-[10px] whitespace-pre-wrap max-h-32 overflow-auto">{JSON.stringify(preview!.items, null, 2)}</pre>
                    {preview!.total > preview!.items.length && (
                      <p className="text-[9px] text-gray-500">Showing first {preview!.items.length} of {preview!.total}</p>
                    )}
                  </div>
                ));
              })()}
              {requestUrls && (requestUrls.primary || requestUrls.tv || requestUrls.trending) && (
                <div className="border border-white/10 rounded p-1.5">
                  <p className="font-semibold text-[11px] mb-1">Request URLs</p>
                  <ul className="space-y-0.5 text-[10px] break-all">
                    {requestUrls.primary && <li><span className="text-green-300">Primary:</span> {requestUrls.primary}</li>}
                    {requestUrls.tv && <li><span className="text-yellow-200">TV:</span> {requestUrls.tv}</li>}
                    {requestUrls.trending && <li><span className="text-red-300">Trending:</span> {requestUrls.trending}</li>}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
