// Firebase messaging - properly configured
import { getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import { messaging } from './config';

// VAPID key - will be provided via environment variable
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  click_action?: string;
  data?: Record<string, any>;
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.log('Firebase messaging not available');
    return null;
  }

  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers are not supported');
      return null;
    }

    // Register service worker first
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service worker registered successfully:', registration.scope);
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
    } catch (swError) {
      console.error('Service worker registration failed:', swError);
      // Continue anyway as notifications might still work
    }

    // Check current permission status
    let permission = Notification.permission;
    
    // Only request permission if not already decided
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    if (permission === 'granted') {
      // Get FCM token - VAPID key is optional for development
      const tokenOptions: any = {};
      if (VAPID_KEY) {
        tokenOptions.vapidKey = VAPID_KEY;
      }
      
      const token = await getToken(messaging, tokenOptions);
      
      if (token) {
        console.log('FCM Token generated successfully');
        return token;
      } else {
        console.log('No FCM token available');
        return null;
      }
    } else {
      console.log('Notification permission not granted:', permission);
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, callback);
};

// Send token to server for storage
export const sendTokenToServer = async (token: string, userId: string) => {
  try {
    const response = await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token,
        userId,
        platform: 'web',
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to register FCM token');
    }

    console.log('FCM token registered successfully');
  } catch (error) {
    console.error('Error sending token to server:', error);
  }
};

// Subscribe to topic notifications
export const subscribeToTopic = async (topic: string) => {
  try {
    await fetch('/api/notifications/subscribe-topic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error('Error subscribing to topic:', error);
  }
};

// Show notification in browser
export const showNotification = (payload: NotificationPayload) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/logo-192.png',
      badge: payload.badge || '/badge-icon.png',
      tag: payload.data?.tag || 'bingeboard-notification',
      requireInteraction: false,
      silent: false,
    });

    // Handle notification click
    notification.onclick = () => {
      if (payload.click_action) {
        window.open(payload.click_action, '_blank');
      }
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }
};