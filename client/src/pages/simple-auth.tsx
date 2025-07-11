import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Tv } from "lucide-react";
import { SiGoogle } from "react-icons/si";

const auth = getAuth();

export default function SimpleAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createBackendSession = async (user: any) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/firebase-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backend session');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Backend session creation failed:', error);
      throw error;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = isLogin 
        ? await signInWithEmailAndPassword(auth, email, password)
        : await createUserWithEmailAndPassword(auth, email, password);
      
      // Create backend session
      await createBackendSession(result.user);
      
      toast({
        title: isLogin ? "Login Successful" : "Account Created",
        description: isLogin ? "Welcome back!" : "Welcome to BingeBoard!",
      });
      
      setLocation('/');
    } catch (err: any) {
      setError(err.message);
      toast({
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Create backend session
      await createBackendSession(result.user);
      
      toast({
        title: "Login Successful",
        description: "Welcome to BingeBoard!",
      });
      
      setLocation('/');
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Google Login Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-slate-700/50">
        <CardHeader className="text-center space-y-4">
          {/* BingeBoard Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-12 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg border-2 border-slate-500 shadow-lg">
                <div className="absolute inset-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-black text-xl">B</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-slate-600 rounded-full"></div>
                <div className="absolute -bottom-2 left-1/4 w-2 h-2 bg-slate-600 rounded-full"></div>
                <div className="absolute -bottom-2 right-1/4 w-2 h-2 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-black text-white">
              <span className="bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent">Binge</span>
              <span className="text-white font-light">Board</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Entertainment Hub</p>
          </div>
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
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 pl-10"
                  placeholder="your@email.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-slate-400">Or continue with</span>
            </div>
          </div>
          
          <Button 
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full border-slate-700 hover:bg-slate-800"
            disabled={loading}
          >
            <SiGoogle className="h-4 w-4 mr-2" />
            Google
          </Button>
          
          {error && (
            <div className="text-red-400 text-sm text-center p-2 bg-red-500/10 rounded">
              {error}
            </div>
          )}
          
          <div className="text-center text-xs text-slate-500">
            <p>Simple Firebase authentication • No domain restrictions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}