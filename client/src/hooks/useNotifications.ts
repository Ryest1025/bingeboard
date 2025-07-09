import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Firebase imports disabled temporarily to fix build issues
// import { MessagePayload } from 'firebase/messaging';
// import { 
//   requestNotificationPermission, 
//   onForegroundMessage, 
//   sendTokenToServer,
//   showNotification
// } from '@/firebase/messaging';

// Mock types for compatibility
interface MessagePayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: { [key: string]: string };
}
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';

export const useNotifications = () => {
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<MessagePayload | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get notification preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['/api/notifications/preferences'],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get notification history
  const { data: history } = useQuery({
    queryKey: ['/api/notifications/history'],
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest('/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/preferences'] });
    },
  });

  // Send test notification mutation
  const sendTestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/notifications/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/history'] });
    },
  });

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const initializeNotifications = async () => {
      try {
        // Check current permission status
        setPermission(Notification.permission);

        // Request permission and get token
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          setToken(fcmToken);
          setPermission('granted');
          
          // Send token to server
          await sendTokenToServer(fcmToken, user.id);
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initializeNotifications();
  }, [isAuthenticated, user?.id]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload);
      setNotification(payload);
      
      // Show browser notification if permission is granted
      if (payload.notification && Notification.permission === 'granted') {
        showNotification({
          title: payload.notification.title || 'BingeBoard',
          body: payload.notification.body || 'You have a new notification',
          icon: payload.notification.icon,
          click_action: payload.data?.click_action,
          data: payload.data,
        });
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Register service worker for background notifications
  useEffect(() => {
    if ('serviceWorker' in navigator && isAuthenticated) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, [isAuthenticated]);

  const clearNotification = () => setNotification(null);

  const requestPermission = async () => {
    try {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken && user?.id) {
        setToken(fcmToken);
        setPermission('granted');
        await sendTokenToServer(fcmToken, user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const updatePreferences = (updates: any) => {
    updatePreferencesMutation.mutate(updates);
  };

  const sendTestNotification = () => {
    sendTestMutation.mutate();
  };

  return {
    // State
    token,
    notification,
    permission,
    preferences,
    history,
    
    // Loading states
    preferencesLoading,
    updatingPreferences: updatePreferencesMutation.isPending,
    sendingTest: sendTestMutation.isPending,
    
    // Actions
    clearNotification,
    requestPermission,
    updatePreferences,
    sendTestNotification,
    
    // Computed
    isEnabled: permission === 'granted' && preferences?.pushNotifications,
    hasToken: !!token,
  };
};