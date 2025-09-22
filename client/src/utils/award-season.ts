/**
 * Award season utilities for determining active award periods
 */

export interface AwardSeason {
  name: string;
  start: string; // ISO date string
  end: string;   // ISO date string
  type: 'emmys' | 'oscars' | 'golden-globes' | 'sag' | 'critics-choice';
}

// Award season definitions
const AWARD_SEASONS: AwardSeason[] = [
  {
    name: 'Emmy Awards',
    start: '2024-08-01',
    end: '2024-09-30',
    type: 'emmys'
  },
  {
    name: 'Oscar Season',
    start: '2024-12-01',
    end: '2025-03-31',
    type: 'oscars'
  },
  {
    name: 'Golden Globes',
    start: '2024-11-01',
    end: '2025-01-31',
    type: 'golden-globes'
  },
  {
    name: 'SAG Awards',
    start: '2024-12-15',
    end: '2025-02-15',
    type: 'sag'
  },
  {
    name: 'Critics Choice',
    start: '2024-11-15',
    end: '2025-01-15',
    type: 'critics-choice'
  }
];

/**
 * Centralized award season logic
 */
export const getActiveAwardSeason = (date: Date = new Date()): AwardSeason | null => {
  return AWARD_SEASONS.find(season => {
    const start = new Date(season.start);
    const end = new Date(season.end);
    return date >= start && date <= end;
  }) || null;
};

/**
 * Check if we're currently in any award season
 */
export const isAwardSeason = (date: Date = new Date()): boolean => {
  return getActiveAwardSeason(date) !== null;
};

/**
 * Get award season info for display
 */
export const getAwardSeasonInfo = (date: Date = new Date()) => {
  const activeSeason = getActiveAwardSeason(date);
  
  if (!activeSeason) {
    return {
      isActive: false,
      name: null,
      type: null,
      daysRemaining: null
    };
  }

  const end = new Date(activeSeason.end);
  const daysRemaining = Math.ceil((end.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  return {
    isActive: true,
    name: activeSeason.name,
    type: activeSeason.type,
    daysRemaining: Math.max(0, daysRemaining)
  };
};

/**
 * Determine if a show qualifies for award season highlighting
 */
export const isAwardEligibleShow = (
  show: { release_date?: string; first_air_date?: string; vote_average?: number },
  awardSeason: AwardSeason
): boolean => {
  const releaseDate = show.first_air_date || show.release_date;
  if (!releaseDate) return false;

  const showDate = new Date(releaseDate);
  const seasonStart = new Date(awardSeason.start);
  
  // Show must be released within the past 2 years and have good ratings
  const twoYearsAgo = new Date(seasonStart);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  return showDate >= twoYearsAgo && 
         showDate <= seasonStart && 
         (show.vote_average || 0) >= 7.0;
};