import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/firebase/config';

export default function LoginMinimal() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting Google authentication...');

      const result = await signInWithPopup(auth, googleProvider);

      if (result.user) {
        console.log('✅ Google authentication successful:', result.user.email);

        // Create backend session
        const firebaseToken = await result.user.getIdToken();
        const response = await fetch('/api/auth/firebase-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ firebaseToken }),
        });

        if (response.ok) {
          console.log('✅ Backend session created');

          // Redirect to home page
          window.location.href = '/';
        } else {
          console.error('❌ Backend session creation failed');
          toast({
            title: "Login failed",
            description: "Failed to create session. Please try again.",
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      console.error('❌ Google authentication error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting Facebook authentication...');

      const result = await signInWithPopup(auth, facebookProvider);

      if (result.user) {
        console.log('✅ Facebook authentication successful:', result.user.email);

        // Create backend session
        const firebaseToken = await result.user.getIdToken();
        const response = await fetch('/api/auth/firebase-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ firebaseToken }),
        });

        if (response.ok) {
          console.log('✅ Backend session created');

          // Redirect to home page
          window.location.href = '/';
        } else {
          console.error('❌ Backend session creation failed');
          toast({
            title: "Login failed",
            description: "Failed to create session. Please try again.",
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      console.error('❌ Facebook authentication error:', error);
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to sign in with Facebook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/80 backdrop-blur border-slate-700/50">
        <CardContent className="pt-8">
          {/* BingeBoard Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* TV Frame */}
                <div className="w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  {/* TV Screen */}
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div className="text-sm font-bold text-white drop-shadow-lg">B</div>
                  </div>
                  {/* TV Base */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>

              {/* Brand Name */}
              <div className="block">
                <span className="text-2xl select-none">
                  <span className="font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Binge
                  </span>
                  <span className="font-light text-white ml-1">Board</span>
                </span>
                <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75">
                  Entertainment Hub
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">
              Sign in to access your entertainment hub
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3"
            >
              <SiGoogle className="h-5 w-5 mr-3" />
              Sign in with Google
            </Button>

            <Button
              type="button"
              onClick={handleFacebookAuth}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3"
            >
              <SiFacebook className="h-5 w-5 mr-3" />
              Sign in with Facebook
            </Button>
          </div>

          {isLoading && (
            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">Please wait...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
