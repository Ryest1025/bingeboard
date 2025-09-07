import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import { Button } from "@/components/ui/button";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show logout button if authenticated
  if (isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-600 bg-clip-text text-transparent">
                  BingeBoard
                </h1>
                <Button 
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                      });
                      window.location.reload();
                    } catch (error) {
                      console.error('Logout error:', error);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Logout
                </Button>
              </div>
              <div className="text-center">
                <p className="text-lg mb-4">You are logged in as: rachel.gubin@gmail.com</p>
                <p className="text-gray-400">Click logout to see the landing page</p>
              </div>
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="text-white font-black text-2xl">B</div>
          </div>
          <p className="text-white text-lg">Loading BingeBoard...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-black">
          <Landing />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}