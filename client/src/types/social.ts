export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
  mutualFriends: number;
  commonShows: number;
  recentActivity?: string;
}

export interface Activity {
  id: string;
  user: Friend;
  type: "watched" | "liked" | "added_to_list" | "rated" | "shared";
  content: {
    id: string;
    title: string;
    poster_path: string;
    media_type: "movie" | "tv";
    rating?: number;
  };
  timestamp: string;
  likes: number;
  comments: number;
}
