import { storage } from "../storage";
import type { InsertSocialConnection, InsertContactImport } from "@shared/schema";

// Social Media Friend Discovery Service
export class SocialMediaFriendsService {
  
  // Facebook Friend Discovery
  static async connectFacebook(userId: string, accessToken: string): Promise<any[]> {
    try {
      // Connect to Facebook Graph API
      const response = await fetch(`https://graph.facebook.com/me/friends?access_token=${accessToken}&fields=id,name,email`);
      
      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status}`);
      }
      
      const data = await response.json();
      const friends = data.data || [];
      
      // Store social connection
      await storage.createSocialConnection({
        userId,
        platform: 'facebook',
        socialId: data.id || 'unknown',
        accessToken: this.encryptToken(accessToken),
        isActive: true,
        lastSynced: new Date()
      });
      
      // Import friends as contacts
      const importedContacts = [];
      for (const friend of friends) {
        try {
          const contact = await storage.createContactImport({
            userId,
            contactEmail: friend.email || '',
            contactName: friend.name,
            source: 'facebook'
          });
          importedContacts.push(contact);
        } catch (error) {
          console.log(`Failed to import Facebook friend ${friend.name}:`, error);
        }
      }
      
      return importedContacts;
    } catch (error) {
      console.error('Facebook friend discovery error:', error);
      throw new Error('Failed to discover Facebook friends');
    }
  }
  
  // Instagram Friend Discovery
  static async connectInstagram(userId: string, accessToken: string): Promise<any[]> {
    try {
      // Instagram Basic Display API
      const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store social connection
      await storage.createSocialConnection({
        userId,
        platform: 'instagram',
        socialId: data.id,
        username: data.username,
        accessToken: this.encryptToken(accessToken),
        isActive: true,
        lastSynced: new Date()
      });
      
      // Instagram doesn't provide friends list directly, but we can suggest based on profile
      return [];
    } catch (error) {
      console.error('Instagram connection error:', error);
      throw new Error('Failed to connect Instagram');
    }
  }
  
  // Snapchat Friend Discovery
  static async connectSnapchat(userId: string, username: string): Promise<any[]> {
    try {
      // Snapchat doesn't have a public API for friend discovery
      // We store the username for manual friend suggestions
      await storage.createSocialConnection({
        userId,
        platform: 'snapchat',
        socialId: username,
        username,
        isActive: true,
        lastSynced: new Date()
      });
      
      // Find other BingeBoard users with the same Snapchat username pattern
      const suggestions = await this.findUsersByPlatformUsername('snapchat', username);
      return suggestions;
    } catch (error) {
      console.error('Snapchat connection error:', error);
      throw new Error('Failed to connect Snapchat');
    }
  }
  
  // TikTok Friend Discovery
  static async connectTikTok(userId: string, username: string): Promise<any[]> {
    try {
      // TikTok doesn't have a public API for friend discovery
      // We store the username for manual friend suggestions
      await storage.createSocialConnection({
        userId,
        platform: 'tiktok',
        socialId: username,
        username,
        isActive: true,
        lastSynced: new Date()
      });
      
      // Find other BingeBoard users with similar TikTok usernames
      const suggestions = await this.findUsersByPlatformUsername('tiktok', username);
      return suggestions;
    } catch (error) {
      console.error('TikTok connection error:', error);
      throw new Error('Failed to connect TikTok');
    }
  }
  
  // Find mutual friends across platforms
  static async findMutualFriends(userId: string): Promise<any[]> {
    try {
      const userConnections = await storage.getUserSocialConnections(userId);
      const mutualFriends = [];
      
      for (const connection of userConnections) {
        // Find other users with the same platform connection
        const matches = await storage.findUsersBySocialId(connection.platform, connection.socialId);
        
        for (const match of matches) {
          if (match.userId !== userId) {
            mutualFriends.push({
              user: await storage.getUser(match.userId),
              platform: connection.platform,
              confidence: 0.9 // High confidence for direct platform matches
            });
          }
        }
      }
      
      return mutualFriends;
    } catch (error) {
      console.error('Mutual friends discovery error:', error);
      return [];
    }
  }
  
  // Get friend suggestions based on social connections
  static async getSocialFriendSuggestions(userId: string): Promise<any[]> {
    try {
      const mutualFriends = await this.findMutualFriends(userId);
      const contactMatches = await storage.getContactMatches(userId);
      
      const suggestions = [];
      
      // Add mutual friends from social platforms
      for (const friend of mutualFriends) {
        suggestions.push({
          user: friend.user,
          reason: `Connected on ${friend.platform}`,
          confidence: friend.confidence,
          suggestionType: 'social_platform'
        });
      }
      
      // Add contact matches
      for (const match of contactMatches) {
        suggestions.push({
          user: match.user,
          reason: `In your ${match.source} contacts`,
          confidence: 0.8,
          suggestionType: 'contacts'
        });
      }
      
      return suggestions.slice(0, 20); // Limit to top 20 suggestions
    } catch (error) {
      console.error('Social friend suggestions error:', error);
      return [];
    }
  }
  
  // Helper Methods
  private static encryptToken(token: string): string {
    // In production, use proper encryption
    // For now, we'll use base64 encoding (NOT secure for production)
    return Buffer.from(token).toString('base64');
  }
  
  private static decryptToken(encryptedToken: string): string {
    // In production, use proper decryption
    return Buffer.from(encryptedToken, 'base64').toString();
  }
  
  private static async findUsersByPlatformUsername(platform: string, username: string): Promise<any[]> {
    try {
      // Search for users with similar usernames on the platform
      const connections = await storage.getSocialConnectionsByPlatform(platform);
      
      const suggestions = [];
      for (const conn of connections) {
        if (conn.username && conn.username.toLowerCase().includes(username.toLowerCase())) {
          const user = await storage.getUser(conn.userId);
          if (user) {
            suggestions.push({
              user,
              platform,
              username: conn.username,
              confidence: 0.6
            });
          }
        }
      }
      
      return suggestions;
    } catch (error) {
      console.error('Platform username search error:', error);
      return [];
    }
  }
}