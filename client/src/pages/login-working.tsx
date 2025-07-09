import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Mail, Users } from "lucide-react";
import { SiFacebook, SiGoogle } from "react-icons/si";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginWorking() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Email/Password form handling
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Registration form handling
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

  // Email/Password login handler
  const handleEmailLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setFormErrors([]);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert("Login successful!");
        setLocation("/");
      } else {
        const error = await response.json();
        const errorMessage = error.message || 'Login failed';
        setFormErrors([errorMessage]);
      }
    } catch (error: any) {
      console.error("Email login error:", error);
      setFormErrors([error.message || "Login failed"]);
    } finally {
      setIsLoading(false);
    }
  };

  // Registration handler
  const handleEmailRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setFormErrors([]);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert("Registration successful!");
        setLocation("/");
      } else {
        const error = await response.json();
        const errorMessage = error.message || 'Registration failed';
        setFormErrors([errorMessage]);
      }
    } catch (error: any) {
      console.error("Email registration error:", error);
      setFormErrors([error.message || "Registration failed"]);
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handlers (temporary disable)
  const handleGoogleLogin = async () => {
    alert("Google login temporarily disabled for testing");
  };

  const handleFacebookLogin = async () => {
    alert("Facebook login temporarily disabled for testing");
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-sm flex items-center justify-center mr-3 shadow-lg border-2 border-teal-400">
              <span className="text-white font-black text-xl">B</span>
            </div>
            <h1 className="text-3xl font-black text-white">
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Binge</span>Board
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Entertainment Hub</p>
        </header>

        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-2xl text-white">
              {isLogin ? "Welcome back to" : "Welcome to"} <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-bold">Binge</span>Board
            </CardTitle>
            <p className="text-gray-400 text-sm">
              {isLogin 
                ? "Sign in to continue tracking what you binge" 
                : "Create an account to start tracking what you binge"
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Social Authentication */}
            <section className="space-y-3" aria-label="Social authentication options">
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-base font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                disabled={isLoading}
              >
                <SiGoogle className="w-5 h-5 mr-3 text-white" />
                {isLoading ? "Signing in..." : (isLogin ? "Log In with Google" : "Register with Google")}
              </Button>
              
              <Button
                type="button"
                onClick={handleFacebookLogin}
                variant="outline"
                className="w-full glass-effect border-gray-500/30 hover:bg-gray-500/10 text-white py-3 text-base font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                disabled={isLoading}
              >
                <SiFacebook className="w-5 h-5 mr-3 text-blue-500" />
                {isLoading ? "Signing in..." : (isLogin ? "Log In with Facebook" : "Register with Facebook")}
              </Button>
            </section>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-900 px-2 text-gray-400">Or</span>
              </div>
            </div>

            {/* Toggle between Login and Register */}
            <div className="flex justify-center mb-6 space-x-4">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 font-semibold rounded transition-all duration-200 ${
                  isLogin ? "bg-teal-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                aria-pressed={isLogin}
                type="button"
              >
                Log In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 font-semibold rounded transition-all duration-200 ${
                  !isLogin ? "bg-teal-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                aria-pressed={!isLogin}
                type="button"
              >
                Register
              </button>
            </div>

            {/* Form Error Display */}
            {formErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg" role="alert">
                <ul className="text-sm text-red-400 space-y-1">
                  {formErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conditional Form Rendering */}
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleEmailLogin)} className="space-y-4" noValidate>
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 text-base font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    disabled={isLoading}
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleEmailRegister)} className="space-y-4" noValidate>
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your first name"
                            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your last name"
                            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 text-base font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    {isLoading ? "Creating account..." : "Register"}
                  </Button>
                </form>
              </Form>
            )}

            <footer className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-center text-sm text-gray-400">
                {isLogin ? (
                  <>
                    New to BingeBoard?{" "}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-teal-400 hover:text-teal-300 font-medium underline transition-colors duration-200"
                      type="button"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-teal-400 hover:text-teal-300 font-medium underline transition-colors duration-200"
                      type="button"
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>
            </footer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}