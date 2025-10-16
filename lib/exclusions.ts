/**
 * Universal Intelligent Exclusions System
 * 
 * Automatically filters out media that users have already:
 * - Added to watchlist
 * - Marked as watched/completed
 * - Set reminders for
 * - Added to custom lists
 * 
 * This creates a consistent, smart experience across all recommendations
 */

/**
 * Get all media IDs that should be excluded for a user
 * This is a client-side utility - the backend will handle the actual DB queries
 */
export async function getUserExcludedIds(userId: string, apiFetch: (url: string) => Promise<Response>): Promise<Set<number>> {
  try {
    const [watchlistRes, remindersRes] = await Promise.all([
      apiFetch('/api/user/watchlist').then(r => r.json()).catch(() => ({ items: [] })),
      apiFetch('/api/user/reminders').then(r => r.json()).catch(() => ({ items: [] })),
    ]);

    const allIds = new Set<number>();
    
    // Add watchlist IDs
    (watchlistRes?.items || []).forEach((item: any) => {
      const id = item.showId || item.id || item.tmdbId;
      if (id) allIds.add(Number(id));
    });
    
    // Add reminder IDs
    (remindersRes?.items || []).forEach((item: any) => {
      const id = item.showId || item.id || item.tmdbId;
      if (id) allIds.add(Number(id));
    });
    
    return allIds;
  } catch (error) {
    console.error('Error fetching user excluded IDs:', error);
    return new Set<number>();
  }
}

/**
 * Filter media results to exclude user's shows
 */
export function excludeUserMedia<T extends { id: number | string }>(
  results: T[], 
  excludedIds: Set<number>
): T[] {
  if (excludedIds.size === 0) return results;
  
  return results.filter(item => {
    const itemId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
    return !excludedIds.has(itemId);
  });
}

/**
 * Higher-order function to apply exclusions to any data fetch
 */
export async function withUserExclusions<T extends { id: number | string }>(
  userId: string | null | undefined,
  fetchFn: () => Promise<T[]>,
  apiFetch: (url: string) => Promise<Response>
): Promise<T[]> {
  const results = await fetchFn();
  
  // If no user, return all results
  if (!userId) return results;
  
  // Get excluded IDs and filter
  const excludedIds = await getUserExcludedIds(userId, apiFetch);
  return excludeUserMedia(results, excludedIds);
}

/**
 * Filter TMDB API response format (with results array)
 */
export async function excludeFromTMDBResponse(
  userId: string | null | undefined,
  tmdbResponse: any,
  apiFetch: (url: string) => Promise<Response>
): Promise<any> {
  if (!userId || !tmdbResponse?.results) return tmdbResponse;
  
  const excludedIds = await getUserExcludedIds(userId, apiFetch);
  const filteredResults = excludeUserMedia(tmdbResponse.results, excludedIds);
  
  return {
    ...tmdbResponse,
    results: filteredResults,
    total_results: filteredResults.length,
  };
}
