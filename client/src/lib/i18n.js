// BingeBoard Internationalization System
// Rule #39: All user-facing strings must use t() function

// Default language
const DEFAULT_LANGUAGE = 'en';

// Translation storage
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.discover': 'Discover',
    'nav.lists': 'Lists',
    'nav.social': 'Social',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.notifications': 'Notifications',
    
    // Common actions
    'action.watch_now': 'Watch Now',
    'action.add_to_watchlist': 'Add to Watchlist',
    'action.trailer': 'Trailer',
    'action.view_all': 'View All',
    'action.more_filters': 'More Filters',
    'action.search': 'Search',
    'action.login': 'Log In',
    'action.logout': 'Log Out',
    'action.join_now': 'Join Now',
    
    // Discover page
    'discover.header': 'Discover What to',
    'discover.binge': 'Binge',
    'discover.top_picks': 'Top Picks Today',
    'discover.hidden_gems': 'Hidden Gems',
    'discover.trending': "What's Trending",
    'discover.search_placeholder': 'Search shows, movies, or genres...',
    'discover.search_results': 'Search Results for',
    'discover.no_results': 'No results found for',
    'discover.no_content': 'No content available',
    'discover.searching': 'Searching for',
    
    // Home page
    'home.header': 'What To Binge Next!',
    'home.continue_watching': 'Continue Watching',
    'home.next_episode': 'Next Episode Drops',
    'home.friends_watching': 'Friends Watching',
    'home.start_watching': 'Start Watching',
    'home.recommended': 'Recommended for You',
    'home.coming_soon': 'Coming Soon',
    'home.trending': 'Trending Now',
    
    // Lists page
    'lists.header': 'Binge Lists',
    'lists.my_lists': 'My Lists',
    'lists.shared_lists': 'Shared Lists',
    'lists.create_list': 'Create List',
    
    // Social page
    'social.header': 'Binge with Friends',
    'social.activity_feed': 'Activity Feed',
    'social.find_friends': 'Find Friends',
    'social.friend_requests': 'Friend Requests',
    
    // Profile page
    'profile.header': 'Profile',
    'profile.stats': 'Stats',
    'profile.watchlist': 'Watchlist',
    'profile.settings': 'Settings',
    'profile.privacy': 'Privacy',
    
    // Streaming platforms
    'streaming.available_on': 'Available on',
    'streaming.find_streaming': 'Find Streaming',
    'streaming.select_platform': 'Select Platform',
    
    // Mood filters
    'mood.action_packed': 'Action Packed',
    'mood.laugh_out_loud': 'Laugh Out Loud',
    'mood.mind_bending': 'Mind Bending',
    'mood.heart_warming': 'Heart Warming',
    'mood.edge_of_seat': 'Edge of Seat',
    'mood.feel_good': 'Feel Good',
    'mood.binge_worthy': 'Binge Worthy',
    'mood.hidden_gems': 'Hidden Gems',
    
    // Status messages
    'status.loading': 'Loading...',
    'status.error': 'Error',
    'status.success': 'Success',
    'status.unauthorized': 'Unauthorized',
    'status.not_found': 'Not Found',
    
    // Time and dates
    'time.now': 'Now',
    'time.today': 'Today',
    'time.tomorrow': 'Tomorrow',
    'time.this_week': 'This Week',
    'time.next_week': 'Next Week',
    
    // Ratings and reviews
    'rating.stars': 'stars',
    'rating.out_of': 'out of',
    'rating.rating': 'Rating',
    'rating.reviews': 'Reviews',
    
    // Authentication
    'auth.welcome': 'Welcome to BingeBoard',
    'auth.login_with_google': 'Continue with Google',
    'auth.login_with_facebook': 'Continue with Facebook',
    'auth.login_with_replit': 'Continue with Replit',
    'auth.create_account': 'Create Account',
    'auth.already_have_account': 'Already have an account?',
    'auth.dont_have_account': "Don't have an account?",
    
    // Brand
    'brand.bingeboard': 'BingeBoard',
    'brand.tagline': 'Entertainment Hub',
    'brand.description': 'Track, discover, and share your favorite shows and movies',
  },
  
  // Future languages can be added here
  es: {
    // Spanish translations would go here
    'nav.home': 'Inicio',
    'nav.discover': 'Descubrir',
    'nav.lists': 'Listas',
    'nav.social': 'Social',
    'nav.profile': 'Perfil',
    'action.watch_now': 'Ver Ahora',
    'action.add_to_watchlist': 'Agregar a Lista',
    'discover.header': 'Descubre Qué',
    'discover.binge': 'Ver',
    // ... more Spanish translations
  },
  
  fr: {
    // French translations would go here
    'nav.home': 'Accueil',
    'nav.discover': 'Découvrir',
    'nav.lists': 'Listes',
    'nav.social': 'Social',
    'nav.profile': 'Profil',
    'action.watch_now': 'Regarder Maintenant',
    'action.add_to_watchlist': 'Ajouter à la Liste',
    'discover.header': 'Découvrir Quoi',
    'discover.binge': 'Regarder',
    // ... more French translations
  }
};

// Get current language from localStorage or default
function getCurrentLanguage() {
  return localStorage.getItem('bingeboard_language') || DEFAULT_LANGUAGE;
}

// Set language and save to localStorage
function setLanguage(language) {
  localStorage.setItem('bingeboard_language', language);
  // Trigger a custom event to notify components of language change
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }));
}

// Main translation function
function t(key, params = {}) {
  const language = getCurrentLanguage();
  const translation = translations[language]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
  
  // Replace parameters in translation string
  let result = translation;
  Object.keys(params).forEach(param => {
    result = result.replace(`{${param}}`, params[param]);
  });
  
  return result;
}

// Get available languages
function getAvailableLanguages() {
  return Object.keys(translations);
}

// Check if a language is supported
function isLanguageSupported(language) {
  return translations.hasOwnProperty(language);
}

// Export functions for use in components
export {
  t,
  setLanguage,
  getCurrentLanguage,
  getAvailableLanguages,
  isLanguageSupported
};