import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { SiGoogle, SiFacebook } from "react-icons/si";
import { Eye, EyeOff, Mail, Lock, Loader2, User, CheckCircle, Sparkles } from "lucide-react";
import {
  signInWithGoogle,
  signInWithFacebook,
  signUpWithEmail
} from "../lib/auth";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import { userDataManager } from "../lib/user-data-manager";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: signup, 2: onboarding
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    // Onboarding data
    favoriteGenres: [] as string[],
    watchingGoals: "",
    experience: ""
  });

  // Prevent automatic redirects during onboarding
  const [preventRedirect, setPreventRedirect] = useState(false);

  const showError = (message: string) => {
    setError(message);
    setSuccess(null);
    setTimeout(() => setError(null), 6000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError(null);
    console.log("✅", message);
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);
    setPreventRedirect(true);

    try {
      console.log("🚀 Starting Google signup...");
      const user = await signInWithGoogle();
      showSuccess(`Welcome ${user.displayName || user.email}! 🎉`);

      // Add delay to show success message then go to onboarding
      setTimeout(() => {
        console.log("🎯 Moving to onboarding after Google signup...");
        setStep(2);
        setPreventRedirect(false);
      }, 1000);
    } catch (err: any) {
      console.error("❌ Google signup error:", err);
      showError(err.message);
      setPreventRedirect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    setIsLoading(true);
    setError(null);
    setPreventRedirect(true);

    try {
      console.log("🚀 Starting Facebook signup...");
      const user = await signInWithFacebook();
      showSuccess(`Welcome ${user.displayName || user.email}! 🎉`);

      // Add delay to show success message then go to onboarding
      setTimeout(() => {
        console.log("🎯 Moving to onboarding after Facebook signup...");
        setStep(2);
        setPreventRedirect(false);
      }, 1000);
    } catch (err: any) {
      console.error("❌ Facebook signup error:", err);
      showError(err.message);
      setPreventRedirect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPreventRedirect(true); // Prevent any automatic redirects

    try {
      console.log("🚀 Starting email signup process...");
      const displayName = `${formData.firstName} ${formData.lastName}`.trim();
      const user = await signUpWithEmail(
        formData.email,
        formData.password,
        displayName || undefined
      );

      console.log("✅ Signup successful, showing onboarding...");
      showSuccess(`Account created for ${user.email}! Welcome to BingeBoard! 🎉`);

      // Add a small delay to ensure the success message shows
      setTimeout(() => {
        console.log("🎯 Moving to onboarding step...");
        setStep(2);
        setPreventRedirect(false);
      }, 1000);

    } catch (err: any) {
      console.error("❌ Signup error:", err);
      setPreventRedirect(false);

      // Enhanced error handling for account conflicts
      if (err.message.includes('already registered') || err.message.includes('already exists')) {
        try {
          // Check what sign-in methods are available
          const methods = await fetchSignInMethodsForEmail(auth, formData.email);
          if (methods.length > 0) {
            const hasGoogle = methods.some(method => method.includes('google'));
            const hasFacebook = methods.some(method => method.includes('facebook'));

            if (hasGoogle || hasFacebook) {
              const providers = [];
              if (hasGoogle) providers.push('Google');
              if (hasFacebook) providers.push('Facebook');

              showError(`This email is already registered with ${providers.join(' and ')}. Please use the "${providers[0]} Sign-in" button above instead.`);
            } else {
              showError('This email is already registered. Please use the login page instead.');
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

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Initialize user data manager (using localStorage fallback for now)
      await userDataManager.initialize();

      // Save onboarding preferences
      const success = await userDataManager.updatePreferences({
        favoriteGenres: formData.favoriteGenres,
        watchingGoals: formData.watchingGoals,
        experience: formData.experience
      });

      // Also sync to server preferences API if user is authenticated
      try {
        const syncResponse = await fetch('/api/user/preferences/sync-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            onboardingData: {
              favoriteGenres: formData.favoriteGenres,
              watchingGoals: [formData.watchingGoals],
              experience: formData.experience,
              streamingPlatforms: [],
              contentTypes: ["Movies", "TV Series"],
              viewingHabits: {
                preferredTime: "evening",
                bingeDuration: "2-3 hours",
                weeklyGoal: "5-10 hours"
              },
              theme: "dark"
            }
          })
        });

        if (syncResponse.ok) {
          console.log("✅ Onboarding data synced to server successfully");
        }
      } catch (syncError) {
        console.warn("⚠️ Failed to sync onboarding data to server:", syncError);
      }

      if (success) {
        console.log("💾 Saved onboarding data to user profile");
        showSuccess("Profile setup complete! Welcome to BingeBoard! 🚀");

        // Add a nice completion animation delay
        setTimeout(() => {
          console.log("🎯 Navigating to dashboard...");
          setLocation('/');
        }, 1500);
      } else {
        console.warn("⚠️ Failed to save preferences, but continuing to dashboard");
        showSuccess("Welcome to BingeBoard! 🚀");
        setTimeout(() => setLocation('/'), 1500);
      }
    } catch (error) {
      console.error("❌ Error saving onboarding data:", error);
      // Still navigate to dashboard even if save fails
      showSuccess("Welcome to BingeBoard! 🚀");
      setTimeout(() => setLocation('/'), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi",
    "Fantasy", "Romance", "Thriller", "Documentary", "Animation", "Crime"
  ];

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  if (step === 2) {
    // Onboarding Step
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

        <Card className="w-full max-w-2xl glass-effect border-slate-700/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Welcome to BingeBoard! 🎉
            </CardTitle>
            <p className="text-gray-400">
              Let's personalize your experience
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
              {/* Favorite Genres */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  What genres do you love? (Select all that apply)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {genres.map((genre) => (
                    <Button
                      key={genre}
                      type="button"
                      variant={formData.favoriteGenres.includes(genre) ? "default" : "outline"}
                      className={`text-sm ${formData.favoriteGenres.includes(genre)
                        ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                        : "border-slate-700 text-gray-300 hover:text-white"
                        }`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Watching Goals */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  What's your main goal?
                </h3>
                <div className="space-y-2">
                  {[
                    "Discover new shows and movies",
                    "Keep track of what I'm watching",
                    "Get recommendations from friends",
                    "Organize my watchlist",
                    "Just for fun!"
                  ].map((goal) => (
                    <Button
                      key={goal}
                      type="button"
                      variant={formData.watchingGoals === goal ? "default" : "outline"}
                      className={`w-full justify-start text-left ${formData.watchingGoals === goal
                        ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                        : "border-slate-700 text-gray-300 hover:text-white"
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, watchingGoals: goal }))}
                    >
                      {formData.watchingGoals === goal && <CheckCircle className="h-4 w-4 mr-2" />}
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  How would you describe yourself?
                </h3>
                <div className="space-y-2">
                  {[
                    "Casual viewer - I watch occasionally",
                    "Regular watcher - I always have something on",
                    "Binge expert - I finish series in one sitting",
                    "Completionist - I track everything I watch"
                  ].map((exp) => (
                    <Button
                      key={exp}
                      type="button"
                      variant={formData.experience === exp ? "default" : "outline"}
                      className={`w-full justify-start text-left ${formData.experience === exp
                        ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white"
                        : "border-slate-700 text-gray-300 hover:text-white"
                        }`}
                      onClick={() => setFormData(prev => ({ ...prev, experience: exp }))}
                    >
                      {formData.experience === exp && <CheckCircle className="h-4 w-4 mr-2" />}
                      {exp}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700"
                size="lg"
              >
                Complete Setup & Start Exploring
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signup Step
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

      <Card className="w-full max-w-md glass-effect border-slate-700/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Join BingeBoard
          </CardTitle>
          <p className="text-gray-400">
            Start tracking your entertainment journey
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Premium Error/Success Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm backdrop-blur-sm animate-slide-down">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm backdrop-blur-sm animate-slide-down">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-green-400 animate-pulse" />
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          {/* Premium Social Signup Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-slate-700 bg-white/5 hover:bg-white/10 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg group"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <SiGoogle className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              )}
              Sign up with Google
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-700 bg-blue-600/10 hover:bg-blue-600/20 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg group"
              onClick={handleFacebookSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <SiFacebook className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              )}
              Sign up with Facebook
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

          {/* Email Signup Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                  required
                />
              </div>
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

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-400"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Already have account */}
          <div className="text-center">
            <Link href="/login">
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                Already have an account? Sign in
              </button>
            </Link>
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
