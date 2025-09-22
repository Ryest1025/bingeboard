import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Mock awards data
    const awards = [
      {
        id: '1',
        title: 'First Watch',
        description: 'Watched your first show',
        icon: '🎬',
        earnedAt: new Date(),
        type: 'milestone'
      },
      {
        id: '2',
        title: 'Binge Master',
        description: 'Watched 10 episodes in a row',
        icon: '🏆',
        earnedAt: new Date(),
        type: 'achievement'
      },
      {
        id: '3',
        title: 'Genre Explorer',
        description: 'Watched shows from 5 different genres',
        icon: '🌟',
        earnedAt: new Date(),
        type: 'badge'
      }
    ];

    res.status(200).json(awards);
  } catch (error) {
    console.error('Error fetching awards:', error);
    res.status(500).json({ message: 'Failed to fetch awards' });
  }
}