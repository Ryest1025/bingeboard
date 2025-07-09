import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle, signInWithFacebook, handleRedirectResult } from "@/lib/firebaseAuth";
import { useToast } from "@/hooks/use-toast";

// Mobile detection function
function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export default function MobileAuthDebug() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    // Check for redirect result on page load
    const checkRedirectResult = async () => {
      addLog("🔍 Page loaded, checking for redirect result...");
      const result = await handleRedirectResult();
      addLog(`📋 Redirect result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        addLog("✅ Redirect authentication successful!");
        toast({
          title: "Success",
          description: "Authentication successful!"
        });
      } else if (result.error && result.error !== 'No redirect result') {
        addLog(`❌ Redirect error: ${result.error}`);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        });
      }
    };

    checkRedirectResult();

    // Set debug info
    setDebugInfo({
      isMobile: isMobile(),
      userAgent: navigator.userAgent,
      currentUrl: window.location.href,
      timestamp: new Date().toISOString()
    });
  }, [toast]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      addLog("🔄 Starting Google login...");
      
      const result = await signInWithGoogle();
      addLog(`📋 Google login result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        if (result.isRedirect) {
          addLog("🔄 Redirecting to Google...");
          // Mobile redirect - page will redirect
        } else {
          addLog("✅ Google popup login successful!");
          toast({
            title: "Success",
            description: "Google login successful!"
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addLog(`❌ Google login error: ${error.message}`);
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
      addLog("🔄 Starting Facebook login...");
      
      const result = await signInWithFacebook();
      addLog(`📋 Facebook login result: ${JSON.stringify(result)}`);
      
      if (result.success) {
        if (result.isRedirect) {
          addLog("🔄 Redirecting to Facebook...");
          // Mobile redirect - page will redirect
        } else {
          addLog("✅ Facebook popup login successful!");
          toast({
            title: "Success",
            description: "Facebook login successful!"
          });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      addLog(`❌ Facebook login error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Facebook",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Mobile Authentication Debug</h1>
        
        {/* Debug Info */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Device:</strong> {debugInfo.isMobile ? "📱 Mobile" : "🖥️ Desktop"}
              </div>
              <div>
                <strong>User Agent:</strong> {debugInfo.userAgent}
              </div>
              <div>
                <strong>Current URL:</strong> {debugInfo.currentUrl}
              </div>
              <div>
                <strong>Timestamp:</strong> {debugInfo.timestamp}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Test */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Authentication Test</CardTitle>
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
            
            <div className="text-xs text-gray-400 text-center">
              Expected: {debugInfo.isMobile ? "Redirect to provider" : "Popup authentication"}
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Debug Logs</CardTitle>
            <Button 
              onClick={clearLogs}
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-600"
            >
              Clear Logs
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-black p-4 rounded-lg max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500 text-center">No logs yet</div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs text-gray-300 font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}