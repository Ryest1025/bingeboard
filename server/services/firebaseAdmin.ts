import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let app: admin.app.App | null = null;

export function initializeFirebaseAdmin() {
  if (app) {
    return app;
  }

  try {
    // Check if we have Firebase Admin key
    const serviceAccountKey = process.env.FIREBASE_ADMIN_KEY;
    
    if (!serviceAccountKey) {
      console.warn('Firebase Admin SDK not initialized: FIREBASE_ADMIN_KEY environment variable not set');
      return null;
    }

    // Parse the service account key
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Initialize Firebase Admin
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || 'bingeboard-73c5f',
    });

    console.log('Firebase Admin SDK initialized successfully');
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

// Get Firebase Admin instance
export function getFirebaseAdmin() {
  if (!app) {
    app = initializeFirebaseAdmin();
  }
  
  if (!app) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  return admin;
}

// Send a push notification (overloaded function for different parameter types)
export async function sendPushNotification(
  tokenOrOptions: string | { title: string; body: string; userId: string; data?: Record<string, any> },
  title?: string,
  body?: string,
  data?: Record<string, string>
): Promise<boolean | { successCount: number; failureCount: number }> {
  try {
    const firebaseApp = initializeFirebaseAdmin();
    if (!firebaseApp) {
      console.error('Firebase Admin not initialized');
      return false;
    }

    // Handle object parameter (from routes)
    if (typeof tokenOrOptions === 'object') {
      const { title: msgTitle, body: msgBody, userId, data: msgData } = tokenOrOptions;
      
      // For now, log the notification - in production you'd get user's FCM tokens from database
      console.log(`Sending notification to user ${userId}: ${msgTitle} - ${msgBody}`);
      console.log('Data:', msgData);
      
      // Return success for development
      return { successCount: 1, failureCount: 0 };
    }

    // Handle individual parameters (direct token usage)
    const message: admin.messaging.Message = {
      token: tokenOrOptions,
      notification: {
        title: title!,
        body: body!,
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: data?.url || '/',
        },
      },
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

// Send push notifications to multiple device tokens
export async function sendBulkPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> {
  try {
    const firebaseApp = initializeFirebaseAdmin();
    if (!firebaseApp) {
      console.error('Firebase Admin not initialized');
      return { successCount: 0, failureCount: tokens.length };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: data?.url || '/',
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} messages, ${response.failureCount} failures`);
    
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
}

// Send notification to all users who follow a specific show
export async function sendShowNotification(
  showId: number,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  try {
    // This would require getting all FCM tokens for users who have the show in their watchlist
    // Implementation would depend on your database structure
    console.log(`Sending show notification for show ${showId}: ${title}`);
    
    // For now, we'll just log the notification
    // In a real implementation, you'd:
    // 1. Query database for users with this show in watchlist
    // 2. Get their FCM tokens
    // 3. Send bulk notification
  } catch (error) {
    console.error('Error sending show notification:', error);
  }
}

// Send personalized recommendation notification
export async function sendRecommendationNotification(
  userId: string,
  showTitle: string,
  reason: string
): Promise<void> {
  try {
    // This would require getting the user's FCM token from the database
    console.log(`Sending recommendation notification to user ${userId}: ${showTitle} - ${reason}`);
    
    // For now, we'll just log the notification
    // In a real implementation, you'd:
    // 1. Get user's FCM token from database
    // 2. Send personalized notification
  } catch (error) {
    console.error('Error sending recommendation notification:', error);
  }
}

export { admin };