import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Zap } from "lucide-react";

interface GenreCompatibilityProps {
  compatibility: {
    [genre: string]: number;
  };
  friendName: string;
}

export function GenreCompatibility({ compatibility, friendName }: GenreCompatibilityProps) {
  const genres = Object.entries(compatibility).sort((a, b) => b[1] - a[1]);
  
  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-cyan-500 to-blue-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Perfect Match';
    if (score >= 60) return 'Great Match';
    if (score >= 40) return 'Good Match';
    return 'Different Taste';
  };

  const getMatchIcon = (score: number) => {
    if (score >= 80) return '🎯';
    if (score >= 60) return '⭐';
    if (score >= 40) return '👍';
    return '🤔';
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Target className="h-5 w-5 text-cyan-400" />
          Genre Compatibility
        </CardTitle>
        <p className="text-slate-400 text-sm">See how your tastes align with {friendName}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {genres.map(([genre, score], idx) => (
          <motion.div
            key={genre}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMatchIcon(score)}</span>
                <div>
                  <p className="text-white font-medium">{genre}</p>
                  <p className="text-slate-400 text-xs">{getCompatibilityLabel(score)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  className={`bg-gradient-to-r ${getCompatibilityColor(score)} text-white border-0`}
                >
                  {score}%
                </Badge>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: idx * 0.05 + 0.2, duration: 0.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${getCompatibilityColor(score)}`}
              />
            </div>
          </motion.div>
        ))}

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4 border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              <p className="text-white font-semibold">Compatibility Insight</p>
            </div>
            <p className="text-slate-300 text-sm">
              You and {friendName} have a{' '}
              <span className="text-cyan-400 font-semibold">
                {Math.round(genres.reduce((acc, [, score]) => acc + score, 0) / genres.length)}%
              </span>{' '}
              overall match! You both love{' '}
              <span className="text-cyan-400 font-semibold">{genres[0][0]}</span> the most.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
