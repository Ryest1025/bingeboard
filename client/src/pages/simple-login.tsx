import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset
} from "../lib/auth";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebase/config";

export default function SimpleLogin() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  const showError = (message: string) => {
    setError(message);
    setSuccess(null);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    console.log("✅", message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      showError('Please enter your email address first');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(formData.email);
      showSuccess('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithGoogle();
      showSuccess(`Welcome ${user.displayName || user.email}!`);
      setLocation('/'); // Redirect to dashboard after login
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await signInWithFacebook();
      showSuccess(`Welcome ${user.displayName || user.email}!`);
      setLocation('/'); // Redirect to dashboard after login
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign in with email/password
        const user = await signInWithEmail(formData.email, formData.password);
        showSuccess(`Welcome back ${user.email}!`);
        setLocation('/');
      } else {
        // Sign up with email/password
        const displayName = `${formData.firstName} ${formData.lastName}`.trim();
        const user = await signUpWithEmail(
          formData.email,
          formData.password,
          displayName || undefined
        );
        showSuccess(`Account created for ${user.email}!`);
        setLocation('/');
      }
    } catch (err: any) {
      // Enhanced error handling for account conflicts
      if (err.message.includes('registered with') || err.message.includes('invalid-login-credentials')) {
        try {
          // Check what sign-in methods are available
          const methods = await fetchSignInMethodsForEmail(auth, formData.email);
          if (methods.length > 0) {
            const hasGoogle = methods.some(method => method.includes('google'));
            const hasFacebook = methods.some(method => method.includes('facebook'));
            const hasPassword = methods.some(method => method === 'password');

            if ((hasGoogle || hasFacebook) && !hasPassword && isLogin) {
              const providers = [];
              if (hasGoogle) providers.push('Google');
              if (hasFacebook) providers.push('Facebook');

              showError(`This email was registered with ${providers.join(' and ')}. Please use the "${providers[0]} Sign-in" button above instead.`);
            } else {
              showError(err.message);
            }
          } else {
            showError(err.message);
          }
        } catch (checkError) {
          showError(err.message);
        }
      } else {
        showError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
              <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-sm flex items-center justify-center">
                <div className="text-xs font-black text-white">B</div>
              </div>
            </div>
            <span className="text-lg font-bold text-white">
              <span className="font-black">Binge</span>
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent font-light">Board</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Login Form */}
      <Card className="w-full max-w-md glass-effect border-slate-700/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-gray-400">
            {isLogin ? "Sign in to your account" : "Sign up for BingeBoard"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
              {success}
            </div>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">Reset Password</h3>
                <p className="text-gray-400 text-sm">Enter your email to receive a password reset link</p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Send Reset Email
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="border-slate-700 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-white/5 hover:bg-white/10 text-white"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <SiGoogle className="h-4 w-4 mr-2" />
                  )}
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-700 bg-blue-600/20 hover:bg-blue-600/30 text-white"
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <SiFacebook className="h-4 w-4 mr-2" />
                  )}
                  Continue with Facebook
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-950 px-2 text-slate-400">Or</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <Input
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Remember Me */}
                {isLogin && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    isLogin ? "Sign In" : "Create Account"
                  )}
                </Button>
              </form>

              {/* Forgot Password Link */}
              {isLogin && (
                <div className="text-center">
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </>
          )}

          {/* Toggle Login/Signup */}
          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </button>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/">
              <button className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                ← Back to Home
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
