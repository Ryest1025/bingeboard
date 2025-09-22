import React from 'react';

export function EnhancedShowCard({ item }: { item: any }) {
  return (
    <div className="rounded-2xl shadow hover:shadow-lg transition bg-white/5 border border-slate-700 overflow-hidden">
      <img
        src={item.poster || item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path || ''}` : '/placeholder.jpg'}
        alt={item.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate text-white">{item.title}</h3>
          {/* type icon placeholder */}
        </div>
        {item.network && <p className="text-xs text-zinc-400">{item.network}</p>}
      </div>
    </div>
  );
}
