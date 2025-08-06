/**
 * MOBILE-SOCIAL-LOGIN PAGE
 * 
 * This is a mobile-optimized login page with social login support.
 * It's designed to work on mobile devices with HTTP during development.
 * Updated for Codespaces compatibility.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Tv, Info } from "lucide-react";
import { auth, googleProvider } from "@/firebase/config-simple";

export default function MobileSocialLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [envInfo, setEnvInfo] = useState({
    hostname: window.location.hostname,
    origin: window.location.origin,
    protocol: window.location.protocol,
    isHttps: window.location.protocol === 'https:',
    isCodespaces: window.location.hostname.includes('.app.github.dev'),
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    userAgent: navigator.userAgent
  });
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Check for redirect result on load
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          toast({
            title: "Login Successful",
            description: `Welcome ${result.user.displayName || 'to BingeBoard'}!`,
          });
          setUser(result.user);
          setLocation('/');
        }
      } catch (error: any) {
        console.error("Redirect result error:", error);
        toast({
          title: "Authentication Error",
          description: error.message || "Failed to process redirect authentication",
          variant: "destructive",
        });
      }
    };
    
    checkRedirectResult();
    
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, [toast, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    
    setLoading(true);
    
    try {
      const result = isLogin 
        ? await signInWithEmailAndPassword(auth, formData.email, formData.password)
        : await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      if (result.user) {
        toast({
          title: isLogin ? "Login Successful" : "Registration Successful",
          description: isLogin ? "Welcome back!" : "Welcome to BingeBoard!",
        });
        setLocation('/');
      } else {
        toast({
          title: "Authentication Error",
          description: "There was a problem with your credentials.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Authentication Error",
        description: error.message || "There was a problem with authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Use redirect for mobile, popup for desktop
      if (envInfo.isMobile) {
        console.log("📱 Using redirect for mobile device");
        await signInWithRedirect(auth, googleProvider);
        // User will be redirected away, so we won't reach here until they return
        return;
      } else {
        console.log("🖥️ Using popup for desktop device");
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          toast({
            title: "Login Successful",
            description: `Welcome ${result.user.displayName || 'to BingeBoard'}!`,
          });
          setLocation('/');
        }
      }
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast({
        title: "Google Login Failed",
        description: error.message || "There was a problem with Google authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-md bg-slate-950/80 border-slate-800 shadow-xl backdrop-blur-lg">
        <CardHeader className="space-y-2 pb-2">
          <div className="flex justify-center">
            {/* TV-style logo */}
            <div className="w-12 h-10 relative">
              {/* TV Frame */}
              <div className="w-full h-full bg-slate-600 rounded-lg relative shadow-lg">
                {/* Screen */}
                <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-400 to-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-black text-lg drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>B</span>
                </div>
                {/* Base */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-slate-700 rounded-b"></div>
                {/* Legs */}
                <div className="absolute -bottom-2 left-1/4 w-1 h-1 bg-slate-700"></div>
                <div className="absolute -bottom-2 right-1/4 w-1 h-1 bg-slate-700"></div>
              </div>
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold text-white">
            <span className="font-black bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Binge</span>
            <span className="font-light text-white">Board</span>
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Your personal TV and movie tracker
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex space-x-2">
            <Button 
              variant={isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => setIsLogin(true)}
            >
              Log In
            </Button>
            <Button 
              variant={!isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </Button>
          </div>
          
          {/* Google login button */}
          <Button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            <span>{loading ? "Please wait..." : "Continue with Google"}</span>
          </Button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500">or</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="bg-slate-900/50 border-slate-700"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="bg-slate-900/50 border-slate-700"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="bg-slate-900/50 border-slate-700 pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-slate-900/50 border-slate-700 pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? "Please wait..." : isLogin ? "Log In" : "Create Account"}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <Button 
              variant="link" 
              className="text-teal-400 hover:text-teal-300"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign up here" : "Log in here"}
            </Button>
          </div>
          
          <div className="text-center text-xs text-slate-500 mt-4">
            <p>Mobile-optimized login • {envInfo.isHttps ? 'HTTPS Enabled ✅' : 'HTTP Only ⚠️'}</p>
            <p>{envInfo.isCodespaces ? 'Codespaces Environment ☁️' : 'Local Development 💻'}</p>
            <p>{envInfo.isMobile ? 'Mobile Device Detected 📱' : 'Desktop Device Detected 🖥️'}</p>
            {user && <p className="text-green-500 mt-1">Logged in as: {user.displayName || user.email}</p>}
          </div>
          
          {/* Environment Debug Section - Click to expand */}
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer text-slate-500 hover:text-slate-300">
              <Info className="inline h-3 w-3 mr-1" /> Technical Debug Info
            </summary>
            <div className="text-left p-2 bg-slate-900 rounded mt-2 text-slate-300 overflow-auto">
              <p><strong>Domain:</strong> {envInfo.hostname}</p>
              <p><strong>Origin:</strong> {envInfo.origin}</p>
              <p><strong>Protocol:</strong> {envInfo.protocol}</p>
              <p><strong>User Agent:</strong> {envInfo.userAgent.substring(0, 50)}...</p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
