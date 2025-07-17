import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { X, Sparkles, ArrowRight, Star, Zap } from "lucide-react";
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
    favoriteGenres: [] as string[],
    watchingGoals: "",
    experience: ""
  });

  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Horror", "Sci-Fi", 
    "Fantasy", "Romance", "Thriller", "Documentary", "Animation", "Crime",
    "Mystery", "War", "Western", "Musical", "Biography", "History"
  ];

  const watchingGoals = [
    "Discover new shows and movies",
    "Keep track of what I've watched",
    "Get personalized recommendations", 
    "Share with friends and family",
    "Find shows similar to my favorites",
    "Track my binge-watching habits"
  ];

  const experiences = [
    "I'm new to tracking what I watch",
    "I've used other tracking apps before",
    "I'm a casual viewer",
    "I'm a serious binge-watcher",
    "I watch everything - movies and TV",
    "I prefer specific genres"
  ];

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await userDataManager.updatePreferences(formData);
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] bg-slate-900/95 border-slate-700 shadow-2xl animate-slide-down overflow-hidden flex flex-col">
        <CardHeader className="relative flex-shrink-0">
          <CardTitle className="text-white text-2xl flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-teal-400" />
            <span>Welcome to BingeBoard, {userDisplayName}! 🎬</span>
          </CardTitle>
          <p className="text-gray-300 mt-2">
            Let's personalize your experience in just 3 quick steps
          </p>
          
          {/* Progress indicator */}
          <div className="flex space-x-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-teal-400 to-blue-400' 
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Favorite Genres */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="text-center">
                <Star className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-white">What are your favorite genres?</h3>
                <p className="text-gray-400">Select all that apply - we'll use this to recommend content</p>
              </div>
              
              {/* Scrollable genres container */}
              <div className="w-full">
                <p className="text-sm text-gray-400 mb-2 text-center">
                  👆 Scroll to see all genres 👇
                </p>
                <div 
                  className="max-h-80 overflow-y-auto overflow-x-hidden border border-slate-600 rounded-lg p-4 bg-slate-800/50 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant={formData.favoriteGenres.includes(genre) ? "default" : "secondary"}
                        className={`cursor-pointer transition-all duration-200 text-center py-3 px-4 hover:scale-105 ${
                          formData.favoriteGenres.includes(genre)
                            ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white'
                        }`}
                        onClick={() => toggleGenre(genre)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Use mouse wheel or touch to scroll through all {genres.length} genres
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <p className="text-sm text-gray-400">
                  {formData.favoriteGenres.length} genres selected
                </p>
                <Button 
                  onClick={handleNext}
                  disabled={formData.favoriteGenres.length === 0}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Watching Goals */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="text-center">
                <Zap className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-white">What's your main goal?</h3>
                <p className="text-gray-400">Help us understand how you want to use BingeBoard</p>
              </div>
              
              <div className="space-y-3">
                {watchingGoals.map((goal) => (
                  <div
                    key={goal}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-102 ${
                      formData.watchingGoals === goal
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, watchingGoals: goal }))}
                  >
                    <p className="text-white font-medium">{goal}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!formData.watchingGoals}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Experience Level */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-white">Tell us about your viewing habits</h3>
                <p className="text-gray-400">Almost done! This helps us customize your experience</p>
              </div>
              
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div
                    key={exp}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-102 ${
                      formData.experience === exp
                        ? 'border-teal-500 bg-teal-500/10'
                        : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, experience: exp }))}
                  >
                    <p className="text-white font-medium">{exp}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleComplete}
                  disabled={!formData.experience || isLoading}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Setup <Sparkles className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
