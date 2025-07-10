import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BingeBoardHeader } from "@/components";
import { signInWithGoogle, signInWithFacebook } from "@/lib/firebaseAuth";

export default function TestAuth() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testGoogleAuth = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log("Testing Google authentication...");
      const result = await signInWithGoogle();
      console.log("Google auth result:", result);
      setResult(result);
      
      if (result.success) {
        console.log("Google auth successful! Redirecting to home...");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Google auth error:", error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testFacebookAuth = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log("Testing Facebook authentication...");
      const result = await signInWithFacebook();
      console.log("Facebook auth result:", result);
      setResult(result);
      
      if (result.success) {
        console.log("Facebook auth successful! Redirecting to home...");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Facebook auth error:", error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader className="text-center">
          <BingeBoardHeader subtitle="Authentication Test" className="justify-center" />
          <CardTitle className="text-white">Test Social Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testGoogleAuth}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? "Testing..." : "Test Google Login"}
          </Button>
          
          <Button
            onClick={testFacebookAuth}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Testing..." : "Test Facebook Login"}
          </Button>

          {result && (
            <div className="mt-4 p-3 rounded bg-gray-800 text-white text-sm">
              <h3 className="font-semibold mb-2">Authentication Result:</h3>
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}