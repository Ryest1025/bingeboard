import React from 'react';

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-40 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold">BingeBoard</div>
        <nav className="flex items-center gap-4 text-sm text-gray-200">
          <a href="/discover" className="hover:text-white">Discover</a>
          <a href="/lists" className="hover:text-white">Lists</a>
          <a href="/friends" className="hover:text-white">Friends</a>
        </nav>
      </div>
    </header>
  );
}
