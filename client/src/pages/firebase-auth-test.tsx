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
import { LogOut, User as UserIcon, CheckCircle, XCircle, Mail, Lock, RefreshCw } from "lucide-react";

export default function FirebaseAuthTest() {
  const { toast } = useToast();
  
  // Firebase state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("Checking...");
  
  // Email/Password login state
  const [loginEmail, setLoginEmail] = useState("rachel.gubin@gmail.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  
  // Password reset state
  const [resetEmail, setResetEmail] = useState("rachel.gubin@gmail.com");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMethod, setResetMethod] = useState<'email' | 'sms'>('email');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<'send' | 'verify'>('send');
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [serverStatus, setServerStatus] = useState("Unknown");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setAuthStatus("Authenticated with Firebase ✅");
        console.log("Firebase user:", firebaseUser);
      } else {
        setAuthStatus("Not authenticated");
      }
    });

    // Check for existing backend session
    checkSession();

    return () => unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setSessionUser(userData);
        console.log("✅ Existing backend session found:", userData);
      }
    } catch (error) {
      console.log("No existing backend session");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      toast({
        title: "Success!",
        description: `Welcome ${result.user.displayName || result.user.email}!`,
      });

      // Test backend session creation
      const idToken = await result.user.getIdToken();
      console.log("Firebase ID Token:", idToken.substring(0, 50) + "...");
      
      // Try to create backend session
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
          toast({
            title: "Backend Connected!",
            description: "Successfully created backend session",
          });
        } else {
          const errorText = await response.text();
          console.error("❌ Backend session failed:", errorText);
        }
      } catch (backendError) {
        console.error("❌ Backend session error:", backendError);
      }
      
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Sign-in Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      toast({
        title: "Success!",
        description: `Welcome ${result.user.displayName || result.user.email}!`,
      });
      
    } catch (error: any) {
      console.error("Facebook sign-in error:", error);
      toast({
        title: "Sign-in Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSessionUser(null);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully",
      });
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast({
        title: "Sign-out Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Email/Password Login
  const handleEmailLogin = async () => {
    setLoginLoading(true);
    try {
      console.log(`🔐 Attempting email login for: ${loginEmail}`);
      
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
          description: errorData.message || "Invalid email or password",
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
      // Validate inputs based on method
      if (resetMethod === 'sms' && !phoneNumber) {
        toast({
          title: "Phone Required",
          description: "Please enter your phone number for SMS reset",
          variant: "destructive",
        });
        setResetLoading(false);
        return;
      }

      if (resetMethod === 'email' && !resetEmail) {
        toast({
          title: "Email Required", 
          description: "Please enter your email for reset",
          variant: "destructive",
        });
        setResetLoading(false);
        return;
      }

      console.log(`📧 Sending password reset via ${resetMethod} to: ${resetMethod === 'email' ? resetEmail : phoneNumber}`);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetMethod === 'email' ? resetEmail : undefined,
          phoneNumber: resetMethod === 'sms' ? phoneNumber : undefined,
          method: resetMethod
        })
      });

      if (response.ok) {
        console.log(`✅ Password reset ${resetMethod} sent`);
        
        if (resetMethod === 'sms') {
          setResetStep('verify');
          toast({
            title: "SMS Code Sent!",
            description: "Check your phone for the verification code",
          });
        } else {
          toast({
            title: "Reset Email Sent!",
            description: "Check your email for reset instructions",
          });
        }
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

  // Handle SMS verification and password reset
  const handleSmsPasswordReset = async () => {
    setResetLoading(true);
    try {
      if (!resetCode || !newPassword) {
        toast({
          title: "Fields Required",
          description: "Please enter the code and new password",
          variant: "destructive",
        });
        setResetLoading(false);
        return;
      }

      console.log(`🔐 Verifying SMS code and resetting password`);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: resetCode,
          phoneNumber: phoneNumber,
          password: newPassword
        })
      });

      if (response.ok) {
        console.log("✅ Password reset successful");
        toast({
          title: "Password Reset!",
          description: "Your password has been updated successfully",
        });
        // Reset form
        setResetStep('send');
        setResetCode('');
        setNewPassword('');
        setPhoneNumber('');
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

  // Debug function to simulate SMS for testing
  const simulateSms = async () => {
    try {
      console.log("🔧 Simulating SMS for testing...");
      
      const response = await fetch('/api/debug/simulate-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetEmail,
          phoneNumber: phoneNumber
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ SMS simulation successful:", data);
        
        // Auto-fill the code for testing convenience
        setResetCode(data.testCode);
        setResetStep('verify');
        
        toast({
          title: "Test SMS Generated!",
          description: `Test code: ${data.testCode} (auto-filled)`,
        });
      } else {
        const errorData = await response.json();
        console.error("❌ SMS simulation failed:", errorData);
        toast({
          title: "Simulation Failed",
          description: errorData.message || errorData.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ SMS simulation error:", error);
      toast({
        title: "Simulation Error",
        description: "Network error occurred",
        variant: "destructive",
      });
    }
  };

  // Debug functions
  const checkServerStatus = async () => {
    try {
      console.log("🔍 Checking server status...");
      const response = await fetch('/api/debug/users');
      
      if (response.ok) {
        const data = await response.json();
        setServerStatus("Online ✅");
        setDebugInfo((prev: any) => ({ ...prev, serverOnline: true, users: data }));
        console.log("✅ Server is online. Users found:", data);
        
        toast({
          title: "Server Online!",
        });
      }
    } catch (error) {
      console.error("❌ Error checking account:", error);
    }
  };

  const checkMyAccount = async () => {
    try {
      console.log("👤 Checking my account...");
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDebugInfo((prev: any) => ({ ...prev, myAccount: data }));
        console.log("✅ Account found:", data);
        
        toast({
          title: "Account Found!",
          description: `Found account for ${data.email}`,
        });
      } else {
        console.log("❌ No account found or not logged in");
        toast({
          title: "No Account Found",
          description: "You may need to log in first",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error checking account:", error);
      toast({
        title: "Error",
        description: "Failed to check account",
        variant: "destructive",
      });
    }
  };

  const createTestPassword = async () => {
    try {
      // Set a simple test password for debugging
      const testPassword = "test123";
      
      console.log("🔧 Creating test password...");
      
      const response = await fetch('/api/debug/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: testPassword
        })
      });

      if (response.ok) {
        console.log("✅ Test password set successfully");
        toast({
          title: "Test Password Set!",
          description: `Password set to: ${testPassword}`,
        });
        setLoginPassword(testPassword);
      } else {
        console.error("❌ Failed to set test password");
        toast({
          title: "Failed!",
          description: "Could not set test password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error setting test password:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🔥 Complete Auth Test</h1>
          <p className="text-gray-300">Test Firebase, Email/Password, and Password Reset</p>
        </div>

        <Tabs defaultValue="firebase" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="firebase">Firebase</TabsTrigger>
            <TabsTrigger value="email">Email Login</TabsTrigger>
            <TabsTrigger value="reset">Password Reset</TabsTrigger>
            <TabsTrigger value="debug">🔧 Debug</TabsTrigger>
          </TabsList>

          {/* Firebase Authentication Tab */}
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
                {/* Firebase Status */}
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-2 text-white mb-2">
                    {user ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span>Firebase: {user ? "Authenticated ✅" : "Not authenticated"}</span>
                  </div>
                  {user && (
                    <div className="text-sm text-gray-300">
                      <p>Email: {user.email}</p>
                      <p>Name: {user.displayName}</p>
                      <p>Provider: {user.providerData[0]?.providerId}</p>
                    </div>
                  )}
                </div>

                {/* Backend Session Status */}
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-2 text-white mb-2">
                    {sessionUser ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span>Backend Session: {sessionUser ? "Active ✅" : "Not active"}</span>
                  </div>
                  {sessionUser && (
                    <div className="text-sm text-gray-300">
                      <p>Email: {sessionUser.email}</p>
                      <p>ID: {sessionUser.id}</p>
                      <p>Provider: {sessionUser.authProvider}</p>
                    </div>
                  )}
                </div>

                {!user ? (
                  <div className="space-y-3">
                    <Button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <SiGoogle className="h-4 w-4 mr-2" />
                      {loading ? "Signing in..." : "Continue with Google"}
                    </Button>

                    <Button
                      onClick={handleFacebookSignIn}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <SiFacebook className="h-4 w-4 mr-2" />
                      {loading ? "Signing in..." : "Continue with Facebook"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleSignOut}
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

          {/* Email/Password Login Tab */}
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
                {/* Backend Session Status */}
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-2 text-white mb-2">
                    {sessionUser ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <span>Login Status: {sessionUser ? "Logged in ✅" : "Not logged in"}</span>
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
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
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
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button
                    onClick={handleEmailLogin}
                    disabled={loginLoading || !loginEmail || !loginPassword}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {loginLoading ? "Signing in..." : "Sign In with Email"}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    This tests the /api/auth/login endpoint for manual accounts
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Reset Tab */}
          <TabsContent value="reset">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Password Reset
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Test email and SMS password reset functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Method Selection */}
                <div className="flex gap-2">
                  <Button
                    variant={resetMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setResetMethod('email');
                      setResetStep('send');
                    }}
                    className={`flex-1 ${
                      resetMethod === 'email'
                        ? 'bg-blue-600 text-white'
                        : 'border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Reset
                  </Button>
                  <Button
                    variant={resetMethod === 'sms' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setResetMethod('sms');
                      setResetStep('send');
                    }}
                    className={`flex-1 ${
                      resetMethod === 'sms'
                        ? 'bg-green-600 text-white'
                        : 'border-white/20 text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="mr-2">📱</span>
                    SMS Code
                  </Button>
                </div>

                {/* Email Method */}
                {resetMethod === 'email' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reset-email" className="text-white">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="Enter your email"
                      />
                    </div>

                    <Button
                      onClick={handlePasswordReset}
                      disabled={resetLoading || !resetEmail}
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {resetLoading ? "Sending..." : "Send Reset Email"}
                    </Button>
                  </div>
                )}

                {/* SMS Method */}
                {resetMethod === 'sms' && resetStep === 'send' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone-number" className="text-white">Phone Number</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="+1234567890"
                      />
                    </div>

                    <Button
                      onClick={handlePasswordReset}
                      disabled={resetLoading || !phoneNumber}
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                    >
                      <span className="mr-2">📱</span>
                      {resetLoading ? "Sending..." : "Send SMS Code"}
                    </Button>
                  </div>
                )}

                {/* SMS Verification Step */}
                {resetMethod === 'sms' && resetStep === 'verify' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reset-code" className="text-white">Verification Code</Label>
                      <Input
                        id="reset-code"
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>

                    <div>
                      <Label htmlFor="new-password" className="text-white">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setResetStep('send')}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleSmsPasswordReset}
                        disabled={resetLoading || !resetCode || !newPassword}
                        className="flex-1 bg-green-600 text-white hover:bg-green-700"
                      >
                        {resetLoading ? "Resetting..." : "Reset Password"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    Tests /api/auth/forgot-password and /api/auth/reset-password endpoints
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Debug Tab */}
          <TabsContent value="debug">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  🔧 Debug & Diagnostics
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Check server status and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Server Status */}
                <div className="p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <span>Server Status: {serverStatus}</span>
                  </div>
                </div>

                {/* Debug Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    onClick={checkServerStatus}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Check Server
                  </Button>
                  
                  <Button
                    onClick={checkMyAccount}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Check My Account
                  </Button>
                  
                  <Button
                    onClick={createTestPassword}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Set Test Password
                  </Button>
                </div>

                {/* Debug Info Display */}
                {Object.keys(debugInfo).length > 0 && (
                  <div className="bg-black/40 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Debug Information:</h4>
                    <pre className="text-xs text-green-400 overflow-auto max-h-64">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Quick Instructions */}
                <div className="bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Quick Fix Steps:</h4>
                  <ol className="text-sm text-gray-300 space-y-1">
                    <li>1. Click "Check Server" to see if backend is running</li>
                    <li>2. Click "Check My Account" to see if your account exists</li>
                    <li>3. Click "Set Test Password" to create a test password</li>
                    <li>4. Go to "Email Login" tab and try logging in with "test123"</li>
                  </ol>
                </div>

                {/* Server Not Running Help */}
                {serverStatus.includes("Offline") && (
                  <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">Server Not Running!</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      The backend server needs to be started. Here's how:
                    </p>
                    <div className="bg-black/40 p-3 rounded font-mono text-xs text-green-400">
                      <p>1. Open VS Code Terminal (Ctrl + `)</p>
                      <p>2. Type: npm run dev</p>
                      <p>3. Press Enter</p>
                      <p>4. Wait for "serving on port 5000"</p>
                      <p>5. Come back and click "Check Server"</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
