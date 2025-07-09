import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle, signInWithFacebook, handleRedirectResult } from "@/lib/firebaseAuth";
import { isMobileDevice } from "@/lib/deviceUtils";

export default function AuthDebug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGoogleAuth = async () => {
    setIsLoading(true);
    addLog("Testing Google authentication...");
    addLog(`Device type: ${isMobileDevice() ? 'Mobile' : 'Desktop'}`);
    
    try {
      const result = await signInWithGoogle();
      addLog(`Google auth result: ${JSON.stringify(result)}`);
      
      if (result.isRedirect) {
        addLog("Redirect authentication initiated - page will redirect");
      } else if (result.success) {
        addLog("Popup authentication successful");
      } else {
        addLog(`Authentication failed: ${result.error}`);
      }
    } catch (error: any) {
      addLog(`Google auth error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testFacebookAuth = async () => {
    setIsLoading(true);
    addLog("Testing Facebook authentication...");
    addLog(`Device type: ${isMobileDevice() ? 'Mobile' : 'Desktop'}`);
    
    try {
      const result = await signInWithFacebook();
      addLog(`Facebook auth result: ${JSON.stringify(result)}`);
      
      if (result.isRedirect) {
        addLog("Redirect authentication initiated - page will redirect");
      } else if (result.success) {
        addLog("Popup authentication successful");
      } else {
        addLog(`Authentication failed: ${result.error}`);
      }
    } catch (error: any) {
      addLog(`Facebook auth error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRedirectResult = async () => {
    setIsLoading(true);
    addLog("Testing redirect result...");
    
    try {
      const result = await handleRedirectResult();
      addLog(`Redirect result: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addLog(`Redirect result error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-effect border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Authentication Debug</CardTitle>
            <CardDescription className="text-slate-400">
              Test authentication flows and debug issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={testGoogleAuth}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Test Google Auth
              </Button>
              <Button
                onClick={testFacebookAuth}
                disabled={isLoading}
                className="bg-blue-800 hover:bg-blue-900 text-white"
              >
                Test Facebook Auth
              </Button>
              <Button
                onClick={testRedirectResult}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Test Redirect Result
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Debug Logs</h3>
              <Button
                onClick={clearLogs}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Clear
              </Button>
            </div>
            
            <div className="bg-slate-900 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-slate-500 text-sm">No logs yet. Click a button to test authentication.</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm text-slate-300 font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-slate-900 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Device Info</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <div>User Agent: {navigator.userAgent}</div>
                <div>Mobile Detection: {isMobileDevice() ? 'Mobile' : 'Desktop'}</div>
                <div>Touch Screen: {('ontouchstart' in window) ? 'Yes' : 'No'}</div>
                <div>Screen Size: {window.innerWidth}x{window.innerHeight}</div>
                <div>Max Touch Points: {navigator.maxTouchPoints}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}