import type { Express } from "express";
import { isAuthenticated } from "../auth";

/**
 * 🎯 FILTER DATA API ROUTES
 * 
 * Provides dynamic filter options for the Enhanced Filter System:
 * - GET /api/filters/genres - Get available genres
 * - GET /api/filters/platforms - Get streaming platforms
 * - GET /api/filters/countries - Get available countries
 * - GET /api/filters/sports - Get sports categories
 */

export function registerFilterRoutes(app: Express) {
  
  // Get available genres
  app.get('/api/filters/genres', async (req, res) => {
    try {
      console.log('🎭 Fetching filter genres...');
      
      // You can fetch from TMDB or use a predefined list
      // For now, using a curated list of popular genres
      const genres = [
        { id: 1, name: 'Action' },
        { id: 2, name: 'Adventure' },
        { id: 3, name: 'Animation' },
        { id: 4, name: 'Comedy' },
        { id: 5, name: 'Crime' },
        { id: 6, name: 'Documentary' },
        { id: 7, name: 'Drama' },
        { id: 8, name: 'Family' },
        { id: 9, name: 'Fantasy' },
        { id: 10, name: 'History' },
        { id: 11, name: 'Horror' },
        { id: 12, name: 'Music' },
        { id: 13, name: 'Mystery' },
        { id: 14, name: 'Romance' },
        { id: 15, name: 'Science Fiction' },
        { id: 16, name: 'Thriller' },
        { id: 17, name: 'War' },
        { id: 18, name: 'Western' }
      ];

      res.json(genres);
    } catch (error) {
      console.error('❌ Error fetching genres:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch genres',
        error: (error as Error).message 
      });
    }
  });

  // Get streaming platforms
  app.get('/api/filters/platforms', async (req, res) => {
    try {
      console.log('📺 Fetching streaming platforms...');
      
      // Popular streaming platforms with TMDB provider IDs
      const platforms = [
        { id: 8, name: 'Netflix', provider_id: 8 },
        { id: 9, name: 'Amazon Prime Video', provider_id: 9 },
        { id: 337, name: 'Disney Plus', provider_id: 337 },
        { id: 384, name: 'HBO Max', provider_id: 384 },
        { id: 15, name: 'Hulu', provider_id: 15 },
        { id: 350, name: 'Apple TV Plus', provider_id: 350 },
        { id: 531, name: 'Paramount Plus', provider_id: 531 },
        { id: 387, name: 'Peacock', provider_id: 387 },
        { id: 257, name: 'fuboTV', provider_id: 257 },
        { id: 386, name: 'Peacock Premium', provider_id: 386 }
      ];

      res.json(platforms);
    } catch (error) {
      console.error('❌ Error fetching platforms:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch platforms',
        error: (error as Error).message 
      });
    }
  });

  // Get available countries
  app.get('/api/filters/countries', async (req, res) => {
    try {
      console.log('🌍 Fetching countries...');
      
      // Popular countries for content filtering
      const countries = [
        { code: 'US', name: 'United States' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'IT', name: 'Italy' },
        { code: 'ES', name: 'Spain' },
        { code: 'JP', name: 'Japan' },
        { code: 'KR', name: 'South Korea' },
        { code: 'IN', name: 'India' },
        { code: 'BR', name: 'Brazil' },
        { code: 'MX', name: 'Mexico' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'SE', name: 'Sweden' },
        { code: 'NO', name: 'Norway' },
        { code: 'DK', name: 'Denmark' }
      ];

      res.json(countries);
    } catch (error) {
      console.error('❌ Error fetching countries:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch countries',
        error: (error as Error).message 
      });
    }
  });

  // Get sports categories
  app.get('/api/filters/sports', async (req, res) => {
    try {
      console.log('⚽ Fetching sports categories...');
      
      // Popular sports for filtering
      const sports = [
        { id: 1, name: 'Football', category: 'American Sports' },
        { id: 2, name: 'Basketball', category: 'American Sports' },
        { id: 3, name: 'Baseball', category: 'American Sports' },
        { id: 4, name: 'Hockey', category: 'American Sports' },
        { id: 5, name: 'Soccer', category: 'International Sports' },
        { id: 6, name: 'Tennis', category: 'Individual Sports' },
        { id: 7, name: 'Golf', category: 'Individual Sports' },
        { id: 8, name: 'Formula 1', category: 'Motorsports' },
        { id: 9, name: 'NASCAR', category: 'Motorsports' },
        { id: 10, name: 'Boxing', category: 'Combat Sports' },
        { id: 11, name: 'UFC/MMA', category: 'Combat Sports' },
        { id: 12, name: 'Olympic Sports', category: 'Multi-Sport' },
        { id: 13, name: 'Cricket', category: 'International Sports' },
        { id: 14, name: 'Rugby', category: 'International Sports' },
        { id: 15, name: 'Esports', category: 'Digital Sports' }
      ];

      res.json(sports);
    } catch (error) {
      console.error('❌ Error fetching sports:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch sports',
        error: (error as Error).message 
      });
    }
  });

  console.log('🎯 Filter API routes registered');
}
