import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';

export default function OAuthRedirect() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Handle OAuth redirect from Firebase
    const handleOAuthRedirect = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const authSuccess = urlParams.get('auth');
        
        if (error) {
          let errorMessage = 'Authentication failed';
          if (error === 'oauth_failed') {
            errorMessage = 'OAuth authentication failed. Please try again.';
          } else if (error === 'callback_failed') {
            errorMessage = 'Authentication callback failed. Please try again.';
          }
          
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive",
          });
          
          // Redirect to login
          setTimeout(() => setLocation('/login'), 2000);
          return;
        }
        
        if (authSuccess === 'success') {
          toast({
            title: "Login Successful",
            description: "Welcome to BingeBoard!",
          });
          
          // Redirect to home
          setTimeout(() => setLocation('/'), 1000);
          return;
        }
        
        // If no specific parameters, redirect to login
        setLocation('/login');
      } catch (error) {
        console.error('OAuth redirect error:', error);
        toast({
          title: "Authentication Error",
          description: "Failed to process authentication. Please try again.",
          variant: "destructive",
        });
        setLocation('/login');
      }
    };

    handleOAuthRedirect();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Processing authentication...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we complete your login</p>
      </div>
    </div>
  );
}