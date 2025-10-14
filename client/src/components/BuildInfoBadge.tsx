import React from 'react';

interface BuildInfoBadgeProps {
  commit?: string;
  generatedAt?: string;
  className?: string;
}

// Attempts to read window.__BUILD_INFO__ injected or falls back to props
export const BuildInfoBadge: React.FC<BuildInfoBadgeProps> = ({ commit, generatedAt, className = '' }) => {
  const info = (window as any).__BUILD_INFO__ || {};
  const c = (commit || info.commit || 'dev').toString();
  const ts = generatedAt || info.timestamp || info.generatedAt;
  return (
    <div
      className={`fixed bottom-2 right-2 z-50 text-[10px] px-2 py-1 rounded bg-slate-800/80 border border-slate-600 text-slate-300 font-mono backdrop-blur ${className}`}
      title={`Commit: ${c}\nBuilt: ${ts || 'unknown'}`}
    >
      build {c}
    </div>
  );
};

export default BuildInfoBadge;