import { Request, Response } from 'express';

export const getProgress = async (req: Request, res: Response) => {
  try {
    // Return current progress data
    const progressData = [
      {
        id: '1',
        showId: '1',
        showTitle: 'Breaking Bad',
        showImage: '/api/placeholder/300/450',
        showType: 'tv',
        currentTime: 1800, // 30 minutes
        totalTime: 2700, // 45 minutes
        lastWatched: new Date().toISOString(),
        season: 5,
        episode: 14,
        episodeTitle: 'Ozymandias',
        completed: false,
        percentage: 67
      },
      {
        id: '2',
        showId: '2',
        showTitle: 'The Office',
        showImage: '/api/placeholder/300/450',
        showType: 'tv',
        currentTime: 600, // 10 minutes
        totalTime: 1320, // 22 minutes
        lastWatched: new Date().toISOString(),
        season: 3,
        episode: 8,
        episodeTitle: 'The Convention',
        completed: false,
        percentage: 45
      }
    ];

    res.status(200).json(progressData);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { showId, currentTime, totalTime, season, episode, completed } = req.body;
    
    // In a real app, this would update the database
    console.log('Updating progress:', { showId, currentTime, totalTime, season, episode, completed });
    
    res.status(200).json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
};