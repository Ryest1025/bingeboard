import { useState } from "react";
// Firebase imports disabled temporarily to fix build issues
// import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
// import { auth } from "@/firebase/config";

// Mock Firebase auth for compatibility
const auth = null;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SimpleLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { signInWithGoogle } = await import('@/lib/firebaseAuth');
      const result = await signInWithGoogle();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Signed in successfully!"
        });
        setLocation("/");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      const { signInWithFacebook } = await import('@/lib/firebaseAuth');
      const result = await signInWithFacebook();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Signed in successfully!"
        });
        setLocation("/");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Facebook login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Facebook",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplitLogin = () => {
    // Use the existing Replit Auth endpoint
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-white/20">
              B
            </div>
            <div>
              <span className="text-white font-black text-2xl">inge</span>
              <span className="text-transparent bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text font-black text-2xl">Board</span>
            </div>
          </div>
          <CardTitle className="text-white text-xl">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleReplitLogin}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Continue with Replit"}
          </Button>
          
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700 text-white"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <Button
            onClick={handleFacebookLogin}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-gray-600 hover:border-gray-500 bg-gray-800 hover:bg-gray-700 text-white"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {isLoading ? "Signing in..." : "Continue with Facebook"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}