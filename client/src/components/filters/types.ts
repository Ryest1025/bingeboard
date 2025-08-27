// Shared filter types for dashboard sections

export interface RecommendationFilters {
  mood?: string;
  genre?: string;
  length?: string;
  platform?: string;
  hideWatched?: boolean;
  liveNow?: boolean; // Added for live content filtering
}

export interface FriendFeedFilters {
  activityTypes: string[];
  closeFriendsOnly: boolean;
}

export interface CustomListFilters {
  visibility: 'all' | 'public' | 'private';
  collaborative: boolean | null;
  tags: string[];
  sortBy: 'updated' | 'shows' | 'alphabetical' | 'created';
}

export interface WatchlistFilters {
  progressStatus: 'all' | 'watching' | 'paused' | 'completed' | 'planned';
  runtime: 'all' | 'short' | 'standard' | 'long';
}
