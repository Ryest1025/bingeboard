import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Tv, Wifi } from "lucide-react";
import { format } from "date-fns";

interface SportsCardProps {
  game: {
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
  };
  sport: string;
}

export default function SportsCard({ game, sport }: SportsCardProps) {
  const isLive = game.status === 'live';
  const isFinished = game.status === 'finished';
  const hasScore = game.homeScore !== null && game.awayScore !== null;

  const getStatusColor = () => {
    switch (game.status) {
      case 'live': return 'bg-red-500';
      case 'finished': return 'bg-gray-500';
      case 'postponed': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    switch (game.status) {
      case 'live': return 'LIVE';
      case 'finished': return 'FINAL';
      case 'postponed': return 'POSTPONED';
      default: return 'SCHEDULED';
    }
  };

  return (
    <Card className="sports-card glass-effect border-white/10 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{sport}</CardTitle>
          <Badge className={`${getStatusColor()} text-white font-bold px-2 py-1`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Teams and Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Away Team */}
            <div className="flex items-center space-x-2 flex-1">
              {game.awayTeam.logoUrl && (
                <img 
                  src={game.awayTeam.logoUrl} 
                  alt={game.awayTeam.name}
                  className="w-8 h-8 rounded"
                />
              )}
              <span className="font-medium">{game.awayTeam.name}</span>
              {hasScore && (
                <span className="text-xl font-bold text-primary">
                  {game.awayScore}
                </span>
              )}
            </div>

            <div className="text-muted-foreground font-medium">@</div>

            {/* Home Team */}
            <div className="flex items-center space-x-2 flex-1 justify-end">
              {hasScore && (
                <span className="text-xl font-bold text-primary">
                  {game.homeScore}
                </span>
              )}
              <span className="font-medium">{game.homeTeam.name}</span>
              {game.homeTeam.logoUrl && (
                <img 
                  src={game.homeTeam.logoUrl} 
                  alt={game.homeTeam.name}
                  className="w-8 h-8 rounded"
                />
              )}
            </div>
          </div>
        </div>

        {/* Game Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(game.gameDate), 'EEEE, MMMM d, yyyy')}</span>
            {game.gameTime && (
              <>
                <Clock className="w-4 h-4 ml-2" />
                <span>{game.gameTime}</span>
              </>
            )}
          </div>
          
          {game.venue && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{game.venue}</span>
            </div>
          )}
        </div>

        {/* TV and Streaming Networks */}
        {(game.tvNetworks.length > 0 || game.streamingPlatforms.length > 0) && (
          <div className="space-y-2">
            <div className="font-medium text-sm">Where to Watch:</div>
            
            {/* TV Networks */}
            {game.tvNetworks.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tv className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {game.tvNetworks.map((network) => (
                    <Badge key={network} variant="secondary" className="text-xs">
                      {network}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Streaming Platforms */}
            {game.streamingPlatforms.length > 0 && (
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {game.streamingPlatforms.map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Description */}
        {game.description && (
          <p className="text-sm text-muted-foreground">{game.description}</p>
        )}

        {/* Watch Now Button */}
        {!isFinished && (game.tvNetworks.length > 0 || game.streamingPlatforms.length > 0) && (
          <Button 
            variant="default" 
            size="sm"
            className="w-full bg-gradient-purple hover:opacity-90"
            onClick={() => {
              // Open primary network/platform
              const primaryNetwork = game.tvNetworks[0] || game.streamingPlatforms[0];
              window.open(`https://www.google.com/search?q=watch+${encodeURIComponent(game.description)}+${encodeURIComponent(primaryNetwork)}`, '_blank');
            }}
          >
            {isLive ? 'Watch Live' : 'Set Reminder'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Sports summary component for dashboard
export function SportsSummary({ sport, games }: { sport: string; games: any[] }) {
  const todayGames = games.filter(game => {
    const gameDate = new Date(game.gameDate);
    const today = new Date();
    return gameDate.toDateString() === today.toDateString();
  });

  const liveGames = todayGames.filter(game => game.status === 'live');
  const upcomingGames = todayGames.filter(game => game.status === 'scheduled');

  if (todayGames.length === 0) return null;

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{sport} Today</span>
          <Badge variant="secondary" className="text-xs">
            {todayGames.length} games
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {liveGames.length > 0 && (
          <div>
            <div className="text-sm font-medium text-red-500 mb-2">Live Now</div>
            {liveGames.slice(0, 2).map((game) => (
              <div key={game.sportsDbId} className="text-sm p-2 bg-red-500/10 rounded border border-red-500/20">
                {game.awayTeam.name} @ {game.homeTeam.name}
                {game.homeScore !== null && (
                  <span className="ml-2 font-bold">
                    {game.awayScore} - {game.homeScore}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {upcomingGames.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Coming Up</div>
            {upcomingGames.slice(0, 3).map((game) => (
              <div key={game.sportsDbId} className="text-sm p-2 bg-primary/10 rounded border border-primary/20">
                {game.awayTeam.name} @ {game.homeTeam.name}
                {game.gameTime && <span className="ml-2 text-muted-foreground">{game.gameTime}</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}