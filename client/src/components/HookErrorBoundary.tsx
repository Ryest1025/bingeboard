import React from 'react';

/**
 * Special error boundary specifically designed to catch React hook errors
 * This component doesn't use hooks itself so it can safely catch hook-related errors
 */
class HookErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('⚠️ Hook Error Boundary caught error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Track the error details for display
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render a dedicated error UI for hook errors
      return (
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="text-center space-y-4 max-w-lg p-6 rounded-lg bg-gray-900">
            <div className="text-red-400 text-xl font-bold">React Hook Error</div>
            <div className="text-white text-lg">
              {this.state.error?.message || 'An unexpected error occurred in a React hook'}
            </div>
            
            <div className="text-gray-400 text-sm mt-4">
              This is caused by hooks being called outside of a component context or 
              before React is fully initialized.
            </div>
            
            <div className="flex space-x-4 justify-center mt-6">
              <button
                onClick={() => window.location.reload()}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
              >
                Reload Page
              </button>
              
              <button
                onClick={() => {
                  // Try to safely recover - reinitialize React
                  try {
                    // Force clear error state
                    this.setState({ hasError: false, error: null, errorInfo: null });
                    // Wait a moment to ensure cleanup
                    setTimeout(() => {
                      window.location.href = '/safe-boot.html';
                    }, 100);
                  } catch (e) {
                    // If that fails, just do a hard reload
                    window.location.reload();
                  }
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Safe Mode
              </button>
            </div>
            
            {this.state.errorInfo && (
              <div className="mt-4 text-left">
                <div className="text-red-300 font-medium">Component Stack:</div>
                <pre className="bg-gray-800 p-3 rounded mt-2 text-xs text-gray-300 overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default HookErrorBoundary;
