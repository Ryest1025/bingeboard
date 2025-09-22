import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Mock data for continue watching
    const continueWatching = [
      {
        show: {
          id: '1',
          title: 'Breaking Bad',
          description: 'A high school chemistry teacher turns to cooking meth',
          poster: '/api/placeholder/300/450'
        },
        progress: 75,
        lastWatched: new Date(),
        episode: 'S5 E14'
      },
      {
        show: {
          id: '2',
          title: 'The Office',
          description: 'Mockumentary about office workers',
          poster: '/api/placeholder/300/450'
        },
        progress: 42,
        lastWatched: new Date(),
        episode: 'S3 E8'
      }
    ];

    res.status(200).json(continueWatching);
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    res.status(500).json({ message: 'Failed to fetch continue watching' });
  }
}