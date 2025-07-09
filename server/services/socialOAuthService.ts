import { storage } from '../storage';

export interface SocialMediaFriend {
  platform: 'facebook' | 'instagram' | 'snapchat' | 'tiktok';
  platformId: string;
  name: string;
  profilePicture?: string;
  username?: string;
}

export class SocialOAuthService {
  static async processFacebookFriends(accessToken: string, userId: string): Promise<SocialMediaFriend[]> {
    try {
      // Get user's friends from Facebook
      const friendsResponse = await fetch(`https://graph.facebook.com/v18.0/me/friends?access_token=${accessToken}&fields=id,name,picture`);
      const friendsData = await friendsResponse.json();

      if (!friendsData.data) {
        return [];
      }

      const friends: SocialMediaFriend[] = friendsData.data.map((friend: any) => ({
        platform: 'facebook' as const,
        platformId: friend.id,
        name: friend.name,
        profilePicture: friend.picture?.data?.url,
      }));

      // Store social media connections in database
      await this.storeSocialConnections(userId, 'facebook', friends);

      // Find mutual friends who are also BingeBoard users
      const mutualFriends = await this.findMutualFriends(friends, 'facebook');
      
      // Create friend suggestions
      await this.createFriendSuggestions(userId, mutualFriends);

      return friends;
    } catch (error) {
      console.error('Error processing Facebook friends:', error);
      return [];
    }
  }

  static async processInstagramConnections(accessToken: string, userId: string): Promise<void> {
    try {
      // Instagram Basic Display API doesn't provide friend lists
      // We can only get user's own profile information
      const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      const userData = await userResponse.json();

      if (userData.id) {
        // Store Instagram connection
        await storage.updateUser(userId, {
          instagramId: userData.id,
          instagramUsername: userData.username,
        });
      }
    } catch (error) {
      console.error('Error processing Instagram connection:', error);
    }
  }

  static async processSnapchatConnection(accessToken: string, userId: string): Promise<void> {
    try {
      // Get user profile from Snapchat
      const userResponse = await fetch(`https://kit.snapchat.com/v1/me?query={me{displayName,externalId}}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      const userData = await userResponse.json();

      if (userData.data?.me) {
        // Store Snapchat connection
        await storage.updateUser(userId, {
          snapchatId: userData.data.me.externalId,
          snapchatUsername: userData.data.me.displayName,
        });
      }
    } catch (error) {
      console.error('Error processing Snapchat connection:', error);
    }
  }

  static async processTikTokConnection(accessToken: string, userId: string): Promise<void> {
    try {
      // Get user info from TikTok
      const userResponse = await fetch(`https://open-api.tiktok.com/user/info/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          fields: ['open_id', 'display_name', 'avatar_url'],
        }),
      });
      const userData = await userResponse.json();

      if (userData.data?.user) {
        // Store TikTok connection
        await storage.updateUser(userId, {
          tiktokId: userData.data.user.open_id,
          tiktokUsername: userData.data.user.display_name,
        });
      }
    } catch (error) {
      console.error('Error processing TikTok connection:', error);
    }
  }

  private static async storeSocialConnections(userId: string, platform: string, friends: SocialMediaFriend[]): Promise<void> {
    // Store the social media connections for later friend discovery
    try {
      for (const friend of friends) {
        await storage.createContactImport({
          userId,
          platform,
          contactData: {
            name: friend.name,
            platformId: friend.platformId,
            profilePicture: friend.profilePicture,
            username: friend.username,
          },
          source: 'oauth',
          processedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error storing social connections:', error);
    }
  }

  private static async findMutualFriends(friends: SocialMediaFriend[], platform: string): Promise<SocialMediaFriend[]> {
    const mutualFriends: SocialMediaFriend[] = [];

    try {
      for (const friend of friends) {
        // Check if this friend is also a BingeBoard user
        let existingUser;
        
        if (platform === 'facebook') {
          existingUser = await storage.getUserByFacebookId(friend.platformId);
        } else if (platform === 'instagram') {
          existingUser = await storage.getUserByInstagramId(friend.platformId);
        }
        // Add more platform checks as needed

        if (existingUser) {
          mutualFriends.push(friend);
        }
      }
    } catch (error) {
      console.error('Error finding mutual friends:', error);
    }

    return mutualFriends;
  }

  private static async createFriendSuggestions(userId: string, mutualFriends: SocialMediaFriend[]): Promise<void> {
    try {
      for (const friend of mutualFriends) {
        let friendUserId;
        
        if (friend.platform === 'facebook') {
          const user = await storage.getUserByFacebookId(friend.platformId);
          friendUserId = user?.id;
        } else if (friend.platform === 'instagram') {
          const user = await storage.getUserByInstagramId(friend.platformId);
          friendUserId = user?.id;
        }

        if (friendUserId) {
          await storage.createFriendSuggestion({
            userId,
            suggestedUserId: friendUserId,
            suggestionType: 'social_media',
            mutualFriendCount: 1,
            confidence: 0.9,
            reason: `Connected on ${friend.platform}`,
          });
        }
      }
    } catch (error) {
      console.error('Error creating friend suggestions:', error);
    }
  }
}