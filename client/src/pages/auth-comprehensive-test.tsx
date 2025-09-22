import React, { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged,
  type User 
} from "firebase/auth";
import { auth } from "@/firebase/config"; // Use centralized auth instance
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { LogOut, User as UserIcon, CheckCircle, XCircle, Mail, Lock, Phone, RefreshCw } from "lucide-react";

export default function AuthComprehensiveTest() {
  const { toast } = useToast();
  
  // Firebase state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(false);
  
  // Email/Password login state
  const [loginEmail, setLoginEmail] = useState("rachel.gubin@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  
  // Password reset state
  const [resetEmail, setResetEmail] = useState("rachel.gubin@gmail.com");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  
  // SMS test state
  const [smsPhone, setSmsPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsLoading, setSmsLoading] = useState(false);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user) {
        console.log("Firebase user authenticated:", user);
        setDebugInfo(prev => ({ ...prev, firebase: user }));
      }
    });

    // Check for existing session
    checkSession();

    return () => unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const user = await response.json();
        setSessionUser(user);
        setDebugInfo(prev => ({ ...prev, session: user }));
        console.log("Existing session found:", user);
      }
    } catch (error) {
      console.log("No existing session");
    }
  };

  // Firebase Authentication
  const handleGoogleSignIn = async () => {
    setFirebaseLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      toast({
        title: "Firebase Success!",
        description: `Welcome ${result.user.displayName || result.user.email}!`,
      });

      // Test backend session creation
      const idToken = await result.user.getIdToken();
      console.log("🔥 Firebase ID Token:", idToken.substring(0, 50) + "...");
      
      try {
        const response = await fetch('/api/auth/firebase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          credentials: 'include',
          body: JSON.stringify({ 
            idToken,
            user: {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL
            }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Backend session created:", data);
          setSessionUser(data.user);
          setDebugInfo(prev => ({ ...prev, backendSession: data }));
          toast({
            title: "Backend Connected!",
            description: "Successfully created backend session",
          });
        } else {
          const errorText = await response.text();
          console.error("❌ Backend session failed:", errorText);
          setDebugInfo(prev => ({ ...prev, backendError: errorText }));
        }
      } catch (backendError) {
        console.error("❌ Backend session error:", backendError);
        setDebugInfo(prev => ({ ...prev, backendError }));
      }
      
    } catch (error: any) {
      console.error("❌ Google sign-in error:", error);
      toast({
        title: "Firebase Sign-in Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFirebaseLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setFirebaseLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      toast({
        title: "Firebase Success!",
        description: `Welcome ${result.user.displayName || result.user.email}!`,
      });
      
    } catch (error: any) {
      console.error("❌ Facebook sign-in error:", error);
      toast({
        title: "Firebase Sign-in Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFirebaseLoading(false);
    }
  };

  const handleFirebaseSignOut = async () => {
    try {
      await signOut(auth);
      setSessionUser(null);
      toast({
        title: "Signed Out",
        description: "Firebase user signed out",
      });
    } catch (error: any) {
      console.error("❌ Sign-out error:", error);
    }
  };

  // Email/Password Login
  const handleEmailLogin = async () => {
    setLoginLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionUser(data.user);
        setDebugInfo(prev => ({ ...prev, emailLogin: data }));
        console.log("✅ Email login successful:", data);
        toast({
          title: "Login Successful!",
          description: `Welcome back ${data.user.email}!`,
        });
      } else {
        const errorData = await response.json();
        console.error("❌ Email login failed:", errorData);
        toast({
          title: "Login Failed",
          description: errorData.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Email login error:", error);
      toast({
        title: "Login Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async () => {
    setResetLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail,
          method: 'email'
        })
      });

      if (response.ok) {
        console.log("✅ Password reset email sent");
        toast({
          title: "Reset Email Sent!",
          description: "Check your email for reset instructions",
        });
      } else {
        const errorData = await response.json();
        console.error("❌ Password reset failed:", errorData);
        toast({
          title: "Reset Failed",
          description: errorData.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Password reset error:", error);
      toast({
        title: "Reset Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setResetPasswordLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          password: newPassword
        })
      });

      if (response.ok) {
        console.log("✅ Password updated successfully");
        toast({
          title: "Password Updated!",
          description: "You can now login with your new password",
        });
        setResetToken("");
        setNewPassword("");
      } else {
        const errorData = await response.json();
        console.error("❌ Password update failed:", errorData);
        toast({
          title: "Update Failed",
          description: errorData.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Password update error:", error);
      toast({
        title: "Update Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // SMS Test
  const handleSmsReset = async () => {
    setSmsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: smsPhone,
          method: 'sms'
        })
      });

      if (response.ok) {
        console.log("✅ SMS reset code sent");
        toast({
          title: "SMS Sent!",
          description: "Check your phone for the reset code",
        });
      } else {
        const errorData = await response.json();
        console.error("❌ SMS reset failed:", errorData);
        toast({
          title: "SMS Failed",
          description: errorData.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ SMS reset error:", error);
      toast({
        title: "SMS Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setSmsLoading(false);
    }
  };

  const checkAllUsers = async () => {
    try {
      const response = await fetch('/api/debug/users');
      const data = await response.json();
      setDebugInfo(prev => ({ ...prev, allUsers: data }));
      console.log("👥 All users:", data);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔥 Complete Authentication Test</h1>
          <p className="text-gray-300">Testing all authentication flows and debugging issues</p>
        </div>

        <Tabs defaultValue="firebase" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="firebase">Firebase</TabsTrigger>
            <TabsTrigger value="email">Email Login</TabsTrigger>
            <TabsTrigger value="reset">Password Reset</TabsTrigger>
            <TabsTrigger value="sms">SMS Test</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          {/* Firebase Authentication */}
          <TabsContent value="firebase">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <SiGoogle className="h-5 w-5" />
                  Firebase Authentication
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Test Google/Facebook authentication with Firebase
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-2 text-white mb-2">
                    {firebaseUser ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span>Firebase Status: {firebaseUser ? "Authenticated ✅" : "Not authenticated"}</span>
                  </div>
                  {firebaseUser && (
                    <div className="text-sm text-gray-300">
                      <p>Email: {firebaseUser.email}</p>
                      <p>Name: {firebaseUser.displayName}</p>
                      <p>Provider: {firebaseUser.providerData[0]?.providerId}</p>
                    </div>
                  )}
                </div>

                {!firebaseUser ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={firebaseLoading}
                      className="w-full bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <SiGoogle className="h-4 w-4 mr-2" />
                      {firebaseLoading ? "Signing in..." : "Continue with Google"}
                    </Button>

                    <Button
                      onClick={handleFacebookSignIn}
                      disabled={firebaseLoading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <SiFacebook className="h-4 w-4 mr-2" />
                      {firebaseLoading ? "Signing in..." : "Continue with Facebook"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleFirebaseSignOut}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email/Password Login */}
          <TabsContent value="email">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email/Password Login
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Test login with email and password (for manual accounts)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-2 text-white mb-2">
                    {sessionUser ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span>Session Status: {sessionUser ? "Logged in ✅" : "Not logged in"}</span>
                  </div>
                  {sessionUser && (
                    <div className="text-sm text-gray-300">
                      <p>Email: {sessionUser.email}</p>
                      <p>ID: {sessionUser.id}</p>
                      <p>Provider: {sessionUser.authProvider}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="login-email" className="text-white">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password" className="text-white">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button
                    onClick={handleEmailLogin}
                    disabled={loginLoading || !loginEmail || !loginPassword}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {loginLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Reset */}
          <TabsContent value="reset">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Password Reset
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Test email-based password reset functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Request Reset */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium">Step 1: Request Reset Email</h3>
                  <div>
                    <Label htmlFor="reset-email" className="text-white">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                  <Button
                    onClick={handlePasswordReset}
                    disabled={resetLoading || !resetEmail}
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Email"}
                  </Button>
                </div>

                {/* Step 2: Use Reset Token */}
                <div className="space-y-3 border-t border-white/20 pt-4">
                  <h3 className="text-white font-medium">Step 2: Reset Password with Token</h3>
                  <div>
                    <Label htmlFor="reset-token" className="text-white">Reset Token (from email)</Label>
                    <Input
                      id="reset-token"
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Paste reset token from email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password" className="text-white">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter new password"
                    />
                  </div>
                  <Button
                    onClick={handlePasswordUpdate}
                    disabled={resetPasswordLoading || !resetToken || !newPassword}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {resetPasswordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Test */}
          <TabsContent value="sms">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  SMS Testing
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Test SMS-based password reset with Twilio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sms-phone" className="text-white">Phone Number</Label>
                  <Input
                    id="sms-phone"
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="+1234567890"
                  />
                </div>

                <Button
                  onClick={handleSmsReset}
                  disabled={smsLoading || !smsPhone}
                  className="w-full bg-orange-600 text-white hover:bg-orange-700"
                >
                  {smsLoading ? "Sending..." : "Send SMS Reset Code"}
                </Button>

                <div>
                  <Label htmlFor="sms-code" className="text-white">SMS Code</Label>
                  <Input
                    id="sms-code"
                    type="text"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Enter SMS code"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Debug Information */}
          <TabsContent value="debug">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Debug Information</CardTitle>
                <CardDescription className="text-gray-300">
                  View debug info and test database operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={checkAllUsers}
                  className="w-full bg-gray-600 text-white hover:bg-gray-700"
                >
                  Refresh Debug Info
                </Button>

                <div className="bg-black/40 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-xs text-green-400 whitespace-pre-wrap">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
