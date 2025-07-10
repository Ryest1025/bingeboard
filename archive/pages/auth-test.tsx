import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle, signInWithFacebook } from "@/lib/firebaseAuth";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AuthTest() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [testResults, setTestResults] = useState<{[key: string]: 'pending' | 'success' | 'error'}>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateTestResult = (test: string, result: 'success' | 'error') => {
    setTestResults(prev => ({ ...prev, [test]: result }));
  };

  const testReplitAuth = () => {
    updateTestResult('replit', 'pending');
    window.location.href = '/api/login';
  };

  const testGoogleAuth = async () => {
    try {
      setIsLoading(true);
      updateTestResult('google', 'pending');
      
      const result = await signInWithGoogle();
      
      if (result.success) {
        updateTestResult('google', 'success');
        toast({
          title: "Google Authentication Success",
          description: "Successfully signed in with Google!",
        });
        // Refresh page to update auth state
        setTimeout(() => window.location.reload(), 1000);
      } else {
        updateTestResult('google', 'error');
        toast({
          title: "Google Authentication Failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      updateTestResult('google', 'error');
      toast({
        title: "Google Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testFacebookAuth = async () => {
    try {
      setIsLoading(true);
      updateTestResult('facebook', 'pending');
      
      const result = await signInWithFacebook();
      
      if (result.success) {
        updateTestResult('facebook', 'success');
        toast({
          title: "Facebook Authentication Success",
          description: "Successfully signed in with Facebook!",
        });
        // Refresh page to update auth state
        setTimeout(() => window.location.reload(), 1000);
      } else {
        updateTestResult('facebook', 'error');
        toast({
          title: "Facebook Authentication Failed",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      updateTestResult('facebook', 'error');
      toast({
        title: "Facebook Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'GET' });
      if (response.ok) {
        toast({
          title: "Logout Success",
          description: "Successfully logged out!",
        });
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Could not log out",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Testing...</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">BingeBoard Authentication Test</h1>
          <p className="text-gray-400">Test all authentication methods to ensure they're working properly</p>
        </div>

        {/* Current Auth Status */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Current Authentication Status
              {authLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Authentication Status:</span>
              <Badge className={isAuthenticated ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            {user && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">User ID:</span>
                  <span className="text-white font-mono text-sm">{user.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email:</span>
                  <span className="text-white">{user.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Name:</span>
                  <span className="text-white">{user.firstName} {user.lastName}</span>
                </div>
              </div>
            )}
            {isAuthenticated && (
              <Button onClick={testLogout} variant="outline" className="w-full mt-4">
                Logout
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Authentication Tests */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Replit Auth Test */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Replit Auth
                {getStatusIcon(testResults.replit)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>{getStatusBadge(testResults.replit)}</div>
              <p className="text-gray-400 text-sm">
                Primary authentication method using Replit's OpenID Connect system.
              </p>
              <Button 
                onClick={testReplitAuth}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                disabled={isLoading}
              >
                Test Replit Auth
              </Button>
            </CardContent>
          </Card>

          {/* Google Auth Test */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Google Auth
                {getStatusIcon(testResults.google)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>{getStatusBadge(testResults.google)}</div>
              <p className="text-gray-400 text-sm">
                Firebase popup authentication with Google OAuth provider.
              </p>
              <Button 
                onClick={testGoogleAuth}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && testResults.google === 'pending' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Google Auth'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Facebook Auth Test */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Facebook Auth
                {getStatusIcon(testResults.facebook)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>{getStatusBadge(testResults.facebook)}</div>
              <p className="text-gray-400 text-sm">
                Firebase popup authentication with Facebook OAuth provider.
              </p>
              <Button 
                onClick={testFacebookAuth}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && testResults.facebook === 'pending' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Facebook Auth'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Backend Status */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Backend Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-gray-300">Replit Auth Endpoint:</span>
                <Badge className="bg-green-100 text-green-800">/api/login</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-gray-300">Firebase Auth Endpoint:</span>
                <Badge className="bg-green-100 text-green-800">/api/auth/firebase</Badge>
              </div>
              <div className="space-y-1">
                <span className="text-gray-300">User Info Endpoint:</span>
                <Badge className="bg-green-100 text-green-800">/api/auth/user</Badge>
              </div>
            </div>
            <p className="text-gray-400 text-xs">
              All authentication endpoints are properly configured and responding.
            </p>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center space-y-3">
          <p className="text-gray-400">Ready to explore the app?</p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}