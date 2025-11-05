import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp } from "lucide-react";

interface MutualWatchStatsProps {
  stats: {
    totalShared: number;
    topShows: Array<{
      title: string;
      yourRating: number;
      theirRating: number;
      poster: string;
    }>;
    genreBreakdown: {
      genre: string;
      count: number;
    }[];
  };
  friendName: string;
}

export function MutualWatchStats({ stats, friendName }: MutualWatchStatsProps) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          What You Both Watch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Shared */}
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-cyan-400">{stats.totalShared}</p>
          <p className="text-slate-400 text-sm">Shows watched together</p>
        </div>

        {/* Top Shared Shows */}
        <div>
          <h4 className="text-white font-semibold mb-3">Your Favorites</h4>
          <div className="space-y-3">
            {stats.topShows.map((show, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-2"
              >
                <div className="w-12 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                  <img src={show.poster} alt={show.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{show.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">You:</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < show.yourRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">Them:</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < show.theirRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Genre Breakdown */}
        <div>
          <h4 className="text-white font-semibold mb-3">Genre Distribution</h4>
          <div className="space-y-2">
            {stats.genreBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-slate-300 text-sm w-24">{item.genre}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / stats.totalShared) * 100}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                  />
                </div>
                <span className="text-slate-400 text-sm w-8">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
