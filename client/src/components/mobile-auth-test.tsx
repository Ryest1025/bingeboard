import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle, signInWithFacebook } from "@/lib/firebaseAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Mobile detection function
function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export default function MobileAuthTest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log("🔄 Starting Google login...");
      console.log("📱 Is mobile:", isMobile());
      
      const result = await signInWithGoogle();
      console.log("📋 Login result:", result);
      
      if (result.success) {
        if (result.isRedirect) {
          console.log("🔄 Redirecting to Google...");
          // Mobile redirect - don't show toast as page will redirect
        } else {
          // Desktop popup success
          toast({
            title: "Success",
            description: "Google login successful!"
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("❌ Google login error:", error);
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
      console.log("🔄 Starting Facebook login...");
      console.log("📱 Is mobile:", isMobile());
      
      const result = await signInWithFacebook();
      console.log("📋 Login result:", result);
      
      if (result.success) {
        if (result.isRedirect) {
          console.log("🔄 Redirecting to Facebook...");
          // Mobile redirect - don't show toast as page will redirect
        } else {
          // Desktop popup success
          toast({
            title: "Success",
            description: "Facebook login successful!"
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("❌ Facebook login error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Facebook",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Mobile Auth Test</CardTitle>
        <div className="text-sm text-gray-500">
          Device: {isMobile() ? "📱 Mobile" : "🖥️ Desktop"}
        </div>
        <div className="text-sm text-gray-500">
          Method: {isMobile() ? "Redirect" : "Popup"}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          {isLoading ? "Loading..." : "Test Google Login"}
        </Button>
        
        <Button 
          onClick={handleFacebookLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Loading..." : "Test Facebook Login"}
        </Button>
        
        <div className="text-xs text-gray-400">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
}