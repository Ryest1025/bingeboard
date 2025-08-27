import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

function TopNavComponent() {
  // Simple backup nav (kept minimal to avoid build errors)
  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] w-full border-b border-slate-800/50 bg-black backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                  <div className="text-sm font-bold text-white">B</div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xl text-white">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">Binge</span>
                <span className="font-light text-white ml-1">Board</span>
              </span>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded">
                Backup Nav
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
export const TopNav = React.memo(TopNavComponent);