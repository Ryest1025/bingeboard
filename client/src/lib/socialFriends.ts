// Social network friend discovery utilities

export interface SocialFriend {
  id: string;
  name: string;
  profileImage?: string;
  platform: 'replit' | 'github' | 'twitter' | 'discord';
  username: string;
  mutualFriends?: number;
  isOnBingeBoard?: boolean;
  bio?: string;
}

export interface SocialConnection {
  platform: string;
  isConnected: boolean;
  username?: string;
  profileUrl?: string;
}

// Mock social friends data - In production, this would integrate with social APIs
const MOCK_SOCIAL_FRIENDS: SocialFriend[] = [
  {
    id: '1',
    name: 'Alex Chen',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    platform: 'replit',
    username: 'alexchen',
    mutualFriends: 3,
    isOnBingeBoard: true,
    bio: 'Full-stack developer who loves sci-fi shows'
  },
  {
    id: '2',
    name: 'Sarah Kim',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    platform: 'github',
    username: 'sarahkim',
    mutualFriends: 5,
    isOnBingeBoard: true,
    bio: 'Frontend engineer, anime enthusiast'
  },
  {
    id: '3',
    name: 'Jordan Taylor',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    platform: 'twitter',
    username: 'jordantaylor',
    mutualFriends: 2,
    isOnBingeBoard: false,
    bio: 'UI/UX designer, loves mystery series'
  },
  {
    id: '4',
    name: 'Morgan Lee',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=morgan',
    platform: 'replit',
    username: 'morganlee',
    mutualFriends: 1,
    isOnBingeBoard: true,
    bio: 'Backend developer, binge-watcher extraordinaire'
  },
  {
    id: '5',
    name: 'Casey Johnson',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casey',
    platform: 'discord',
    username: 'casey#1234',
    mutualFriends: 4,
    isOnBingeBoard: false,
    bio: 'Game developer who reviews every show'
  },
  {
    id: '6',
    name: 'Riley Martinez',
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=riley',
    platform: 'github',
    username: 'rileymartinez',
    mutualFriends: 0,
    isOnBingeBoard: true,
    bio: 'DevOps engineer, documentary fan'
  }
];

export async function getSocialFriends(platform?: string): Promise<SocialFriend[]> {
  try {
    const response = await fetch(`/api/social/friends${platform ? `?platform=${platform}` : ''}`);
    if (!response.ok) {
      throw new Error('Failed to fetch social friends');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching social friends:', error);
    return [];
  }
}

export async function searchSocialFriends(query: string): Promise<SocialFriend[]> {
  try {
    const response = await fetch(`/api/social/friends/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search social friends');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching social friends:', error);
    return [];
  }
}

export async function connectSocialAccount(platform: string, authCode?: string): Promise<SocialConnection> {
  try {
    const response = await fetch('/api/social/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, authCode })
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect social account');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error connecting social account:', error);
    throw error;
  }
}

export async function inviteFriendToBingeBoard(friendId: string, message?: string): Promise<boolean> {
  try {
    const response = await fetch('/api/social/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendId, message })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send invitation');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending invitation:', error);
    return false;
  }
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    'replit': '🔧',
    'github': '💻',
    'twitter': '🐦',
    'discord': '💬',
    'facebook': '📘',
    'linkedin': '💼'
  };
  
  return icons[platform] || '👤';
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    'replit': 'bg-orange-500',
    'github': 'bg-gray-700',
    'twitter': 'bg-blue-500',
    'discord': 'bg-indigo-600',
    'facebook': 'bg-blue-600',
    'linkedin': 'bg-blue-700'
  };
  
  return colors[platform] || 'bg-gray-500';
}

export function formatPlatformName(platform: string): string {
  const names: Record<string, string> = {
    'replit': 'Replit',
    'github': 'GitHub',
    'twitter': 'Twitter',
    'discord': 'Discord',
    'facebook': 'Facebook',
    'linkedin': 'LinkedIn'
  };
  
  return names[platform] || platform;
}