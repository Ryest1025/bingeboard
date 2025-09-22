import React, { useEffect, useState } from 'react';
import StreamingLogoGrid from './StreamingLogoGrid';

const StreamingTest: React.FC = () => {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🧪 StreamingTest: Fetching API data...');
        const res = await fetch('/api/content/trending-enhanced?includeStreaming=true');
        const data = await res.json();
        console.log('🧪 StreamingTest: Raw API response:', data);
        setApiData(data);
      } catch (error) {
        console.error('🧪 StreamingTest: API error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white">Loading streaming test...</div>;
  if (!apiData?.results?.length) return <div className="text-white">No API data found</div>;

  const firstShow = apiData.results[0];
  console.log('🧪 StreamingTest: First show data:', firstShow);

  // Test different property names
  const streamingData = {
    streaming_platforms: firstShow.streaming_platforms,
    streamingPlatforms: firstShow.streamingPlatforms,
    streaming: firstShow.streaming
  };

  console.log('🧪 StreamingTest: Streaming data variants:', streamingData);

  const platforms = firstShow.streaming_platforms || firstShow.streamingPlatforms || firstShow.streaming || [];
  console.log('🧪 StreamingTest: Final platforms array:', platforms);

  const providers = platforms?.map((platform: any, index: number) => ({
    provider_id: platform.provider_id || index + 1,
    provider_name: platform.provider_name,
    logo_path: platform.logo_path || null
  }));

  console.log('🧪 StreamingTest: Transformed providers:', providers);

  return (
    <div className="bg-slate-800 p-4 rounded-lg m-4">
      <h3 className="text-white font-bold mb-2">🧪 Streaming Logo Test</h3>
      <p className="text-gray-300 mb-2">Show: {firstShow.title || firstShow.name}</p>
      <p className="text-gray-400 text-sm mb-4">
        Platforms found: {platforms?.length || 0}
      </p>
      
      <div className="mb-4">
        <h4 className="text-white mb-2">StreamingLogoGrid Component:</h4>
        <StreamingLogoGrid providers={providers} />
      </div>

      <details className="text-xs">
        <summary className="text-gray-400 cursor-pointer">Debug Data</summary>
        <pre className="text-gray-300 mt-2 overflow-auto">
          {JSON.stringify({
            firstShow: {
              title: firstShow.title,
              name: firstShow.name,
              streaming_platforms: firstShow.streaming_platforms,
              streamingPlatforms: firstShow.streamingPlatforms,
              streaming: firstShow.streaming
            },
            transformedProviders: providers
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default StreamingTest;