import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface SafeQueryProviderProps {
  children: React.ReactNode;
}

export function SafeQueryProvider({ children }: SafeQueryProviderProps) {
  // Create QueryClient inside the component to ensure proper React context
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Export a default client for direct access if needed
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
