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
    title: 'Because You Loved Succession',
    subtitle: 'Power dynamics & family drama',
    description: 'Sharp writing, complex characters, and corporate intrigue that matches your taste',
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
    title: 'Weekend Binge-Worthy',
    subtitle: 'Perfect for your Saturday marathon',
    description: 'Addictive series with multiple seasons ready to consume in one sitting',
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
    title: 'Award Season Winners',
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
    title: 'Quick Wins (Under 90 mins)',
    subtitle: 'Perfect for tonight',
    description: 'Satisfying complete stories you can finish before bed',
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
    title: 'Coming Soon',
    subtitle: 'Set your reminders now',
    description: 'Highly anticipated shows and movies launching soon - get reminded when they drop',
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
  {
    key: 'educational-entertaining',
    title: 'Learn Something New',
    subtitle: 'Educational content that doesn\'t feel like school',
    description: 'Documentaries and docuseries that entertain while they educate',
    iconName: 'eye',
    gradient: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-300',
    borderColor: 'border-emerald-500/30',
    reasoning: 'Expands your interests',
    priority: 8,
    moodContext: 'When you want to learn'
  },
  {
    key: 'ai-curated-surprise',
    title: 'AI Curated Surprise',
    subtitle: 'Trust us on this one',
    description: 'Our algorithm found something special that perfectly matches your unique taste',
    iconName: 'star',
    gradient: 'from-pink-500 to-rose-600',
    textColor: 'text-pink-300',
    borderColor: 'border-pink-500/30',
    reasoning: 'Advanced matching algorithm',
    priority: 9,
    personalizedFor: 'Adventurous viewers'
  },
  {
    key: 'leaving-soon',
    title: 'Leaving Soon',
    subtitle: 'Watch before they\'re gone',
    description: 'Quality content that\'s about to expire from streaming platforms',
    iconName: 'clock',
    gradient: 'from-red-500 to-pink-600',
    textColor: 'text-red-300',
    borderColor: 'border-red-500/30',
    reasoning: 'Expiring in the next 30 days',
    priority: 10,
    timeContext: 'Time-sensitive'
  }
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