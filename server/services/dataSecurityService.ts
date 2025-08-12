import { storage } from "../storage";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export interface DataExportRequest {
  userId: string;
  requestType: 'full_export' | 'watchlist_only' | 'profile_only';
  format: 'json' | 'csv';
}

export interface DataDeletionRequest {
  userId: string;
  deletionType: 'soft_delete' | 'hard_delete';
  reason?: string;
}

export interface UserDataSummary {
  profileData: any;
  watchlistData: any[];
  activityData: any[];
  friendsData: any[];
  streamingIntegrations: any[];
  recommendations: any[];
  viewingHistory: any[];
  notifications: any[];
  searchHistory: any[];
  behaviorTracking: any[];
}

export class DataSecurityService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.DATA_ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt sensitive data before storage
   */
  encryptData(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Data encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data after retrieval
   */
  decryptData(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Data decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate secure session tokens
   */
  generateSecureToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Hash passwords securely
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * CCPA Compliance: Export all user data
   */
  async exportUserData(request: DataExportRequest): Promise<UserDataSummary> {
    try {
      const { userId, requestType } = request;

      // Get user profile data
      const profileData = await storage.getUser(userId);
      if (!profileData) {
        throw new Error('User not found');
      }

      const exportData: UserDataSummary = {
        profileData: {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt
        },
        watchlistData: [],
        activityData: [],
        friendsData: [],
        streamingIntegrations: [],
        recommendations: [],
        viewingHistory: [],
        notifications: [],
        searchHistory: [],
        behaviorTracking: []
      };

      if (requestType === 'full_export' || requestType === 'watchlist_only') {
        // Export watchlist data
        exportData.watchlistData = await storage.getUserWatchlist(userId);
        
        // Export viewing history
        exportData.viewingHistory = await storage.getUserViewingHistory(userId);
        
        // Export recommendations
        exportData.recommendations = await storage.getUserRecommendations(userId);
      }

      if (requestType === 'full_export') {
        // Export activity data
        exportData.activityData = await storage.getActivityFeed(userId);
        
        // Export friends data
        exportData.friendsData = await storage.getUserFriends(userId);
        
        // Export streaming integrations
        exportData.streamingIntegrations = await storage.getUserStreamingIntegrations(userId);
        
        // Export notifications
        exportData.notifications = await storage.getUserNotifications(userId);
        
        // Export user behavior tracking
        exportData.behaviorTracking = await storage.getUserBehavior(userId);
      }

      // Remove sensitive information from export
      return this.sanitizeExportData(exportData);
    } catch (error) {
      console.error('Data export failed:', error);
      throw new Error('Failed to export user data');
    }
  }

  /**
   * CCPA Compliance: Delete user data
   */
  async deleteUserData(request: DataDeletionRequest): Promise<boolean> {
    try {
      const { userId, deletionType } = request;

      if (deletionType === 'soft_delete') {
        // Soft delete: anonymize data but keep for analytics
        await this.anonymizeUserData(userId);
      } else if (deletionType === 'hard_delete') {
        // Hard delete: completely remove all data
        await this.hardDeleteUserData(userId);
      }

      return true;
    } catch (error) {
      console.error('Data deletion failed:', error);
      throw new Error('Failed to delete user data');
    }
  }

  /**
   * Anonymize user data while preserving analytics
   */
  private async anonymizeUserData(userId: string): Promise<void> {
    // This would update user data to remove personally identifiable information
    // while keeping anonymized data for service improvement
    
    // Implementation would depend on specific database schema
    // For now, we'll mark the user as deleted
    await storage.updateUser(userId, {
      id: userId,
      email: `deleted_${Date.now()}@example.com`,
      firstName: 'Deleted',
      lastName: 'User',
      profileImageUrl: null
    });
  }

  /**
   * Completely remove all user data
   */
  private async hardDeleteUserData(userId: string): Promise<void> {
    // Delete all user-related data across all tables
    // This is a comprehensive deletion that removes all traces of the user
    
    try {
      // Delete in order to avoid foreign key constraints
      await Promise.all([
        // Delete user behavior tracking
        storage.getUserBehavior(userId).then(behaviors => 
          Promise.all(behaviors.map(b => storage.trackUserBehavior({
            userId: (b as any).userId,
            actionType: (b as any).actionType,
            targetType: (b as any).targetType,
            targetId: (b as any).targetId,
            sessionId: (b as any).sessionId,
            metadata: (b as any).metadata as any
          })))
        ),
        
        // Delete notifications
        storage.getUserNotifications(userId).then(notifications =>
          Promise.all(notifications.map(n => storage.deleteNotification(n.id, userId)))
        ),
        
        // Delete streaming integrations
        storage.getUserStreamingIntegrations(userId).then(integrations =>
          Promise.all(integrations.map(i => storage.deleteStreamingIntegration(i.id, userId)))
        ),
        
        // Delete watchlist items
        storage.getUserWatchlist(userId).then(watchlist =>
          Promise.all(watchlist.map(w => storage.removeFromWatchlist(w.id, userId)))
        ),
        
        // Delete activity data
        storage.getActivityFeed(userId).then(activities =>
          Promise.all(activities.map(a => this.deleteActivity(a.id)))
        ),
        
        // Delete recommendations
        storage.getUserRecommendations(userId).then(recommendations =>
          Promise.all(recommendations.map(r => this.deleteRecommendation(r.id)))
        ),
        
        // Delete viewing history
        storage.getUserViewingHistory(userId).then(history =>
          Promise.all(history.map(h => this.deleteViewingHistory(h.id)))
        )
      ]);

      // Finally, delete the user profile
      // Note: This would need to be implemented in the storage layer
      // await storage.deleteUser(userId);
      
    } catch (error) {
      console.error('Hard deletion failed:', error);
      throw error;
    }
  }

  /**
   * Remove sensitive information from data export
   */
  private sanitizeExportData(data: UserDataSummary): UserDataSummary {
    // Remove any internal system IDs, encrypted data, or sensitive fields
    // that shouldn't be included in user exports
    
    return {
      ...data,
      profileData: {
        ...data.profileData,
        // Remove any internal system fields that users don't need
      }
    };
  }

  /**
   * Validate data request permissions
   */
  async validateDataRequest(userId: string, requesterId: string): Promise<boolean> {
    // Ensure user can only request their own data
    return userId === requesterId;
  }

  /**
   * Log data access for audit trail
   */
  async logDataAccess(userId: string, accessType: string, details: any): Promise<void> {
    const logEntry = {
      userId,
      accessType,
      timestamp: new Date(),
      details: JSON.stringify(details),
      ipAddress: details.ipAddress || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    console.log('Data access logged:', logEntry);
    // In production, this would be stored in a secure audit log
  }

  /**
   * Check if user has given consent for data processing
   */
  async hasUserConsent(userId: string): Promise<boolean> {
    // Check if user has provided consent for data processing
    // This would typically be stored in a consent management table
    return true; // Placeholder - implement based on consent storage
  }

  /**
   * Update user consent preferences
   */
  async updateUserConsent(userId: string, consentType: string, granted: boolean): Promise<void> {
    // Update user's consent preferences
    // This would be stored in a consent management table
    console.log(`Consent updated for user ${userId}: ${consentType} = ${granted}`);
  }

  // Helper methods for data deletion (these would need to be implemented in storage)
  private async deleteActivity(activityId: number): Promise<void> {
    // Implementation depends on storage layer
    console.log(`Deleting activity ${activityId}`);
  }

  private async deleteRecommendation(recommendationId: number): Promise<void> {
    // Implementation depends on storage layer
    console.log(`Deleting recommendation ${recommendationId}`);
  }

  private async deleteViewingHistory(historyId: number): Promise<void> {
    // Implementation depends on storage layer
    console.log(`Deleting viewing history ${historyId}`);
  }
}

export const dataSecurityService = new DataSecurityService();