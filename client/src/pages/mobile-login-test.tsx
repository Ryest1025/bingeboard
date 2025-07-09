import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SiGoogle, SiFacebook } from "react-icons/si";

export default function MobileLoginTest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      console.log('=== MOBILE GOOGLE AUTH TEST ===');
      console.log('Device type:', isMobile() ? 'Mobile' : 'Desktop');
      console.log('User agent:', navigator.userAgent);
      console.log('Current URL:', window.location.href);
      console.log('Redirecting to:', '/api/auth/google');
      
      // Test the backend OAuth endpoint
      window.location.href = '/api/auth/google';
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to start Google authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    setIsLoading(true);
    try {
      console.log('=== MOBILE FACEBOOK AUTH TEST ===');
      console.log('Device type:', isMobile() ? 'Mobile' : 'Desktop');
      console.log('User agent:', navigator.userAgent);
      console.log('Current URL:', window.location.href);
      console.log('Redirecting to:', '/api/auth/facebook');
      
      // Test the backend OAuth endpoint
      window.location.href = '/api/auth/facebook';
    } catch (error) {
      console.error('Facebook auth error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to start Facebook authentication",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-white">
            Mobile Authentication Test
          </CardTitle>
          <div className="text-center text-sm text-gray-400">
            Device: {isMobile() ? "📱 Mobile" : "🖥️ Desktop"}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Login */}
          <Button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-semibold"
          >
            <SiGoogle className="w-5 h-5 mr-3" />
            {isLoading ? "Redirecting..." : "Test Google Login"}
          </Button>

          {/* Facebook Login */}
          <Button
            type="button"
            onClick={handleFacebookAuth}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
          >
            <SiFacebook className="w-5 h-5 mr-3" />
            {isLoading ? "Redirecting..." : "Test Facebook Login"}
          </Button>

          <div className="text-xs text-gray-500 text-center mt-4">
            {isMobile() ? (
              <>
                <p>📱 Mobile detected: Using redirect authentication</p>
                <p>Expected: Redirect to provider → authenticate → redirect back</p>
              </>
            ) : (
              <>
                <p>🖥️ Desktop detected: Using redirect authentication</p>
                <p>Expected: Redirect to provider → authenticate → redirect back</p>
              </>
            )}
          </div>

          <div className="text-xs text-gray-400 text-center">
            Check browser console for detailed authentication logs
          </div>

          <Button
            variant="link"
            onClick={() => setLocation("/login")}
            className="w-full text-teal-400 hover:text-teal-300 mt-4"
          >
            Back to Main Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}