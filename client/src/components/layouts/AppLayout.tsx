import React from "react";
import TopNav from "@/components/top-nav";
import BottomNav from "@/components/bottom-nav";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppLayout({ children, className = "" }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      <TopNav />
      <main className={`flex-1 pt-16 pb-16 md:pb-0 ${className}`}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
