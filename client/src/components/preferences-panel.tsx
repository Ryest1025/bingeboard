import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { getFirestore, doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import app from "@/firebase/config";

// Genre options
const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (preferences: {
    favoriteGenres: number[];
    viewingStyle: string[];
    defaultRecommendationMode: string;
  }) => void;
}

interface UserPreferences {
  favoriteGenres: number[];
  viewingStyle: string[];
  defaultRecommendationMode: string;
}

export default function PreferencesPanel({ isOpen, onClose, onSave }: PreferencesPanelProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [viewingPreferences, setViewingPreferences] = useState<string[]>([]);
  
  // Initialize Firestore
  const db = getFirestore(app);
  
  // React Query mutation for saving preferences
  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      if (isAuthenticated && user) {
        try {
          // Save to Firebase Firestore first
          const userDocRef = doc(db, "userPreferences", user.id);
          
          // Check if document exists
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            // Update existing document
            await updateDoc(userDocRef, {
              preferences: preferences,
              updatedAt: new Date(),
            });
            console.log('✅ Preferences updated in Firestore');
          } else {
            // Create new document
            await setDoc(userDocRef, {
              userId: user.id,
              userEmail: user.email,
              preferences: preferences,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            console.log('✅ Preferences created in Firestore');
          }

          // Also save to backend API as backup
          try {
            const response = await fetch('/api/user/preferences', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                userId: user.id,
                preferences: preferences,
              }),
            });

            if (response.ok) {
              console.log('✅ Preferences also saved to backend API');
            }
          } catch (apiError) {
            console.warn('⚠️ Backend API save failed, but Firestore succeeded:', apiError);
          }

          return preferences;
        } catch (firestoreError) {
          console.error('❌ Firestore save failed:', firestoreError);
          
          // Fallback to backend API
          const response = await fetch('/api/user/preferences', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              userId: user.id,
              preferences: preferences,
            }),
          });

          if (!response.ok) {
            throw new Error('Both Firestore and API saves failed');
          }

          console.log('✅ Preferences saved to backend API as fallback');
          return response.json();
        }
      } else {
        // Fallback to localStorage for offline/guest users
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        console.log('💾 Preferences saved to localStorage (offline mode)');
        return preferences;
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch user preferences
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      console.log('✅ Preferences saved successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Failed to save preferences:', error);
      // Final fallback to localStorage
      const preferences = {
        favoriteGenres: selectedGenres,
        viewingStyle: viewingPreferences,
        defaultRecommendationMode: 'ai',
      };
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      console.log('💾 Preferences saved to localStorage as final fallback');
    },
  });

  // Load existing preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        if (isAuthenticated && user) {
          // Try to load from Firestore first
          try {
            const userDocRef = doc(db, "userPreferences", user.id);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              if (data.preferences) {
                setSelectedGenres(data.preferences.favoriteGenres || []);
                setViewingPreferences(data.preferences.viewingStyle || []);
                console.log('✅ Preferences loaded from Firestore');
                return;
              }
            }
          } catch (firestoreError) {
            console.warn('⚠️ Firestore load failed, trying API:', firestoreError);
          }

          // Fallback to API
          try {
            const response = await fetch('/api/user/preferences', {
              credentials: 'include',
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.preferences) {
                setSelectedGenres(data.preferences.favoriteGenres || []);
                setViewingPreferences(data.preferences.viewingStyle || []);
                console.log('✅ Preferences loaded from API');
                return;
              }
            }
          } catch (apiError) {
            console.warn('⚠️ API load failed, using localStorage:', apiError);
          }
        }
        
        // Final fallback to localStorage
        const stored = localStorage.getItem('userPreferences');
        if (stored) {
          const preferences = JSON.parse(stored);
          setSelectedGenres(preferences.favoriteGenres || []);
          setViewingPreferences(preferences.viewingStyle || []);
          console.log('✅ Preferences loaded from localStorage');
        }
      } catch (error) {
        console.warn('Failed to load preferences:', error);
      }
    };

    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen, isAuthenticated, user, db]);
  
  if (!isOpen) return null;

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const toggleViewingPreference = (preference: string) => {
    setViewingPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const handleSave = async () => {
    const preferences: UserPreferences = {
      favoriteGenres: selectedGenres,
      viewingStyle: viewingPreferences,
      defaultRecommendationMode: 'ai'
    };
    
    try {
      console.log('💾 Saving preferences:', preferences);
      
      // Use React Query mutation
      await savePreferencesMutation.mutateAsync(preferences);
      
      // Call parent onSave callback if provided
      if (onSave) {
        await onSave(preferences);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Don't close the modal if there's an error
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="bg-gray-800 max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  className="text-2xl font-bold flex items-center gap-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Heart className="h-6 w-6 text-red-400" />
                  Your Preferences
                </motion.h2>
                <Button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-white text-2xl bg-transparent border-none p-0 h-auto"
                  variant="ghost"
                >
                  ×
                </Button>
              </div>

              {/* Favorite Genres */}
              <motion.div 
                className="mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-lg font-semibold mb-4">What do you love watching?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {genres.map((genre, index) => (
                    <motion.div
                      key={genre.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                    >
                      <Button
                        onClick={() => toggleGenre(genre.id)}
                        variant="secondary"
                        className={`p-3 transition-all duration-200 text-left justify-between h-auto w-full ${
                          selectedGenres.includes(genre.id)
                            ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{genre.name}</div>
                            <div className="text-xs opacity-75">
                              {selectedGenres.includes(genre.id) ? 'Selected' : 'Click to select'}
                            </div>
                          </div>
                          {selectedGenres.includes(genre.id) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                            </motion.div>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Preferences */}
              <motion.div 
                className="mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-semibold mb-4">How do you like to watch?</h3>
                <div className="space-y-3">
                  {[
                    { id: 'binge-worthy', title: 'Binge-worthy series', desc: 'Shows with multiple seasons to dive into' },
                    { id: 'quick-watches', title: 'Quick watches', desc: 'Movies and limited series under 3 hours' },
                    { id: 'highly-rated', title: 'Highly rated only', desc: 'Only show me content rated 7.5+ on IMDb' },
                    { id: 'new-releases', title: 'New releases first', desc: 'Prioritize content from the last 2 years' }
                  ].map((preference, index) => (
                    <motion.label 
                      key={preference.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 rounded-lg ${
                        viewingPreferences.includes(preference.id) 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                    >
                      <input 
                        type="checkbox" 
                        className="w-4 h-4"
                        checked={viewingPreferences.includes(preference.id)}
                        onChange={() => toggleViewingPreference(preference.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{preference.title}</div>
                        <div className="text-xs opacity-75">{preference.desc}</div>
                      </div>
                      {viewingPreferences.includes(preference.id) && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Check className="h-4 w-4" />
                        </motion.div>
                      )}
                    </motion.label>
                  ))}
                </div>
              </motion.div>

          {/* Save Button */}
          <motion.div 
            className="space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              onClick={handleSave}
              disabled={savePreferencesMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 disabled:opacity-50"
              size="lg"
            >
              {savePreferencesMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving Preferences...
                </>
              ) : (
                'Save My Preferences'
              )}
            </Button>
            <div className="text-center">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Cancel and close
              </button>
            </div>
          </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
