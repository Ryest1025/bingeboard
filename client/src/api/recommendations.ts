import { NextApiRequest, NextApiResponse } from 'next';
import { getUserRecommendations, getUpcomingSeasons } from '@/lib/recommendations';
import { getAuthUser } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const aiRecommendations = await getUserRecommendations(user.id);
    const upcomingSeasons = await getUpcomingSeasons();

    const newSeasonRecs = upcomingSeasons.map(show => ({
      ...show,
      isNewSeason: true,
      seasonNumber: show.nextSeasonNumber
    }));

    const combined = [...newSeasonRecs, ...aiRecommendations].sort((a, b) => {
      if (a.isNewSeason && !b.isNewSeason) return -1;
      if (!a.isNewSeason && b.isNewSeason) return 1;
      return 0;
    });

    res.status(200).json(combined);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
}