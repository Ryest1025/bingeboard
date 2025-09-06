import React from 'react';
import { Button } from "@/components/ui/button";

export function SimpleTopNav() {
  console.log("🔍 SimpleTopNav rendering");
  
  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] w-full border-b border-slate-800/50 bg-black backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-white">
              <span className="text-teal-400">Binge</span>Board
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              Log In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
