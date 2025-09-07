import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Sparkles, ArrowRight, Star, Zap, Users, Bell, Target, CheckCircle } from "lucide-react";
import { userDataManager } from "../../lib/user-data-manager";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userDisplayName: string;
}

export default function OnboardingModal({ isOpen, onComplete, userDisplayName }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Welcome (no data)
    // Step 2: Favorite Genres
    favoriteGenres: [] as string[],
    // Step 3: Content Types
    contentTypes: [] as string[],
    // Step 4: Platforms (moved from step 5)
    streamingPlatforms: [] as string[],
    // Step 5: Privacy & Social (moved from step 6)
    privacy: "private" as "public" | "private" | "friends",
    shareActivity: false,
    findFriends: false,
    // Step 6: Notifications (moved from step 7)
    notifications: {
      newEpisodes: true,
      friendActivity: true,
      recommendations: true,
      weeklyRecap: false
    },
    // Step 7: Goals & Tracking (moved from step 8)
    watchingGoals: [] as string[],
    trackingPreferences: [] as string[],
    // Step 8: Complete (moved from step 9)
  });

  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
    "Romance", "Sci-Fi", "Thriller", "War", "Western"
  ];

  const contentTypes = [
    "TV Series", "Movies", "Documentaries", "Anime", "Reality TV",
    "Talk Shows", "News", "Sports", "Kids Content", "International"
  ];

  const platforms = [
    "Netflix", "Disney+", "HBO Max", "Amazon Prime", "Hulu", "Apple TV+",
    "Paramount+", "Peacock", "YouTube", "Crunchyroll", "Other"
  ];

  const goals = [
    "Track what I watch", "Discover new content", "Connect with friends",
    "Get personalized recommendations", "Complete my watchlist",
    "Track viewing time", "Rate shows/movies", "Share reviews"
  ];

  const trackingOptions = [
    "Episodes watched", "Time spent watching", "Ratings given",
    "Shows completed", "Movies watched", "Favorite genres", "Viewing streaks"
  ];

  const toggleSelection = (item: string, field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(item)
        ? (prev[field] as string[]).filter((i: string) => i !== item)
        : [...(prev[field] as string[]), item]
    }));
  };

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await userDataManager.updatePreferences({
        favoriteGenres: formData.favoriteGenres,
        watchingGoals: formData.watchingGoals.join(", "),
        experience: "social_user"
      });
      console.log("✅ Onboarding completed successfully");
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      console.error("❌ Error completing onboarding:", error);
      // Still complete onboarding even if save fails
      onComplete();
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-8">
            {/* Hero Icon */}
            <div className="relative mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  BingeBoard
                </span>! 🎬
              </h1>
              <p className="text-xl text-gray-300 max-w-lg mx-auto leading-relaxed">
                Hi {userDisplayName}! Let's personalize your experience to get the best recommendations.
              </p>
            </div>

            {/* Feature Preview */}
            <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-teal-500/20 rounded-2xl p-8 space-y-4">
              <h3 className="text-lg font-semibold text-white">What you'll get:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span>Personalized recommendations</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Smart tracking features</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Connect with friends</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span>Discover new content</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">What genres do you love? 🎭</h2>
              <p className="text-lg text-gray-300">Select your favorite genres (choose at least 3)</p>
            </div>

            {/* Genres Grid */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 bg-slate-800/50 rounded-lg py-2 px-4 inline-block">
                  👆 Scroll to explore all genres 👇
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto bg-slate-800/30 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={formData.favoriteGenres.includes(genre) ? "default" : "secondary"}
                      className={`cursor-pointer transition-all duration-300 text-center py-4 px-6 text-sm font-medium rounded-xl hover:scale-105 ${formData.favoriteGenres.includes(genre)
                          ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg'
                          : 'bg-slate-700/50 hover:bg-slate-600/50 text-gray-300 hover:text-white border border-slate-600/50'
                        }`}
                      onClick={() => toggleSelection(genre, 'favoriteGenres')}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 bg-slate-800/50 rounded-lg py-2 px-4 inline-block">
                  Selected: {formData.favoriteGenres.length} / {genres.length} genres
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">What do you like to watch? 📺</h2>
              <p className="text-lg text-gray-300">Select the types of content you enjoy</p>
            </div>

            {/* Content Types Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {contentTypes.map((type) => (
                <Badge
                  key={type}
                  variant={formData.contentTypes.includes(type) ? "default" : "secondary"}
                  className={`cursor-pointer transition-all duration-300 text-center py-6 px-4 text-sm font-medium rounded-xl hover:scale-105 ${formData.contentTypes.includes(type)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-slate-700/50 hover:bg-purple-500/20 text-gray-300 hover:text-white border border-slate-600/50'
                    }`}
                  onClick={() => toggleSelection(type, 'contentTypes')}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Which platforms do you use? 📱</h2>
              <p className="text-lg text-gray-300">Select your streaming services</p>
            </div>

            {/* Platforms Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <Badge
                  key={platform}
                  variant={formData.streamingPlatforms.includes(platform) ? "default" : "secondary"}
                  className={`cursor-pointer transition-all duration-300 text-center py-6 px-4 text-sm font-medium rounded-xl hover:scale-105 ${formData.streamingPlatforms.includes(platform)
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-slate-700/50 hover:bg-blue-500/20 text-gray-300 hover:text-white border border-slate-600/50'
                    }`}
                  onClick={() => toggleSelection(platform, 'streamingPlatforms')}
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Privacy & Social Settings 🔒</h2>
              <p className="text-lg text-gray-300">Control how you interact with others</p>
            </div>

            <div className="space-y-8">
              {/* Privacy Options */}
              <div className="space-y-4">
                <label className="block text-white font-semibold text-lg">Profile visibility:</label>
                <div className="space-y-3">
                  {[
                    { value: 'public' as const, label: 'Public - Anyone can see my activity', icon: '🌍' },
                    { value: 'friends' as const, label: 'Friends only - Only friends can see my activity', icon: '👥' },
                    { value: 'private' as const, label: 'Private - Keep my activity to myself', icon: '🔒' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={formData.privacy === option.value ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, privacy: option.value }))}
                      className={`w-full text-left justify-start transition-all duration-300 hover:scale-105 py-4 px-6 rounded-xl ${formData.privacy === option.value
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                          : 'bg-slate-700/50 hover:bg-teal-500/20 text-gray-300 hover:text-white border border-slate-600/50'
                        }`}
                    >
                      <span className="mr-3">{option.icon}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Social Features */}
              <div className="space-y-4">
                <label className="block text-white font-semibold text-lg">Social features:</label>
                <div className="space-y-4">
                  <label className="flex items-center space-x-4 cursor-pointer bg-slate-800/30 rounded-xl p-4 hover:bg-slate-700/30 transition-all duration-300">
                    <input
                      type="checkbox"
                      checked={formData.shareActivity}
                      onChange={(e) => setFormData(prev => ({ ...prev, shareActivity: e.target.checked }))}
                      className="w-5 h-5 rounded-lg text-teal-600 focus:ring-teal-500 focus:ring-2"
                    />
                    <span className="text-white font-medium">📊 Share my watching activity with friends</span>
                  </label>
                  <label className="flex items-center space-x-4 cursor-pointer bg-slate-800/30 rounded-xl p-4 hover:bg-slate-700/30 transition-all duration-300">
                    <input
                      type="checkbox"
                      checked={formData.findFriends}
                      onChange={(e) => setFormData(prev => ({ ...prev, findFriends: e.target.checked }))}
                      className="w-5 h-5 rounded-lg text-teal-600 focus:ring-teal-500 focus:ring-2"
                    />
                    <span className="text-white font-medium">🔍 Help me find friends who like similar content</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Notification Preferences 🔔</h2>
              <p className="text-lg text-gray-300">Choose what you'd like to be notified about</p>
            </div>

            {/* Notification Options */}
            <div className="space-y-4">
              {[
                { key: 'newEpisodes' as keyof typeof formData.notifications, label: 'New episodes of shows I\'m watching', icon: '📺' },
                { key: 'friendActivity' as keyof typeof formData.notifications, label: 'When friends finish shows or add new ones', icon: '👥' },
                { key: 'recommendations' as keyof typeof formData.notifications, label: 'Personalized show and movie recommendations', icon: '🎯' },
                { key: 'weeklyRecap' as keyof typeof formData.notifications, label: 'Weekly recap of my watching activity', icon: '📊' }
              ].map((notification) => (
                <label key={notification.key} className="flex items-center space-x-4 cursor-pointer bg-slate-800/30 rounded-xl p-5 hover:bg-slate-700/30 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={formData.notifications[notification.key]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        [notification.key]: e.target.checked
                      }
                    }))}
                    className="w-5 h-5 rounded-lg text-orange-500 focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="mr-3 text-xl">{notification.icon}</span>
                  <span className="text-white font-medium flex-1">{notification.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">Your Goals & Tracking 🎯</h2>
              <p className="text-lg text-gray-300">What do you want to achieve with BingeBoard?</p>
            </div>

            <div className="space-y-8">
              {/* Goals */}
              <div className="space-y-4">
                <label className="block text-white font-semibold text-lg">My goals:</label>
                <div className="grid grid-cols-1 gap-3">
                  {goals.map((goal) => (
                    <Badge
                      key={goal}
                      variant={formData.watchingGoals.includes(goal) ? "default" : "secondary"}
                      className={`cursor-pointer transition-all duration-300 text-left py-4 px-6 text-sm font-medium rounded-xl hover:scale-105 ${formData.watchingGoals.includes(goal)
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                          : 'bg-slate-700/50 hover:bg-red-500/20 text-gray-300 hover:text-white border border-slate-600/50'
                        }`}
                      onClick={() => toggleSelection(goal, 'watchingGoals')}
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tracking Preferences */}
              <div className="space-y-4">
                <label className="block text-white font-semibold text-lg">Track my:</label>
                <div className="grid grid-cols-2 gap-3">
                  {trackingOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={formData.trackingPreferences.includes(option) ? "default" : "secondary"}
                      className={`cursor-pointer transition-all duration-300 text-center py-4 px-4 text-sm font-medium rounded-xl hover:scale-105 ${formData.trackingPreferences.includes(option)
                          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                          : 'bg-slate-700/50 hover:bg-teal-600/20 text-gray-300 hover:text-white border border-slate-600/50'
                        }`}
                      onClick={() => toggleSelection(option, 'trackingPreferences')}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="text-center space-y-8">
            {/* Success Icon */}
            <div className="relative mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
            </div>

            {/* Completion Text */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">You're all set! 🎉</h1>
              <p className="text-xl text-gray-300 max-w-lg mx-auto leading-relaxed">
                Let's finalize your BingeBoard profile
              </p>
            </div>

            {/* Profile Summary */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8 space-y-6">
              <h3 className="text-xl font-semibold text-white">Your Profile Summary:</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-base">
                <div className="space-y-3">
                  <p className="text-gray-300 flex justify-between">
                    <strong>Favorite Genres:</strong>
                    <span className="text-teal-400">{formData.favoriteGenres.length} selected</span>
                  </p>
                  <p className="text-gray-300 flex justify-between">
                    <strong>Content Types:</strong>
                    <span className="text-teal-400">{formData.contentTypes.length} selected</span>
                  </p>
                  <p className="text-gray-300 flex justify-between">
                    <strong>Platforms:</strong>
                    <span className="text-teal-400">{formData.streamingPlatforms.length} selected</span>
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-300 flex justify-between">
                    <strong>Privacy:</strong>
                    <span className="text-teal-400 capitalize">{formData.privacy}</span>
                  </p>
                  <p className="text-gray-300 flex justify-between">
                    <strong>Goals:</strong>
                    <span className="text-teal-400">{formData.watchingGoals.length} selected</span>
                  </p>
                  <p className="text-gray-300 flex justify-between">
                    <strong>Tracking:</strong>
                    <span className="text-teal-400">{formData.trackingPreferences.length} selected</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="space-y-6">
              <p className="text-lg text-gray-300">Ready to start your binge-watching journey?</p>
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Completing Setup...
                  </>
                ) : (
                  <>
                    Complete Setup & Enter BingeBoard 🚀
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = (currentStep / 8) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[95vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col">

        {/* Fixed Header with Progress */}
        <div className="flex-shrink-0 p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 rounded-t-2xl">
          <div className="space-y-6">
            {/* Step Counter */}
            <div className="flex items-center justify-between">
              <h1 className="text-white font-semibold text-lg">
                Step {currentStep} of 8
              </h1>
              <div className="flex space-x-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${i + 1 <= currentStep
                        ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 shadow-lg'
                        : 'bg-gray-600'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {renderStep()}
        </div>

        {/* Fixed Footer with Navigation */}
        <div className="flex-shrink-0 p-8 border-t border-slate-700/50 bg-gradient-to-r from-slate-900/50 to-slate-800/50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-slate-600 text-gray-300 hover:bg-slate-700/50 px-6 py-3 rounded-xl transition-all duration-300"
            >
              Previous
            </Button>

            {currentStep < 8 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white px-8 py-3 text-base font-semibold shadow-lg transition-all duration-300 hover:scale-105 rounded-xl"
                disabled={
                  (currentStep === 2 && formData.favoriteGenres.length < 3) ||
                  (currentStep === 3 && formData.contentTypes.length === 0) ||
                  (currentStep === 4 && formData.streamingPlatforms.length === 0)
                }
              >
                Next Step <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
