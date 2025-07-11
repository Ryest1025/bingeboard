import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/landing";

export default function App() {
  // Remove loading screen on mount
  React.useEffect(() => {
    const loadingDiv = document.querySelector('.loading-fallback') || document.getElementById('loading-fallback');
    if (loadingDiv && loadingDiv.parentNode) {
      loadingDiv.parentNode.removeChild(loadingDiv);
      console.log('✅ Loading overlay removed');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-black text-white">
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000000',
          color: '#ffffff',
          zIndex: 1000
        }}>
          <Landing />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}