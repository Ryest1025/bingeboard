// Debug AI Recommendations - temporary test
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DebugAiRecommendations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Test query with detailed logging
  const { 
    data: recommendationsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["/api/ai-recommendations"],
    queryFn: async () => {
      console.log("🔍 DEBUG: Fetching AI recommendations...");
      try {
        const response = await apiRequest("GET", "/api/ai-recommendations");
        const data = await response.json();
        console.log("🔍 DEBUG: AI recommendations response:", data);
        return data;
      } catch (err) {
        console.error("🔍 DEBUG: AI recommendations error:", err);
        throw err;
      }
    },
    retry: false,
  });

  // Test generate mutation with detailed logging
  const generateMutation = useMutation({
    mutationFn: async () => {
      console.log("🔍 DEBUG: Generating new recommendations...");
      try {
        const response = await apiRequest("POST", "/api/ai-recommendations/generate");
        const data = await response.json();
        console.log("🔍 DEBUG: Generate response:", data);
        return data;
      } catch (err) {
        console.error("🔍 DEBUG: Generate error:", err);
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log("🔍 DEBUG: Generate success:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/ai-recommendations"] });
      toast({
        title: "Debug: Generate Success",
        description: JSON.stringify(data),
      });
    },
    onError: (err) => {
      console.error("🔍 DEBUG: Generate mutation error:", err);
      toast({
        title: "Debug: Generate Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = async () => {
    console.log("🔍 DEBUG: Refresh button clicked");
    try {
      const result = await refetch();
      console.log("🔍 DEBUG: Refresh result:", result);
      toast({
        title: "Debug: Refresh Clicked",
        description: "Check console for details",
      });
    } catch (err) {
      console.error("🔍 DEBUG: Refresh error:", err);
    }
  };

  const handleGenerate = () => {
    console.log("🔍 DEBUG: Generate button clicked");
    generateMutation.mutate();
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
      <h3 className="text-lg font-semibold mb-4">🔍 DEBUG: AI Recommendations</h3>
      
      <div className="space-y-4">
        <div>
          <p><strong>Loading:</strong> {String(isLoading)}</p>
          <p><strong>Error:</strong> {error?.message || 'None'}</p>
          <p><strong>Data:</strong> {JSON.stringify(recommendationsData, null, 2)}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Refreshing..." : "🔄 Refresh"}
          </Button>
          
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? "Generating..." : "✨ Generate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
