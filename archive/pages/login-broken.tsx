import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Users, ArrowRight } from "lucide-react";
import { SiFacebook, SiGoogle } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail, user, loading } = useSupabaseAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  // Check for signup URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signup') === 'true') {
      setIsLogin(false);
    }
      .then(async (result) => {
        if (result && result.user) {
          try {
            // Get Firebase ID token and create user in our database
            const idToken = await result.user.getIdToken();
            const response = await apiRequest("POST", "/api/auth/firebase", { idToken });
            const authData = await response.json();
            
            console.log('Firebase auth response:', authData);
            
            toast({
              title: "Success!",
              description: "You've been logged in successfully.",
            });
            
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            
            // Redirect to homepage
            setTimeout(() => {
              setLocation('/');
            }, 1000);
          } catch (error: any) {
            console.error('Backend authentication error:', error);
            toast({
              title: "Authentication Error",
              description: "Failed to complete login process.",
              variant: "destructive",
            });
          }
        }
      })
      .catch((error) => {
        console.error('Authentication redirect error:', error);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      });
  }, [setLocation, toast]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const userCredential = await signInWithEmail(data.email, data.password);
      
      // Get Firebase ID token and create user in our database
      const idToken = await userCredential.user.getIdToken();
      await apiRequest("POST", "/api/auth/firebase", { idToken });
      
      return userCredential.user;
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation("/");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      let errorMessage = error.message || "Please check your credentials and try again.";
      
      // Handle specific Firebase error cases
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email. You may need to sign up first, or try signing in with Google if you used that method before.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again or use Google sign-in if you originally signed up with Google.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled. Please contact support.";
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const userCredential = await signUpWithEmail(
        data.email, 
        data.password, 
        data.firstName, 
        data.lastName
      );
      
      // Get Firebase ID token and create user in our database
      const idToken = await userCredential.user.getIdToken();
      await apiRequest("POST", "/api/auth/firebase", { idToken });
      
      return userCredential.user;
    },
    onSuccess: () => {
      toast({
        title: "Welcome to BingeBoard!",
        description: "Your account has been created successfully.",
      });
      // Invalidate auth queries to trigger refetch and show logged in state
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Redirect to home page where onboarding will trigger
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      
      // Handle specific Firebase error cases
      if (error.code === 'auth/email-already-in-use') {
        toast({
          title: "Account Already Exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        // Switch to login mode
        setIsLogin(true);
      } else {
        toast({
          title: "Registration Failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    // Get the email value from the manual input
    const email = registerForm.getValues('email');
    const submitData = {
      ...data,
      email: email
    };
    console.log('Registration data:', submitData);
    registerMutation.mutate(submitData);
  };

  // Google login function - Server-side OAuth (PERMANENT SOLUTION)
  const handleGoogleLogin = async () => {
    try {
      console.log("Google login clicked - using server-side OAuth");
      // Direct server-side OAuth - no Firebase domain issues
      window.location.href = '/api/auth/google';
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Google Login Failed", 
        description: "Please try again or use Replit authentication.",
        variant: "destructive",
      });
    }
  };

  // Facebook login function - Server-side OAuth (PERMANENT SOLUTION)
  const handleFacebookLogin = async () => {
    try {
      console.log("Facebook login clicked - using server-side OAuth");
      // Direct server-side OAuth - no Firebase domain issues
      window.location.href = '/api/auth/facebook';
    } catch (error: any) {
      console.error("Facebook login error:", error);
      toast({
        title: "Facebook Login Failed",
        description: "Please try again or use Replit authentication.",
        variant: "destructive",
      });
    }
  };



  const handleSocialLogin = (provider: string) => {
    switch (provider) {
      case 'facebook':
        handleFacebookLogin();
        break;
      case 'google':
        handleGoogleLogin();
        break;
      case 'replit':
        console.log('Redirecting to Replit auth...');
        window.location.href = '/api/login';
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)] flex items-center justify-center px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-transparent to-cyan-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(61,212,221,0.15)_0%,transparent_60%)]" />
      
      <div className="relative w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              {/* TV Frame */}
              <div className="w-12 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                {/* TV Screen */}
                <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                  <div className="text-lg font-bold text-white drop-shadow-lg" style={{ textShadow: '0 0 6px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.3)' }}>B</div>
                </div>
                {/* TV Base */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-slate-700 rounded-sm"></div>
                {/* TV Legs */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-slate-600 rounded-sm"></div>
              </div>

            </div>
            <div className="text-3xl font-bold text-white tracking-wide drop-shadow-lg" style={{ textShadow: '0 0 12px rgba(0,0,0,0.8), 0 0 4px rgba(255,255,255,0.2), 1px 1px 2px rgba(0,0,0,0.9)' }}>BingeBoard</div>
          </div>

        </div>

        <Card className="glass-effect border-teal-400/20 backdrop-blur-xl bg-black/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-2xl font-bold">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
            <p className="text-gray-400 text-sm mt-2">
              {isLogin ? "Welcome back! Please sign in to continue." : "Join the community of entertainment enthusiasts."}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Authentication - Always Works */}
            <div className="space-y-3">
              <Button
                onClick={() => handleSocialLogin('replit')}
                className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-400 hover:via-cyan-400 hover:to-blue-400 text-white font-semibold border-0 py-3"
              >
                <div className="w-5 h-5 mr-3 bg-white/20 rounded text-xs flex items-center justify-center">
                  🔧
                </div>
                Continue with Replit
              </Button>
              
              {/* Supabase Social Authentication */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">
                  Continue with your social account:
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={signInWithGoogle}
                    variant="outline"
                    className="w-full glass-effect border-gray-500/30 hover:bg-gray-500/10 text-white py-2 text-sm border-2"
                  >
                    <SiGoogle className="w-4 h-4 mr-2 text-red-500" />
                    Continue with Google
                  </Button>
                  
                  <Button
                    onClick={signInWithFacebook}
                    variant="outline"
                    className="w-full glass-effect border-gray-500/30 hover:bg-gray-500/10 text-white py-2 text-sm border-2"
                  >
                    <SiFacebook className="w-4 h-4 mr-2 text-blue-500" />
                    Continue with Facebook
                  </Button>
                </div>
                <p className="text-xs text-green-400 mt-2">
                  ✓ Secure OAuth authentication via Supabase
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">
                    Alternative login:
                  </p>
                  <Button
                    onClick={() => window.location.href = '/api/login'}
                    variant="outline"
                    className="w-full glass-effect border-teal-500/30 hover:bg-teal-500/10 text-white py-2 text-sm"
                  >
                    <div className="w-4 h-4 mr-2 bg-teal-500 rounded text-xs flex items-center justify-center text-white">
                      R
                    </div>
                    Continue with Replit
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              <Separator className="bg-teal-400/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/40 px-4 text-gray-300 text-sm font-medium backdrop-blur-sm rounded-full">or continue with</span>
              </div>
            </div>

            {/* Email Form */}
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Enter your email"
                              className="pl-10 glass-effect border-white/20 text-white placeholder:text-gray-400"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10 glass-effect border-white/20 text-white placeholder:text-gray-400"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-400 hover:via-cyan-400 hover:to-blue-400 text-white font-semibold py-3"
                  >
                    {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  
                  // Manually validate email since it's outside the form
                  const email = registerForm.getValues('email');
                  if (!email) {
                    toast({
                      title: "Email Required",
                      description: "Please enter your email address.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    toast({
                      title: "Invalid Email",
                      description: "Please enter a valid email address.",
                      variant: "destructive",
                    });
                    return;
                  }
                  
                  // Get other form values and submit
                  const formData = registerForm.getValues();
                  const submitData = {
                    ...formData,
                    email: email
                  };
                  
                  try {
                    await registerMutation.mutateAsync(submitData);
                  } catch (error) {
                    console.error('Registration error:', error);
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">First Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="First name"
                              className="bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 backdrop-blur-sm"
                              autoComplete="given-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Last name"
                              className="bg-slate-900/80 border-slate-700 text-white placeholder:text-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 backdrop-blur-sm"
                              autoComplete="family-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-md text-white placeholder:text-gray-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus:outline-none"
                        value={registerForm.watch('email') || ''}
                        onChange={(e) => registerForm.setValue('email', e.target.value)}
                        autoComplete="email"
                        style={{ pointerEvents: 'auto', userSelect: 'auto' }}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-red-400 text-sm">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10 glass-effect border-white/20 text-white placeholder:text-gray-400"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="pl-10 pr-10 glass-effect border-white/20 text-white placeholder:text-gray-400"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-white"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-400 hover:via-cyan-400 hover:to-blue-400 text-white font-semibold py-3"
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    <Users className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </Form>
            )}

            {/* Toggle between login and signup */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Button
                  variant="link"
                  className="text-teal-400 hover:text-teal-300 p-0 h-auto font-medium underline"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}