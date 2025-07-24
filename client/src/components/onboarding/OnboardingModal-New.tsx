import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { X, Sparkles, ArrowRight, Star, Zap, Users, Bell, Target, CheckCircle } from "lucide-react";
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
    // Step 4: Viewing Habits
    viewingTime: "",
    bingingStyle: "",
    // Step 5: Platforms
    streamingPlatforms: [] as string[],
    // Step 6: Privacy & Social
    privacy: "private" as "public" | "private" | "friends",
    shareActivity: false,
    findFriends: false,
    // Step 7: Notifications
    notifications: {
      newEpisodes: true,
      friendActivity: true,
      recommendations: true,
      weeklyRecap: false
    },
    // Step 8: Goals & Tracking
    watchingGoals: [] as string[],
    trackingPreferences: [] as string[],
    // Step 9: Complete
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

  const viewingTimes = ["Morning", "Afternoon", "Evening", "Late Night"];

  const bingingStyles = [
    "Marathon viewer (watch entire seasons)",
    "Episode-by-episode (one at a time)",
    "Weekend binger (save up for weekends)",
    "Casual viewer (whenever I have time)"
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
    if (currentStep < 9) {
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
        experience: formData.bingingStyle
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
          <div className="space-y-6 text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to BingeBoard! 🎬</h2>
            <p className="text-gray-300 text-lg">
              Hi {userDisplayName}! Let's personalize your experience in just a few steps.
            </p>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 rounded-lg">
              <p className="text-gray-300">
                We'll help you set up your profile to get the best recommendations
                and connect with friends who share your taste in shows and movies.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Star className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">What genres do you love? 🎭</h2>
              <p className="text-gray-300">Select your favorite genres (choose at least 3)</p>
            </div>

            <div className="w-full">
              <p className="text-sm text-gray-400 mb-3 text-center">
                👆 Scroll to see all genres 👇
              </p>
              <div className="max-h-64 overflow-y-auto border border-slate-600 rounded-lg p-4 bg-slate-800/50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={formData.favoriteGenres.includes(genre) ? "default" : "secondary"}
                      className={`cursor-pointer transition-all duration-200 text-center py-3 px-4 hover:scale-105 ${formData.favoriteGenres.includes(genre)
                          ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white'
                        }`}
                      onClick={() => toggleSelection(genre, 'favoriteGenres')}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Selected: {formData.favoriteGenres.length} / {genres.length} genres
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Zap className="h-12 w-12 text-purple-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">What do you like to watch? 📺</h2>
              <p className="text-gray-300">Select the types of content you enjoy</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {contentTypes.map((type) => (
                <Badge
                  key={type}
                  variant={formData.contentTypes.includes(type) ? "default" : "secondary"}
                  className={`cursor-pointer p-4 text-center transition-all hover:scale-105 ${formData.contentTypes.includes(type)
                      ? "bg-purple-600 text-white"
                      : "bg-slate-700 hover:bg-purple-600/20"
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
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">How do you like to watch? ⏰</h2>
              <p className="text-gray-300">Tell us about your viewing habits</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-3">Preferred viewing time:</label>
                <div className="grid grid-cols-2 gap-3">
                  {viewingTimes.map((time) => (
                    <Button
                      key={time}
                      variant={formData.viewingTime === time ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, viewingTime: time }))}
                      className="transition-all hover:scale-105"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-3">Binge-watching style:</label>
                <div className="space-y-3">
                  {bingingStyles.map((style) => (
                    <Button
                      key={style}
                      variant={formData.bingingStyle === style ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, bingingStyle: style }))}
                      className="w-full text-left justify-start transition-all hover:scale-105"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Which platforms do you use? 📱</h2>
              <p className="text-gray-300">Select your streaming services</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <Badge
                  key={platform}
                  variant={formData.streamingPlatforms.includes(platform) ? "default" : "secondary"}
                  className={`cursor-pointer p-4 text-center transition-all hover:scale-105 ${formData.streamingPlatforms.includes(platform)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 hover:bg-blue-600/20"
                    }`}
                  onClick={() => toggleSelection(platform, 'streamingPlatforms')}
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-teal-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Privacy & Social Settings 🔒</h2>
              <p className="text-gray-300">Control how you interact with others</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-3">Profile visibility:</label>
                <div className="space-y-3">
                  {[
                    { value: 'public' as const, label: 'Public - Anyone can see my activity' },
                    { value: 'friends' as const, label: 'Friends only - Only friends can see my activity' },
                    { value: 'private' as const, label: 'Private - Keep my activity to myself' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={formData.privacy === option.value ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, privacy: option.value }))}
                      className="w-full text-left justify-start transition-all hover:scale-105"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.shareActivity}
                    onChange={(e) => setFormData(prev => ({ ...prev, shareActivity: e.target.checked }))}
                    className="rounded text-teal-600"
                  />
                  <span className="text-white">Share my watching activity with friends</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.findFriends}
                    onChange={(e) => setFormData(prev => ({ ...prev, findFriends: e.target.checked }))}
                    className="rounded text-teal-600"
                  />
                  <span className="text-white">Help me find friends who like similar content</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Bell className="h-12 w-12 text-orange-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences 🔔</h2>
              <p className="text-gray-300">Choose what you'd like to be notified about</p>
            </div>
            <div className="space-y-4">
              {[
                { key: 'newEpisodes' as keyof typeof formData.notifications, label: 'New episodes of shows I\'m watching' },
                { key: 'friendActivity' as keyof typeof formData.notifications, label: 'When friends finish shows or add new ones' },
                { key: 'recommendations' as keyof typeof formData.notifications, label: 'Personalized show and movie recommendations' },
                { key: 'weeklyRecap' as keyof typeof formData.notifications, label: 'Weekly recap of my watching activity' }
              ].map((notification) => (
                <label key={notification.key} className="flex items-center space-x-3 cursor-pointer">
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
                    className="rounded text-orange-500"
                  />
                  <span className="text-white">{notification.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">Your Goals & Tracking 🎯</h2>
              <p className="text-gray-300">What do you want to achieve with BingeBoard?</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-3">My goals:</label>
                <div className="grid grid-cols-1 gap-3">
                  {goals.map((goal) => (
                    <Badge
                      key={goal}
                      variant={formData.watchingGoals.includes(goal) ? "default" : "secondary"}
                      className={`cursor-pointer p-4 text-left transition-all hover:scale-105 ${formData.watchingGoals.includes(goal)
                          ? "bg-red-600 text-white"
                          : "bg-slate-700 hover:bg-red-600/20"
                        }`}
                      onClick={() => toggleSelection(goal, 'watchingGoals')}
                    >
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-white font-medium mb-3">Track my:</label>
                <div className="grid grid-cols-2 gap-3">
                  {trackingOptions.map((option) => (
                    <Badge
                      key={option}
                      variant={formData.trackingPreferences.includes(option) ? "default" : "secondary"}
                      className={`cursor-pointer p-3 text-center transition-all hover:scale-105 ${formData.trackingPreferences.includes(option)
                          ? "bg-teal-600 text-white"
                          : "bg-slate-700 hover:bg-teal-600/20"
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

      case 9:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">You're all set! 🎉</h2>
              <p className="text-gray-300 text-lg">Let's finalize your BingeBoard profile</p>
            </div>
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-white text-xl">Your Profile Summary:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="text-gray-300"><strong>Favorite Genres:</strong> {formData.favoriteGenres.length} selected</p>
                  <p className="text-gray-300"><strong>Content Types:</strong> {formData.contentTypes.length} selected</p>
                  <p className="text-gray-300"><strong>Viewing Time:</strong> {formData.viewingTime || 'Not specified'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300"><strong>Platforms:</strong> {formData.streamingPlatforms.length} selected</p>
                  <p className="text-gray-300"><strong>Privacy:</strong> {formData.privacy}</p>
                  <p className="text-gray-300"><strong>Goals:</strong> {formData.watchingGoals.length} selected</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-300 mb-6">Ready to start your binge-watching journey?</p>
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[95vh] bg-slate-900/95 border border-slate-700 rounded-lg shadow-2xl animate-slide-down flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white font-semibold">
              Step {currentStep} of 9
            </h1>
            <div className="flex space-x-1">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${i + 1 <= currentStep ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-6 border-t border-slate-700">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Previous
            </Button>

            {currentStep < 9 ? (
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={
                  (currentStep === 2 && formData.favoriteGenres.length < 3) ||
                  (currentStep === 3 && formData.contentTypes.length === 0) ||
                  (currentStep === 4 && (!formData.viewingTime || !formData.bingingStyle)) ||
                  (currentStep === 5 && formData.streamingPlatforms.length === 0)
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
