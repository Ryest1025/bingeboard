import { Request, Response } from "express";
import fetch from "node-fetch";

// Handle trending TV/movies API calls that match the frontend expectations
export default async function handler(req: Request, res: Response) {
  const { mediaType = 'tv', timeWindow = 'day' } = req.query;
  
  try {
    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      return res.status(500).json({ error: "TMDB API key not configured" });
    }

    const url = `https://api.themoviedb.org/3/trending/${mediaType}/${timeWindow}?api_key=${tmdbApiKey}`;
    
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.status_message || "TMDB API error" });
    }
    
    res.json(data);
  } catch (error) {
    console.error("Trending API error:", error);
    res.status(500).json({ error: "Failed to fetch trending data" });
  }
}
