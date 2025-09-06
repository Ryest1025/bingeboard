import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/40 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm">© {new Date().getFullYear()} BingeBoard</div>
        <div className="flex items-center gap-4 text-sm">
          <a href="/privacy" className="hover:text-white">Privacy</a>
          <a href="/terms" className="hover:text-white">Terms</a>
          <a href="/contact" className="hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}
