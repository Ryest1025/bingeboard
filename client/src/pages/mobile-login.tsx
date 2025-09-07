/**
 * MOBILE-FIRST LOGIN PAGE
 * 
 * This is a simplified, mobile-optimized login page that bypasses
 * all the complex Firebase domain authorization issues.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Tv } from "lucide-react";
import { auth } from "@/firebase/config-simple";

export default function MobileLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

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
          title: isLogin ? "Login Failed" : "Registration Failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Simple mobile detection
  const isMobileDevice = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const deviceType = isMobileDevice() ? "Mobile" : "Desktop";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-slate-700/50">
        <CardHeader className="text-center space-y-4">
          {/* TV-style logo */}
          <div className="flex justify-center">
            <div className="w-16 h-12 relative">
              {/* TV Frame */}
              <div className="w-full h-full bg-slate-600 rounded-lg relative shadow-lg">
                {/* Screen */}
                <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-400 to-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-black text-xl drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>B</span>
                </div>
                {/* Base */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-slate-700 rounded-b"></div>
                {/* Legs */}
                <div className="absolute -bottom-2 left-1/4 w-1 h-1 bg-slate-700"></div>
                <div className="absolute -bottom-2 right-1/4 w-1 h-1 bg-slate-700"></div>
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

          <div className="bg-teal-500/20 text-teal-400 px-3 py-1 rounded-full text-xs">
            {deviceType} Optimized
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <div className="text-center text-xs text-slate-500">
            <p>Secure authentication • No domain issues</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}