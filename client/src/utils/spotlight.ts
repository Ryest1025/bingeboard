// Utility functions for spotlight rotation logic
import type { MediaItem } from "./formatApiItem";

/**
 * Picks the next spotlight item from a list, avoiding immediate repeats when possible
 * @param list - Array of items to choose from
 * @param previous - Previously selected item (to avoid repeating)
 * @returns Selected item or null if list is empty
 */
export function pickNextSpotlight(
  list: MediaItem[],
  previous: MediaItem | null
): MediaItem | null {
  if (!list || list.length === 0) {
    return null;
  }

  // If only one item, return it even if it was previous
  if (list.length === 1) {
    return list[0];
  }

  // Filter out the previous item to avoid immediate repeats
  const filtered = previous
    ? list.filter(item => item.id !== previous.id)
    : list;

  // If all items filtered out (shouldn't happen), use original list
  const choices = filtered.length > 0 ? filtered : list;

  // Pick random item
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates a spotlight configuration with metadata
 */
export interface SpotlightConfig {
  item: MediaItem;
  title: string;
  badge: string;
  badgeColor: string;
  cta: string;
  action: string;
  isUpcoming: boolean;
}

/**
 * Creates spotlight configurations from media items
 */
export function createSpotlightConfigs(
  trending: MediaItem | null,
  upcoming: MediaItem | null,
  topRated: MediaItem | null
): SpotlightConfig[] {
  const spotlights: (SpotlightConfig | null)[] = [
    trending ? {
      item: trending,
      title: "Just Released & Trending",
      badge: "🔥 TRENDING NOW",
      badgeColor: "bg-gradient-to-r from-red-600 to-orange-600",
      cta: "Watch Now",
      action: "watch",
      isUpcoming: false
    } : null,
    upcoming ? {
      item: upcoming,
      title: "Coming Soon – Highly Anticipated",
      badge: "🌟 UPCOMING",
      badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      cta: "Remind Me",
      action: "reminder",
      isUpcoming: true
    } : null,
    topRated ? {
      item: topRated,
      title: "#1 Show You Haven't Added Yet",
      badge: "🏆 EDITOR'S PICK",
      badgeColor: "bg-gradient-to-r from-teal-600 to-cyan-600",
      cta: "Watch Now",
      action: "watch",
      isUpcoming: false
    } : null
  ];

  return spotlights.filter((s): s is SpotlightConfig => s !== null);
}
