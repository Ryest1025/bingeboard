import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a simple QueryClient with minimal config to avoid initialization issues
const simpleQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface SafeQueryProviderProps {
  children: React.ReactNode;
}

export function SafeQueryProvider({ children }: SafeQueryProviderProps) {
  // Add safety check for React
  if (!React || !React.useEffect) {
    console.error('❌ React is not properly loaded');
    return <div>Loading React...</div>;
  }

  return (
    <QueryClientProvider client={simpleQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

export { simpleQueryClient as queryClient };
