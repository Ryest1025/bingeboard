import React, { useState } from "react";
// Firebase imports disabled temporarily to fix build issues
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
// import { auth } from "../firebase/config";

// Mock Firebase auth for compatibility
const auth = null;

export default function LoginWorkingSimple() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSuccess("");

    try {
      if (isLogin) {
        // Login with Firebase
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          setErrors(["Passwords do not match"]);
          return;
        }
        
        // Create user with Firebase
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        setSuccess("Registration successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setErrors([error.message || "Authentication failed"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors([]);
    try {
      const { success, user, error } = await signInWithGoogle();
      if (success && user) {
        // Send Firebase token to backend for session creation
        const token = await user.getIdToken();
        const response = await fetch("/api/auth/firebase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Backend session created:", userData);
        }
      } else if (error) {
        throw new Error(error);
      }
      setSuccess("Google login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      console.error("Google login error:", error);
      setErrors([error.message || "Google login failed"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    setErrors([]);
    try {
      const { success, user, error } = await signInWithFacebook();
      if (success && user) {
        // Send Firebase token to backend for session creation
        const token = await user.getIdToken();
        const response = await fetch("/api/auth/firebase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("Backend session created:", userData);
        }
      } else if (error) {
        throw new Error(error);
      }
      setSuccess("Facebook login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      console.error("Facebook login error:", error);
      setErrors([error.message || "Facebook login failed"]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded flex items-center justify-center mr-3 shadow-lg border-2 border-teal-500">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              BingeBoard
            </h1>
          </div>
          <p className="text-gray-400 text-sm">Entertainment Hub</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
          {/* Toggle Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isLogin 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                !isLogin 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Fields */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-teal-500 focus:outline-none"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-teal-500 focus:outline-none"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-teal-500 focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-teal-500 focus:outline-none pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white focus:border-teal-500 focus:outline-none pr-10"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-700 transition-all disabled:opacity-50"
            >
              {isLoading ? "Loading..." : (isLogin ? "🔑 Log In" : "✨ Register")}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <span className="mr-2">🔍</span>
                Google
              </button>
              <button
                onClick={handleFacebookLogin}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-all disabled:opacity-50"
              >
                <span className="mr-2">📘</span>
                Facebook
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? "New to BingeBoard? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-teal-400 hover:text-teal-300 underline"
            >
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}