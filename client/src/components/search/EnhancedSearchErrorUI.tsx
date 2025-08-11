// EnhancedSearchErrorUI.tsx - Error handling UI for enhanced search
import React from 'react';
import { AlertCircle, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface EnhancedSearchErrorUIProps {
  error: Error | null;
  isLoading: boolean;
  onRetry: () => void;
  query?: string;
}

export function EnhancedSearchErrorUI({ 
  error, 
  isLoading, 
  onRetry, 
  query 
}: EnhancedSearchErrorUIProps) {
  if (!error) return null;

  // Determine error type and appropriate messaging
  const getErrorInfo = (error: Error) => {
    const message = error.message?.toLowerCase() || '';
    
    // Network/timeout errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return {
        type: 'network',
        title: 'Connection Issue',
        description: 'Unable to reach search servers. Please check your internet connection.',
        icon: <Wifi className="h-4 w-4" />,
        canRetry: true,
      };
    }
    
    // Server errors (5xx)
    if (message.includes('500') || message.includes('503') || message.includes('server')) {
      return {
        type: 'server',
        title: 'Server Error',
        description: 'Our search service is temporarily unavailable. Please try again in a moment.',
        icon: <AlertCircle className="h-4 w-4" />,
        canRetry: true,
      };
    }
    
    // Rate limiting
    if (message.includes('429') || message.includes('rate limit')) {
      return {
        type: 'rate-limit',
        title: 'Too Many Requests',
        description: 'Please wait a moment before searching again.',
        icon: <AlertCircle className="h-4 w-4" />,
        canRetry: true,
      };
    }
    
    // Client errors (4xx)
    if (message.includes('400') || message.includes('404')) {
      return {
        type: 'client',
        title: 'Search Error',
        description: query 
          ? `Unable to search for "${query}". Please try a different search term.`
          : 'Invalid search request. Please try a different search term.',
        icon: <AlertCircle className="h-4 w-4" />,
        canRetry: false,
      };
    }
    
    // Generic error
    return {
      type: 'generic',
      title: 'Search Failed',
      description: 'Something went wrong with your search. Please try again.',
      icon: <AlertCircle className="h-4 w-4" />,
      canRetry: true,
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
        {errorInfo.icon}
        <AlertTitle className="text-base font-semibold">
          {errorInfo.title}
        </AlertTitle>
        <AlertDescription className="mt-2 text-sm">
          {errorInfo.description}
          
          {errorInfo.canRetry && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isLoading}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
              
              <span className="text-xs text-muted-foreground">
                Searches automatically retry with smart backoff
              </span>
            </div>
          )}
          
          {errorInfo.type === 'network' && (
            <div className="mt-3 text-xs text-muted-foreground">
              <strong>Troubleshooting:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Disable any VPN or proxy temporarily</li>
              </ul>
            </div>
          )}
          
          {errorInfo.type === 'rate-limit' && (
            <div className="mt-3 text-xs text-muted-foreground">
              Our search service has usage limits to ensure good performance for all users.
              Normal searching will resume shortly.
            </div>
          )}
        </AlertDescription>
      </Alert>
      
      {/* Technical details for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            Technical Details (Dev Only)
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify({
              error: error.message,
              stack: error.stack?.split('\n').slice(0, 3),
              query,
              timestamp: new Date().toISOString(),
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

// (No default export to reduce surface area for unused export detection.)
