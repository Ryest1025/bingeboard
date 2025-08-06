/**
 * Preferences Panel Component
 * 
 * Enhanced preferences modal with Firebase, React Query, and Framer Motion
 * Refactored for better organization and maintainability
 * Created: August 5, 2025
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Check, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

// Import types and utilities
import type { PreferencesPanelProps, UserPreferences } from "@/types/preferences";
import { PreferencesService } from "@/lib/preferences";
import { GENRES, VIEWING_PREFERENCES, ANIMATION_CONFIG } from "./constants";

export default function PreferencesPanel({ isOpen, onClose, onSave }: PreferencesPanelProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [viewingPreferences, setViewingPreferences] = useState<string[]>([]);
  
  // React Query mutation for saving preferences
  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      if (isAuthenticated && user) {
        const result = await PreferencesService.savePreferences(
          user.id,
          user.email || '',
          preferences
        );
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to save preferences');
        }
        
        return result.preferences;
      } else {
        // Guest user fallback
        const result = PreferencesService.saveToLocalStorage(preferences);
        if (!result.success) {
          throw new Error('Failed to save preferences locally');
        }
        return preferences;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      console.log('✅ Preferences saved successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Failed to save preferences:', error);
    },
  });

  // Load existing preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!isOpen) return;

      try {
        const result = await PreferencesService.loadPreferences(
          isAuthenticated && user ? user.id : undefined
        );
        
        if (result.success && result.preferences) {
          setSelectedGenres(result.preferences.favoriteGenres || []);
          setViewingPreferences(result.preferences.viewingStyle || []);
        } else {
          // Load defaults
          const defaults = PreferencesService.getDefaultPreferences();
          setSelectedGenres(defaults.favoriteGenres);
          setViewingPreferences(defaults.viewingStyle);
        }
      } catch (error) {
        console.warn('Failed to load preferences:', error);
        // Load defaults on error
        const defaults = PreferencesService.getDefaultPreferences();
        setSelectedGenres(defaults.favoriteGenres);
        setViewingPreferences(defaults.viewingStyle);
      }
    };

    loadPreferences();
  }, [isOpen, isAuthenticated, user]);
  
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
      
      await savePreferencesMutation.mutateAsync(preferences);
      
      // Call parent onSave callback if provided
      if (onSave) {
        await onSave(preferences);
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Modal stays open to show error state
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          {...ANIMATION_CONFIG.modal}
        >
          <motion.div 
            className="bg-gray-800 max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl"
            {...ANIMATION_CONFIG.content}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  className="text-2xl font-bold flex items-center gap-2"
                  {...ANIMATION_CONFIG.header}
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
                {...ANIMATION_CONFIG.genreSection}
              >
                <h3 className="text-lg font-semibold mb-4">What do you love watching?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {GENRES.map((genre, index) => (
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
                            <motion.div {...ANIMATION_CONFIG.checkMark}>
                              <Check className="h-4 w-4 ml-2 flex-shrink-0" />
                            </motion.div>
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Viewing Preferences */}
              <motion.div 
                className="mb-8"
                {...ANIMATION_CONFIG.preferencesSection}
              >
                <h3 className="text-lg font-semibold mb-4">How do you like to watch?</h3>
                <div className="space-y-3">
                  {VIEWING_PREFERENCES.map((preference, index) => (
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
                        <motion.div {...ANIMATION_CONFIG.checkMarkRotating}>
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
                {...ANIMATION_CONFIG.saveButton}
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
                
                {savePreferencesMutation.isError && (
                  <div className="text-red-400 text-sm text-center">
                    Failed to save preferences. Changes saved locally.
                  </div>
                )}
                
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
