import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useContinueWatching } from '@/hooks/useViewingHistory';
import { usePersonalizedAIRecommendations } from '@/hooks/usePersonalizedAI';

export default function PersonalizedRecommendationsTest() {
  const { user, isAuthenticated } = useAuth();
  
  // Get user preferences
  const { data: userPreferences } = useQuery({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/preferences", { credentials: 'include' });
      if (!res.ok) throw new Error("Failed to fetch preferences");
      return res.json();
    },
    enabled: !!isAuthenticated,
  });

  // Get viewing history
  const { data: viewingHistory } = useContinueWatching();

  // Get personalized AI recommendations
  const { 
    data: aiRecommendations, 
    isLoading: aiLoading, 
    error: aiError 
  } = usePersonalizedAIRecommendations(userPreferences, viewingHistory, user, isAuthenticated);

  if (!isAuthenticated) {
    return <div>Please log in to see personalized recommendations</div>;
  }

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">🎯 Personalized AI Recommendations Test</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">📊 User Data Status:</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ User: {user?.email}</li>
          <li>📋 Preferences loaded: {userPreferences ? "✅" : "⏳"}</li>
          <li>🎬 Preferred genres: {userPreferences?.preferredGenres?.join(", ") || "Loading..."}</li>
          <li>📺 Viewing history: {viewingHistory ? `✅ ${viewingHistory.length} items` : "⏳"}</li>
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">🤖 AI Recommendations Status:</h3>
        {aiLoading && <p className="text-yellow-400">⏳ Loading personalized recommendations...</p>}
        {aiError && <p className="text-red-400">❌ Error: {aiError.message}</p>}
        {aiRecommendations && (
          <div>
            <p className="text-green-400">✅ Loaded {aiRecommendations.recommendations?.length || 0} personalized recommendations</p>
            <p className="text-sm text-gray-300">🎯 Source: {aiRecommendations.source}</p>
            <p className="text-sm text-gray-300">🧠 Confidence: {aiRecommendations.confidence}</p>
            <p className="text-sm text-gray-300">🎭 AI-powered: {aiRecommendations.ai ? "Yes" : "No"}</p>
          </div>
        )}
      </div>

      {aiRecommendations?.recommendations && (
        <div>
          <h3 className="text-lg font-semibold mb-2">🎬 Your Personalized Recommendations:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiRecommendations.recommendations.slice(0, 8).map((rec: any, index: number) => (
              <div key={rec.showId || index} className="bg-gray-800 p-3 rounded">
                <div className="text-sm font-semibold">{rec.title}</div>
                <div className="text-xs text-gray-400">Score: {rec.score?.toFixed(2)}</div>
                <div className="text-xs text-gray-400">Reason: {rec.reason}</div>
                {rec.matchFactors && (
                  <div className="text-xs text-blue-400 mt-1">
                    🎯 {rec.matchFactors.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
