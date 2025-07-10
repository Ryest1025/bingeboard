import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { SiGoogle, SiFacebook } from "react-icons/si";

export default function LoginSimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { 
            email: formData.email, 
            password: formData.password,
            rememberMe: rememberMe
          }
        : { 
            email: formData.email, 
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: isLogin ? "Login successful" : "Registration successful",
          description: isLogin ? "Welcome back!" : "Account created successfully!",
        });
        
        // If remember me is checked, store login preference
        if (rememberMe && isLogin) {
          localStorage.setItem('rememberLogin', 'true');
          localStorage.setItem('userEmail', formData.email);
        }
        
        setLocation("/");
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password reset email sent",
          description: "Check your email for password reset instructions.",
        });
        setShowForgotPassword(false);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send password reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isMobile = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const handleGoogleAuth = async () => {
    try {
      console.log('Starting Google authentication...');
      // For now, show user that this feature is coming soon
      toast({
        title: "Feature Coming Soon",
        description: "Google authentication will be available soon. Please use email/password for now.",
        variant: "default",
      });
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to start Google authentication",
        variant: "destructive",
      });
    }
  };

  const handleFacebookAuth = async () => {
    try {
      console.log('Starting Facebook authentication...');
      // For now, show user that this feature is coming soon
      toast({
        title: "Feature Coming Soon",
        description: "Facebook authentication will be available soon. Please use email/password for now.",
        variant: "default",
      });
    } catch (error) {
      console.error('Facebook auth error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to start Facebook authentication",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-slate-700/50">
        <CardHeader className="text-center pb-8">
          {/* BingeBoard Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* TV Frame */}
                <div className="w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                  {/* TV Screen */}
                  <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                    <div className="text-sm font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                  </div>
                  {/* TV Base */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
                </div>
              </div>
              
              {/* Brand Name */}
              <div className="block">
                <span className="text-xl sm:text-2xl select-none">
                  <span className="font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Binge
                  </span>
                  <span className="font-light text-white ml-1">Board</span>
                </span>
                <div className="text-xs text-teal-400 font-medium tracking-widest uppercase opacity-75 hidden sm:block">
                  Entertainment Hub
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtitle */}
          <p className="text-gray-400 text-sm">
            {showForgotPassword ? "Reset your password" : (isLogin ? "Welcome back to your entertainment hub" : "Join the ultimate entertainment hub")}
          </p>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm text-center">
                Enter your email address and we'll send you a password reset link.
              </p>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-800/50 border-slate-600/50 text-white pl-10 focus:border-teal-500/50 focus:ring-teal-500/20"
                  required
                />
              </div>
              <Button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                variant="link"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-teal-400 hover:text-teal-300"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-slate-600/50 text-white focus:border-teal-500/50 focus:ring-teal-500/20"
                      required
                    />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-gray-800/50 border-slate-600/50 text-white focus:border-teal-500/50 focus:ring-teal-500/20"
                      required
                    />
                  </>
                )}
                
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-slate-600/50 text-white pl-10 focus:border-teal-500/50 focus:ring-teal-500/20"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-gray-800/50 border-slate-600/50 text-white pl-10 pr-10 focus:border-teal-500/50 focus:ring-teal-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={rememberMe}
                        onCheckedChange={setRememberMe}
                        className="border-slate-600/50 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                      />
                      <label htmlFor="remember-me" className="text-sm text-gray-400">
                        Remember me
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-teal-400 hover:text-teal-300 p-0"
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-semibold"
                >
                  {isLoading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>
              </form>

              {/* Social Login Section */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-black px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleAuth}
                    className="bg-gray-800/50 border-slate-600/50 text-white hover:bg-gray-700/50 hover:border-teal-500/50"
                    disabled={isLoading}
                  >
                    <SiGoogle className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFacebookAuth}
                    className="bg-gray-800/50 border-slate-600/50 text-white hover:bg-gray-700/50 hover:border-teal-500/50"
                    disabled={isLoading}
                  >
                    <SiFacebook className="w-4 h-4 mr-2 text-blue-500" />
                    Facebook
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-teal-400 hover:text-teal-300"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}