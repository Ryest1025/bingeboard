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
      console.log('Device type:', isMobile() ? 'Mobile' : 'Desktop');
      
      // Use backend OAuth for all devices - this works universally
      window.location.href = '/api/auth/google';
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
      console.log('Device type:', isMobile() ? 'Mobile' : 'Desktop');
      
      // Use backend OAuth for all devices - this works universally
      window.location.href = '/api/auth/facebook';
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
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-white flex items-center justify-center space-x-2">
            <div className="w-8 h-6 bg-gradient-to-br from-teal-500 to-blue-600 rounded flex items-center justify-center">
              <div className="text-xs font-bold text-white">B</div>
            </div>
            <span>{showForgotPassword ? "Reset Password" : (isLogin ? "Login to BingeBoard" : "Create Account")}</span>
          </CardTitle>
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
                  className="bg-gray-800 border-gray-600 text-white pl-10"
                  required
                />
              </div>
              <Button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                variant="link"
                onClick={() => setShowForgotPassword(false)}
                className="w-full text-gray-400 hover:text-gray-300"
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
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-600 text-white"
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
                    className="bg-gray-800 border-gray-600 text-white pl-10"
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
                    className="bg-gray-800 border-gray-600 text-white pl-10 pr-10"
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
                        className="border-gray-600 data-[state=checked]:bg-teal-600"
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
                  className="w-full bg-teal-600 hover:bg-teal-700"
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
                    <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleAuth}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    <SiGoogle className="w-4 h-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFacebookAuth}
                    className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    <SiFacebook className="w-4 h-4 mr-2 text-blue-500" />
                    Facebook
                  </Button>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 text-center">
                  {isMobile() ? "📱 Mobile: Will redirect to provider" : "🖥️ Desktop: Will redirect to provider"}
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