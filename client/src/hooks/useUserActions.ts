// /hooks/useUserActions.ts
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export type UseUserActionsHook = {
  addToList: (showId: string | number, mediaType?: string) => Promise<void>;
  removeFromList: (showId: string | number) => Promise<void>;
  toggleRemind: (showId: string | number) => Promise<void>;
  isInList: (showId: string | number) => boolean;
  isReminded: (showId: string | number) => boolean;
  userLists: (string | number)[];
  reminders: (string | number)[];
  loading: boolean;
  error: string | null;
};

// API helper functions
const apiRequest = async (url: string, method: string, body?: any) => {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `API request failed: ${response.status}`);
  }

  return response.json();
};

export function useUserActions(): UseUserActionsHook {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [userLists, setUserLists] = useState<(string | number)[]>([]);
  const [reminders, setReminders] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserLists([]);
      setReminders([]);
      return;
    }

    async function fetchUserData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch watchlist
        const watchlistResponse = await fetch('/api/watchlist', {
          credentials: 'include'
        });
        
        if (watchlistResponse.ok) {
          const watchlistData = await watchlistResponse.json();
          const listIds = watchlistData.items?.map((item: any) => item.showId || item.id) || [];
          setUserLists(listIds);
        }

        // Fetch reminders (if you have a reminders endpoint)
        // For now, using localStorage as fallback
        const savedReminders = localStorage.getItem(`reminders_${user.uid}`);
        if (savedReminders) {
          setReminders(JSON.parse(savedReminders));
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user preferences');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [isAuthenticated, user]);

  const addToList = async (showId: string | number, mediaType: string = 'movie') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your list.",
        variant: "destructive",
      });
      return;
    }

    if (userLists.includes(showId)) {
      return; // Already in list
    }

    // Optimistic update
    setUserLists(prev => [...prev, showId]);
    
    try {
      await apiRequest('/api/watchlist', 'POST', { 
        showId: showId.toString(), 
        type: mediaType 
      });
      
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      
      toast({
        title: "Added to Watchlist",
        description: "Show has been added to your watchlist.",
      });
    } catch (err) {
      // Rollback on error
      setUserLists(prev => prev.filter(id => id !== showId));
      setError(err instanceof Error ? err.message : 'Failed to add to list');
      
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromList = async (showId: string | number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to manage your list.",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    setUserLists(prev => prev.filter(id => id !== showId));
    
    try {
      await apiRequest('/api/watchlist', 'DELETE', { 
        showId: showId.toString() 
      });
      
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      
      toast({
        title: "Removed from Watchlist",
        description: "Show has been removed from your watchlist.",
      });
    } catch (err) {
      // Rollback on error
      setUserLists(prev => [...prev, showId]);
      setError(err instanceof Error ? err.message : 'Failed to remove from list');
      
      toast({
        title: "Error",
        description: "Failed to remove from watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleRemind = async (showId: string | number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to set reminders.",
        variant: "destructive",
      });
      return;
    }

    const isCurrentlyReminded = reminders.includes(showId);
    
    // Optimistic update
    setReminders(prev =>
      isCurrentlyReminded 
        ? prev.filter(id => id !== showId) 
        : [...prev, showId]
    );
    
    try {
      // For now, store reminders in localStorage
      // In production, you'd want an API endpoint for this
      const newReminders = isCurrentlyReminded 
        ? reminders.filter(id => id !== showId)
        : [...reminders, showId];
      
      localStorage.setItem(`reminders_${user.uid}`, JSON.stringify(newReminders));
      
      toast({
        title: isCurrentlyReminded ? "Reminder Removed" : "Reminder Set",
        description: isCurrentlyReminded 
          ? "Reminder has been removed." 
          : "You'll be notified when this show is available.",
      });
    } catch (err) {
      // Rollback on error
      setReminders(prev =>
        isCurrentlyReminded 
          ? [...prev, showId]
          : prev.filter(id => id !== showId)
      );
      setError(err instanceof Error ? err.message : 'Failed to toggle reminder');
      
      toast({
        title: "Error",
        description: "Failed to update reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isInList = (showId: string | number): boolean => {
    return userLists.includes(showId);
  };

  const isReminded = (showId: string | number): boolean => {
    return reminders.includes(showId);
  };

  return { 
    addToList, 
    removeFromList, 
    toggleRemind, 
    isInList,
    isReminded,
    userLists, 
    reminders, 
    loading,
    error
  };
}
