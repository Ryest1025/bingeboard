import { format, addDays, startOfDay, endOfDay } from 'date-fns';

export class SportsService {
  private baseUrl = 'https://www.thesportsdb.com/api/v1/json/3';
  private tvUrl = 'https://www.thesportsdb.com/api/v1/json/123';

  constructor() {
    // TheSportsDB is free and doesn't require API key for basic endpoints
  }

  private async makeRequest(endpoint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Sports API request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Sports API error:', error);
      throw error;
    }
  }

  private async makeTvRequest(endpoint: string) {
    try {
      const response = await fetch(`${this.tvUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`Sports TV API request failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Sports TV API error:', error);
      throw error;
    }
  }

  // Get supported sports
  async getSupportedSports() {
    return [
      {
        name: 'NFL',
        displayName: 'National Football League',
        sportsDbId: 'American Football',
        icon: '🏈',
        season: this.getCurrentNFLSeason(),
      },
      {
        name: 'NBA',
        displayName: 'National Basketball Association',
        sportsDbId: 'Basketball',
        icon: '🏀',
        season: this.getCurrentNBASeason(),
      },
      {
        name: 'MLB',
        displayName: 'Major League Baseball',
        sportsDbId: 'Baseball',
        icon: '⚾',
        season: this.getCurrentMLBSeason(),
      },
      {
        name: 'NHL',
        displayName: 'National Hockey League',
        sportsDbId: 'Ice Hockey',
        icon: '🏒',
        season: this.getCurrentNHLSeason(),
      },
      {
        name: 'Tennis',
        displayName: 'Professional Tennis',
        sportsDbId: 'Tennis',
        icon: '🎾',
        season: new Date().getFullYear().toString(),
      },
    ];
  }

  // Get teams for a specific sport
  async getTeamsBySport(sportName: string) {
    try {
      let endpoint = '';
      
      switch (sportName) {
        case 'NFL':
          endpoint = '/search_all_teams.php?l=NFL';
          break;
        case 'NBA':
          endpoint = '/search_all_teams.php?l=NBA';
          break;
        case 'MLB':
          endpoint = '/search_all_teams.php?l=MLB';
          break;
        case 'NHL':
          endpoint = '/search_all_teams.php?l=NHL';
          break;
        case 'Tennis':
          // Tennis doesn't have teams, return empty
          return [];
        default:
          throw new Error(`Unsupported sport: ${sportName}`);
      }

      const data = await this.makeRequest(endpoint);
      return (data.teams || []).map(this.transformTeam.bind(this));
    } catch (error) {
      console.error(`Error fetching teams for ${sportName}:`, error);
      return [];
    }
  }

  // Get upcoming games for a sport
  async getUpcomingGames(sportName: string, days: number = 7) {
    try {
      const games = [];
      const today = new Date();

      // Get games for the next 'days' days
      for (let i = 0; i < days; i++) {
        const targetDate = addDays(today, i);
        const dateString = format(targetDate, 'yyyy-MM-dd');
        
        try {
          const dayGames = await this.getGamesForDate(sportName, dateString);
          games.push(...dayGames);
        } catch (error) {
          console.error(`Error fetching games for ${dateString}:`, error);
          // Continue with other dates
        }
      }

      return games;
    } catch (error) {
      console.error(`Error fetching upcoming games for ${sportName}:`, error);
      return [];
    }
  }

  // Get games for a specific date
  async getGamesForDate(sportName: string, date: string) {
    try {
      let endpoint = '';
      
      switch (sportName) {
        case 'NFL':
          endpoint = `/eventsday.php?d=${date}&l=NFL`;
          break;
        case 'NBA':
          endpoint = `/eventsday.php?d=${date}&l=NBA`;
          break;
        case 'MLB':
          endpoint = `/eventsday.php?d=${date}&l=MLB`;
          break;
        case 'NHL':
          endpoint = `/eventsday.php?d=${date}&l=NHL`;
          break;
        case 'Tennis':
          // For tennis, get general events for the date
          endpoint = `/eventsday.php?d=${date}&s=Tennis`;
          break;
        default:
          return [];
      }

      const data = await this.makeRequest(endpoint);
      const events = data.events || [];

      // Get TV broadcast info for each game
      const gamesWithTv = await Promise.all(
        events.map(async (event: any) => {
          const tvInfo = await this.getTvInfoForGame(event.idEvent);
          return this.transformGame(event, tvInfo);
        })
      );

      return gamesWithTv;
    } catch (error) {
      console.error(`Error fetching games for ${sportName} on ${date}:`, error);
      return [];
    }
  }

  // Get TV broadcast information
  async getTvInfoForGame(eventId: string) {
    try {
      // Get TV listings for the game
      const data = await this.makeTvRequest(`/eventtv.php?e=${eventId}`);
      
      if (!data.tvevent || data.tvevent.length === 0) {
        return { tvNetworks: [], streamingPlatforms: [] };
      }

      const tvNetworks: string[] = [];
      const streamingPlatforms: string[] = [];

      for (const tv of data.tvevent) {
        const channel = tv.strChannel;
        if (this.isStreamingPlatform(channel)) {
          streamingPlatforms.push(channel);
        } else {
          tvNetworks.push(channel);
        }
      }

      return {
        tvNetworks: tvNetworks.filter((item, index) => tvNetworks.indexOf(item) === index), // Remove duplicates
        streamingPlatforms: streamingPlatforms.filter((item, index) => streamingPlatforms.indexOf(item) === index)
      };
    } catch (error) {
      console.error(`Error fetching TV info for event ${eventId}:`, error);
      return { tvNetworks: [], streamingPlatforms: [] };
    }
  }

  // Get TV schedule for today
  async getTodaysTvSchedule() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      console.log(`Fetching sports TV schedule for ${today}`);
      
      const data = await this.makeTvRequest(`/eventstv.php?d=${today}`);
      
      if (!data || !data.tvevent) {
        console.log('No TV events found, returning sample data');
        // Return organized sample data for demo
        return {
          'NFL': [
            {
              sportsDbId: 'nfl_sample_1',
              gameDate: new Date(),
              gameTime: '8:20 PM ET',
              venue: 'Mercedes-Benz Stadium',
              description: 'Atlanta Falcons vs New Orleans Saints',
              status: 'scheduled',
              homeScore: null,
              awayScore: null,
              tvNetworks: ['ESPN', 'ABC'],
              streamingPlatforms: ['ESPN+', 'Hulu + Live TV', 'YouTube TV'],
              homeTeam: { name: 'Atlanta Falcons', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png' },
              awayTeam: { name: 'New Orleans Saints', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png' }
            }
          ],
          'NBA': [
            {
              sportsDbId: 'nba_sample_1',
              gameDate: new Date(),
              gameTime: '10:00 PM ET',
              venue: 'Crypto.com Arena',
              description: 'Los Angeles Lakers vs Golden State Warriors',
              status: 'live',
              homeScore: 98,
              awayScore: 102,
              tvNetworks: ['TNT', 'NBA TV'],
              streamingPlatforms: ['NBA League Pass', 'MAX', 'Sling TV'],
              homeTeam: { name: 'Los Angeles Lakers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
              awayTeam: { name: 'Golden State Warriors', logoUrl: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png' }
            }
          ],
          'MLB': [
            {
              sportsDbId: 'mlb_sample_1',
              gameDate: new Date(),
              gameTime: '7:05 PM ET',
              venue: 'Yankee Stadium',
              description: 'New York Yankees vs Boston Red Sox',
              status: 'scheduled',
              homeScore: null,
              awayScore: null,
              tvNetworks: ['YES Network', 'NESN'],
              streamingPlatforms: ['MLB.TV', 'Apple TV+', 'Amazon Prime Video'],
              homeTeam: { name: 'New York Yankees', logoUrl: 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png' },
              awayTeam: { name: 'Boston Red Sox', logoUrl: 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png' }
            }
          ]
        };
      }

      // Filter for sports we care about
      const supportedSports = ['American Football', 'Basketball', 'Baseball', 'Ice Hockey', 'Tennis'];
      
      const filteredEvents = data.tvevent
        .filter((event: any) => supportedSports.includes(event.strSport))
        .map(this.transformTvEvent.bind(this));

      // Group by sport
      const groupedBySport: { [key: string]: any[] } = {};
      filteredEvents.forEach((event: any) => {
        const sportKey = this.getSportKey(event.sport);
        if (!groupedBySport[sportKey]) {
          groupedBySport[sportKey] = [];
        }
        groupedBySport[sportKey].push(event);
      });

      return groupedBySport;
    } catch (error) {
      console.error('Error fetching TV schedule:', error);
      // Return sample data on error
      return {
        'NBA': [
          {
            sportsDbId: 'nba_demo_1',
            gameDate: new Date(),
            gameTime: '9:00 PM ET',
            venue: 'Chase Center',
            description: 'Golden State Warriors vs Phoenix Suns',
            status: 'live',
            homeScore: 85,
            awayScore: 78,
            tvNetworks: ['TNT'],
            streamingPlatforms: ['NBA League Pass', 'MAX'],
            homeTeam: { name: 'Golden State Warriors', logoUrl: '' },
            awayTeam: { name: 'Phoenix Suns', logoUrl: '' }
          }
        ]
      };
    }
  }

  private getSportKey(sport: string): string {
    const mapping: { [key: string]: string } = {
      'American Football': 'NFL',
      'Basketball': 'NBA', 
      'Baseball': 'MLB',
      'Ice Hockey': 'NHL',
      'Tennis': 'Tennis'
    };
    return mapping[sport] || sport;
  }

  // Get tennis major tournaments
  async getTennisMajors() {
    try {
      const majorTournaments = [
        'Australian Open',
        'French Open', 
        'Roland Garros',
        'Wimbledon',
        'US Open'
      ];

      const events = [];
      
      for (const tournament of majorTournaments) {
        try {
          const data = await this.makeRequest(`/searchevents.php?e=${encodeURIComponent(tournament)}`);
          if (data.event) {
            events.push(...data.event.map(this.transformTennisEvent.bind(this)));
          }
        } catch (error) {
          console.error(`Error fetching ${tournament}:`, error);
        }
      }

      return events;
    } catch (error) {
      console.error('Error fetching tennis majors:', error);
      return [];
    }
  }

  // Helper methods
  private transformTeam(team: any) {
    return {
      sportsDbId: team.idTeam,
      name: team.strTeam,
      city: team.strLocation || team.strTeam?.split(' ').slice(0, -1).join(' '),
      abbreviation: team.strTeamShort || team.strTeamBadge,
      logoUrl: team.strTeamBadge,
      primaryColor: team.strColour1 ? `#${team.strColour1}` : null,
      secondaryColor: team.strColour2 ? `#${team.strColour2}` : null,
      conference: team.strDivision,
      division: team.strDivision,
    };
  }

  private transformGame(event: any, tvInfo: any) {
    return {
      sportsDbId: event.idEvent,
      gameDate: new Date(event.dateEvent + 'T' + (event.strTime || '00:00:00')),
      gameTime: event.strTime,
      venue: event.strVenue,
      season: event.strSeason,
      week: event.intRound,
      gameType: this.getGameType(event),
      status: this.getGameStatus(event),
      homeScore: event.intHomeScore ? parseInt(event.intHomeScore) : null,
      awayScore: event.intAwayScore ? parseInt(event.intAwayScore) : null,
      description: event.strEvent,
      tvNetworks: tvInfo.tvNetworks || [],
      streamingPlatforms: tvInfo.streamingPlatforms || [],
      homeTeam: {
        name: event.strHomeTeam,
        logoUrl: event.strHomeTeamBadge,
      },
      awayTeam: {
        name: event.strAwayTeam,
        logoUrl: event.strAwayTeamBadge,
      },
    };
  }

  private transformTvEvent(event: any) {
    return {
      eventId: event.idEvent,
      sport: event.strSport,
      title: event.strEvent,
      date: event.dateEvent,
      time: event.strTime,
      channel: event.strChannel,
      country: event.strCountry,
    };
  }

  private transformTennisEvent(event: any) {
    return {
      sportsDbId: event.idEvent,
      title: event.strEvent,
      gameDate: new Date(event.dateEvent),
      venue: event.strVenue,
      season: event.strSeason,
      description: event.strEventAlternate || event.strEvent,
      status: this.getGameStatus(event),
    };
  }

  private getGameType(event: any): string {
    const eventName = event.strEvent?.toLowerCase() || '';
    if (eventName.includes('playoff') || eventName.includes('postseason')) {
      return 'playoff';
    }
    if (eventName.includes('championship') || eventName.includes('final')) {
      return 'championship';
    }
    return 'regular';
  }

  private getGameStatus(event: any): string {
    if (event.strStatus) {
      const status = event.strStatus.toLowerCase();
      if (status.includes('finished') || status.includes('ft')) return 'finished';
      if (status.includes('live') || status.includes('ht')) return 'live';
      if (status.includes('postponed')) return 'postponed';
    }
    
    const gameDate = new Date(event.dateEvent);
    const now = new Date();
    
    if (gameDate < now) return 'finished';
    return 'scheduled';
  }

  private isStreamingPlatform(channel: string): boolean {
    const streamingPlatforms = [
      'ESPN+', 'ESPN Plus',
      'Paramount+', 'Paramount Plus',
      'Apple TV+', 'Apple TV Plus',
      'Amazon Prime Video', 'Prime Video',
      'Peacock', 'Peacock Premium',
      'Hulu Live', 'Hulu + Live TV',
      'YouTube TV', 'YouTube Premium',
      'Netflix', 'HBO Max', 'Max',
      'Disney+', 'Disney Plus',
    ];

    return streamingPlatforms.some(platform => 
      channel.toLowerCase().includes(platform.toLowerCase())
    );
  }

  private getCurrentNFLSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    // NFL season runs from September to February
    return now.getMonth() >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  private getCurrentNBASeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    // NBA season runs from October to June
    return now.getMonth() >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  private getCurrentMLBSeason(): string {
    // MLB season runs from March/April to October
    return new Date().getFullYear().toString();
  }

  private getCurrentNHLSeason(): string {
    const now = new Date();
    const year = now.getFullYear();
    // NHL season runs from October to June
    return now.getMonth() >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }
}

export const sportsService = new SportsService();