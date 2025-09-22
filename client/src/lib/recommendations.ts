export async function getUserRecommendations(userId: string) {
  try {
    // For now, return mock data since we don't have full database setup
    return [
      {
        id: '1',
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher turns to cooking meth',
        genre: 'Drama',
        year: 2008,
        rating: 9.5
      },
      {
        id: '2',
        title: 'The Office',
        description: 'Mockumentary about office workers',
        genre: 'Comedy',
        year: 2005,
        rating: 8.7
      }
    ];
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    return [];
  }
}

export async function getUpcomingSeasons() {
  try {
    // Mock data for upcoming seasons
    return [
      {
        id: '3',
        title: 'Stranger Things',
        description: 'Kids in a small town encounter supernatural forces',
        nextSeasonNumber: 5,
        nextSeasonReleaseDate: new Date('2024-07-01')
      }
    ];
  } catch (error) {
    console.error('Error fetching upcoming seasons:', error);
    return [];
  }
}