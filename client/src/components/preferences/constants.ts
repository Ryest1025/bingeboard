/**
 * Preferences Constants
 * 
 * Static data for genres and viewing preferences
 * Created: August 5, 2025
 */

import type { Genre, ViewingPreference } from "@/types/preferences";

export const GENRES: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export const VIEWING_PREFERENCES: ViewingPreference[] = [
  {
    id: 'binge-worthy',
    title: 'Binge-worthy series',
    desc: 'Shows with multiple seasons to dive into'
  },
  {
    id: 'quick-watches',
    title: 'Quick watches',
    desc: 'Movies and limited series under 3 hours'
  },
  {
    id: 'highly-rated',
    title: 'Highly rated only',
    desc: 'Only show me content rated 7.5+ on IMDb'
  },
  {
    id: 'new-releases',
    title: 'New releases first',
    desc: 'Prioritize content from the last 2 years'
  }
];

export const ANIMATION_CONFIG = {
  modal: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  content: {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.95, opacity: 0, y: 20 },
    transition: { duration: 0.2 }
  },
  header: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { delay: 0.1 }
  },
  genreSection: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: 0.1 }
  },
  preferencesSection: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: 0.2 }
  },
  saveButton: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { delay: 0.3 }
  },
  checkMark: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { type: "spring", stiffness: 500 }
  },
  checkMarkRotating: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: "spring", stiffness: 500 }
  }
};
