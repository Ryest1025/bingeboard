import React from 'react';

export interface SmartCategory {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string; // Changed from icon to iconName
  gradient: string;
  textColor: string;
  borderColor: string;
  reasoning: string;
  priority: number;
  personalizedFor?: string;
  timeContext?: string;
  moodContext?: string;
}

// Intelligent category configurations
export const SMART_CATEGORIES: SmartCategory[] = [
  {
    key: 'because-you-loved',
    title: 'Critics Love These (8.0+ Rating)',
    subtitle: 'Exceptional quality & storytelling',
    description: 'Highest rated shows and movies with outstanding reviews and viewer satisfaction',
    iconName: 'heart',
    gradient: 'from-rose-500 to-pink-600',
    textColor: 'text-rose-300',
    borderColor: 'border-rose-500/30',
    reasoning: 'Based on your 5-star rating and 3 rewatches',
    priority: 1,
    personalizedFor: 'Drama lovers',
    moodContext: 'When you want intelligent storytelling'
  },
  {
    key: 'weekend-bingers',
    title: 'Perfect for Binging (Full Series)',
    subtitle: 'Complete TV shows ready to watch',
    description: 'Highly-rated series with multiple seasons available - perfect for marathon viewing',
    iconName: 'coffee',
    gradient: 'from-amber-500 to-orange-600',
    textColor: 'text-amber-300',
    borderColor: 'border-amber-500/30',
    reasoning: 'Most binged shows this weekend',
    priority: 2,
    timeContext: 'Weekend viewing',
    moodContext: 'When you have time to dive deep'
  },
  {
    key: 'award-season-winners',
    title: 'Award-Winning Content (7.5+)',
    subtitle: getCurrentAwardContext().subtitle,
    description: getCurrentAwardContext().description,
    iconName: 'award',
    gradient: 'from-yellow-500 to-amber-600',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-500/30',
    reasoning: getCurrentAwardContext().reasoning,
    priority: 3,
    personalizedFor: 'Quality seekers',
    timeContext: getCurrentAwardContext().timeContext
  },
  {
    key: 'quick-wins',
    title: 'Movies – Complete Stories',
    subtitle: 'Full movies ready to watch',
    description: 'Feature films you can enjoy in one sitting - no commitment to multiple episodes',
    iconName: 'clock',
    gradient: 'from-green-500 to-emerald-600',
    textColor: 'text-green-300',
    borderColor: 'border-green-500/30',
    reasoning: 'Matches your recent viewing patterns',
    priority: 4,
    timeContext: 'Evening viewing',
    moodContext: 'When you want something complete'
  },
  {
    key: 'sports-live-events',
    title: 'Sports & Live Events',
    subtitle: 'Don\'t miss the action',
    description: 'Live sports, breaking news, and special events happening right now',
    iconName: 'zap',
    gradient: 'from-orange-500 to-red-600',
    textColor: 'text-orange-300',
    borderColor: 'border-orange-500/30',
    reasoning: 'Live content you can\'t watch later',
    priority: 5,
    timeContext: 'Live now',
    moodContext: 'Real-time excitement'
  },
  {
    key: 'upcoming-with-reminders',
    title: 'Coming Soon – Set Reminders',
    subtitle: 'Upcoming releases you won\'t want to miss',
    description: 'New shows and movies launching soon - tap to set reminders for when they premiere',
    iconName: 'calendar',
    gradient: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500/30',
    reasoning: 'Based on your wishlisted content',
    priority: 6,
    timeContext: 'Future releases',
    moodContext: 'Anticipation building'
  },
  {
    key: 'friends-are-watching',
    title: 'Your Friends Are Watching',
    subtitle: 'Stay in the conversation',
    description: 'Shows your connected friends are currently enjoying and discussing',
    iconName: 'users',
    gradient: 'from-indigo-500 to-purple-600',
    textColor: 'text-indigo-300',
    borderColor: 'border-indigo-500/30',
    reasoning: 'From 12 friends\' activity',
    priority: 7,
    personalizedFor: 'Social viewers'
  },

];

// Smart award season context based on current date
function getCurrentAwardContext() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  
  // Award season calendar
  if (month >= 1 && month <= 3) {
    // Oscars season (Jan-Mar)
    return {
      subtitle: 'Oscar contenders & winners',
      description: 'Films in the awards conversation and recent Academy Award winners',
      reasoning: 'Oscar season is here - catch the buzz',
      timeContext: 'Awards season'
    };
  } else if (month >= 9 && month <= 10) {
    // Emmy season (Sep-Oct)
    return {
      subtitle: 'Emmy nominated series',
      description: 'Outstanding television recognized by the Television Academy',
      reasoning: 'Emmy season highlights the best of TV',
      timeContext: 'Television awards season'
    };
  } else if (month >= 11 && month <= 12) {
    // Pre-awards buzz (Nov-Dec)
    return {
      subtitle: 'Awards season contenders',
      description: 'Shows and films generating early awards buzz and critical acclaim',
      reasoning: 'Getting ahead of awards season',
      timeContext: 'Pre-awards buzz'
    };
  } else {
    // General awards winners (rest of year)
    return {
      subtitle: 'Award-winning content',
      description: 'Recent winners from major awards ceremonies and critical darlings',
      reasoning: 'Celebrate excellence in entertainment',
      timeContext: 'Celebrating the best'
    };
  }
}

// Helper function to get categories based on user context
export const getPersonalizedCategories = (
  userPreferences?: {
    favoriteGenres?: string[];
    recentActivity?: string[];
    moodPreference?: string;
    timeAvailable?: number;
    socialLevel?: 'high' | 'medium' | 'low';
  }
): SmartCategory[] => {
  let categories = [...SMART_CATEGORIES];
  
  // Reorder based on user context
  if (userPreferences?.timeAvailable && userPreferences.timeAvailable < 120) {
    // Prioritize quick content
    categories = categories.sort((a, b) => {
      if (a.key === 'quick-wins') return -1;
      if (b.key === 'quick-wins') return 1;
      return a.priority - b.priority;
    });
  }
  
  // Filter based on social preferences
  if (userPreferences?.socialLevel === 'high') {
    categories = categories.filter(cat => 
      cat.key !== 'friends-are-watching' || 
      cat.personalizedFor !== 'Social viewers'
    );
  }
  
  return categories.slice(0, 8); // Return top 8 categories
};

// Export for use in other components
export default SMART_CATEGORIES;