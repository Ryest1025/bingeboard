import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopNav } from "@/components/top-nav";
import { 
  Calendar, 
  Clock, 
  Tv, 
  Play,
  Star,
  Users,
  Trophy,
  Target,
  ChevronRight
} from "lucide-react";

interface Game {
  sportsDbId: string;
  gameDate: Date;
  gameTime?: string;
  venue?: string;
  description: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  tvNetworks: string[];
  streamingPlatforms: string[];
  homeTeam: {
    name: string;
    logoUrl?: string;
  };
  awayTeam: {
    name: string;
    logoUrl?: string;
  };
}

interface Sport {
  name: string;
  displayName: string;
  icon: string;
  season: string;
}

function GameCard({ game }: { game: Game }) {
  const isLive = game.status === 'live';
  const isFinished = game.status === 'finished';
  const hasScore = game.homeScore !== null && game.awayScore !== null;

  const getStatusColor = () => {
    switch (game.status) {
      case 'live': return 'bg-red-500';
      case 'finished': return 'bg-gray-500';
      case 'postponed': return 'bg-yellow-500';
      default: return 'bg-teal-500';
    }
  };

  const getStatusText = () => {
    switch (game.status) {
      case 'live': return 'LIVE';
      case 'finished': return 'FINAL';
      case 'postponed': return 'POSTPONED';
      default: 'SCHEDULED';
    }
  };

  return (
    <Card className="glass-effect border-white/10 hover:border-teal-500/30 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${getStatusColor()} text-white text-xs px-2 py-1`}>
            {getStatusText()}
          </Badge>
          {game.gameTime && (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Clock className="h-3 w-3" />
              {game.gameTime}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Teams */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {game.awayTeam.logoUrl && (
                <img src={game.awayTeam.logoUrl} alt="" className="w-8 h-8 rounded" />
              )}
              <span className="text-white font-medium">{game.awayTeam.name}</span>
            </div>
            {hasScore && (
              <span className="text-lg font-bold text-white">{game.awayScore}</span>
            )}
          </div>

          <div className="flex items-center justify-center">
            <span className="text-gray-400 text-sm">@</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {game.homeTeam.logoUrl && (
                <img src={game.homeTeam.logoUrl} alt="" className="w-8 h-8 rounded" />
              )}
              <span className="text-white font-medium">{game.homeTeam.name}</span>
            </div>
            {hasScore && (
              <span className="text-lg font-bold text-white">{game.homeScore}</span>
            )}
          </div>

          {/* TV Info */}
          {(game.tvNetworks.length > 0 || game.streamingPlatforms.length > 0) && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                <Tv className="h-3 w-3" />
                Watch on:
              </div>
              <div className="flex flex-wrap gap-1">
                {game.tvNetworks.map((network, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                    {network}
                  </Badge>
                ))}
                {game.streamingPlatforms.map((platform, index) => (
                  <Badge key={index} variant="outline" className="text-xs border-teal-500 text-teal-400">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SportsSection({ sport, games }: { sport: Sport; games: Game[] }) {
  const todayGames = games.filter(game => {
    const gameDate = new Date(game.gameDate);
    const today = new Date();
    return gameDate.toDateString() === today.toDateString();
  });

  const liveGames = todayGames.filter(game => game.status === 'live');
  const upcomingGames = todayGames.filter(game => game.status === 'scheduled');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-2xl">
            {sport.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{sport.displayName}</h2>
            <p className="text-gray-400 text-sm">{sport.season} Season</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-teal-500/20 text-teal-400">
          {todayGames.length} games today
        </Badge>
      </div>

      {liveGames.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-500 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Live Now ({liveGames.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveGames.map((game) => (
              <GameCard key={game.sportsDbId} game={game} />
            ))}
          </div>
        </div>
      )}

      {upcomingGames.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-400" />
            Today's Games ({upcomingGames.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((game) => (
              <GameCard key={game.sportsDbId} game={game} />
            ))}
          </div>
        </div>
      )}

      {todayGames.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No games scheduled for today</p>
          <p className="text-sm">Check back tomorrow for the latest schedule</p>
        </div>
      )}
    </div>
  );
}

export default function Sports() {
  const { isAuthenticated } = useAuth();
  const [selectedSport, setSelectedSport] = useState<string>('all');

  // Fetch sports data
  const { data: sports = [] } = useQuery({
    queryKey: ['/api/sports'],
    enabled: isAuthenticated,
  });

  const { data: todaySchedule = {} } = useQuery({
    queryKey: ['/api/sports/tv/today'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)]">
        <TopNav />
        <div className="pt-20 p-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Sports Center</h1>
            <p className="text-gray-400 mb-8">Sign in to track your favorite teams and live sports</p>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400">
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(228,25%,3%)] via-[hsl(226,22%,6%)] to-[hsl(224,20%,8%)]">
      <TopNav />
      
      <div className="pt-20 p-4 pb-24">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg shadow-xl border-2 border-slate-600 relative">
                <div className="absolute inset-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-md flex items-center justify-center">
                  <div className="text-sm font-bold text-white drop-shadow-lg">B</div>
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-slate-700 rounded-sm"></div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-slate-600 rounded-sm"></div>
              </div>
              <h1 className="text-3xl font-bold text-white">
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Binge</span> Sports
              </h1>
            </div>
            <p className="text-gray-300">Live games, schedules, and where to watch your favorite teams</p>
          </div>

          {/* Sports Tabs */}
          <Tabs value={selectedSport} onValueChange={setSelectedSport} className="space-y-6">
            <TabsList className="bg-black/40 border border-white/10 p-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                All Sports
              </TabsTrigger>
              <TabsTrigger value="NFL" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                🏈 NFL
              </TabsTrigger>
              <TabsTrigger value="NBA" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                🏀 NBA
              </TabsTrigger>
              <TabsTrigger value="MLB" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                ⚾ MLB
              </TabsTrigger>
              <TabsTrigger value="NHL" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                🏒 NHL
              </TabsTrigger>
              <TabsTrigger value="Tennis" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                🎾 Tennis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {sports.map((sport: Sport) => (
                <SportsSection 
                  key={sport.name} 
                  sport={sport} 
                  games={todaySchedule[sport.name] || []} 
                />
              ))}
            </TabsContent>

            {sports.map((sport: Sport) => (
              <TabsContent key={sport.name} value={sport.name}>
                <SportsSection sport={sport} games={todaySchedule[sport.name] || []} />
              </TabsContent>
            ))}
          </Tabs>

        </div>
      </div>
    </div>
  );
}