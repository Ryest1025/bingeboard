// Quick fix for personalized AI recommendations in dashboard
// This replaces the existing AI recommendations logic with proper personalization

import { useQuery } from '@tanstack/react-query';

export const usePersonalizedAIRecommendations = (
  userPreferences: any,
  viewingHistory: any,
  user: any,
  isAuthenticated: boolean
) => {
  // Enhanced loading guard - check for both existence and actual data
  const hasValidPreferences = !!(
    userPreferences && 
    userPreferences.preferredGenres && 
    userPreferences.preferredGenres.length > 0
  );

  // Only fetch when all user data is loaded and valid
  const shouldFetchAiRecs = !!(
    isAuthenticated && 
    hasValidPreferences &&
    viewingHistory !== undefined && // Can be null but not undefined
    user
  );

  return useQuery({
    queryKey: ["/api/ai/recommendations/personalized", userPreferences?.preferredGenres, viewingHistory?.length, user?.id],
    queryFn: async () => {
      // Additional runtime guard
      if (!hasValidPreferences) {
        console.log("⏳ Waiting for valid preferences...");
        throw new Error("Preferences not yet loaded");
      }

      console.log("🎯 Fetching personalized AI recommendations with payload:", {
        genres: userPreferences?.preferredGenres,
        history: viewingHistory,
        user: user?.id,
      });

      const requestPayload = {
        favoriteGenres: userPreferences?.preferredGenres || [],
        mood: 'discover',
        viewingHistory: viewingHistory || [],
        userId: user?.id,
        personalizedRequest: true
      };

      console.log("🤖 AI request payload:", requestPayload);

      try {
        const response = await fetch("/api/ai/recommendations", { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestPayload)
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Personalized AI recommendations received:", data.recommendations?.length || 0, "items");
          console.log("🎯 Recommendation source:", data.source);
          console.log("🧠 AI confidence:", data.confidence);
          return data;
        }
        
        throw new Error(`AI recommendations failed: ${response.status}`);
      } catch (error) {
        console.error("❌ AI recommendations error:", error);
        throw error;
      }
    },
    enabled: shouldFetchAiRecs,
    staleTime: 30000, // 30 seconds - fresh personalized recs
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
