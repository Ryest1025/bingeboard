import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Info, 
  Plus, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Award,
  Zap,
  Heart,
  Eye,
  Calendar,
  Globe,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RecommendationReason {
  icon: React.ReactNode;
  text: string;
  type: 'trending' | 'personal' | 'critical' | 'seasonal' | 'mood';
}

interface IntelligentShow {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  backdropImage: string;
  posterImage: string;
  rating: number;
  year: number;
  runtime: number;
  genre: string[];
  network: string;
  type: 'movie' | 'tv';
  matchPercentage: number;
  totalViewers: string;
  reasons: RecommendationReason[];
  mood: string;
  intensity: 'light' | 'medium' | 'intense';
  criticsScore?: number;
  audienceScore?: number;
  releaseStatus: 'released' | 'upcoming' | 'trending';
}

interface IntelligentHeroProps {
  onWatchNow?: (show: IntelligentShow) => void;
  onAddToWatchlist?: (show: IntelligentShow) => void;
  onShowInfo?: (show: IntelligentShow) => void;
}

// Streaming platform logo mapping
const getStreamingLogo = (network: string): string => {
  const logoMap: { [key: string]: string } = {
    'Netflix': '/logos/netflix.png',
    'Prime Video': '/logos/prime-video.png',
    'Disney+': '/logos/disney-plus.png',
    'HBO Max': '/logos/hbo-max.png',
    'Hulu': '/logos/hulu.png',
    'FX on Hulu': '/logos/hulu.png',
    'Paramount+': '/logos/paramount-plus.png',
    'Peacock': '/logos/peacock.png',
    'Apple TV+': '/logos/apple-tv.png',
    'Showtime': '/logos/showtime.png',
    'Starz': '/logos/starz.png',
    'Discovery+': '/logos/discovery-plus.png'
  };
  return logoMap[network] || '/logos/netflix.png';
};

// Mock data with intelligent recommendations
const intelligentShows: IntelligentShow[] = [
  {
    id: '1',
    title: 'The Bear',
    description: 'A young chef from the fine dining world comes home to Chicago to run his deceased brother\'s Italian beef sandwich shop. A world of blue-collar cooking, grief, and chaos awaits.',
    shortDescription: 'Critically acclaimed kitchen drama with heart',
    backdropImage: 'https://image.tmdb.org/t/p/w780/9XkScd3aKhkUgcCzwTdFPtJrPCQ.jpg',
    posterImage: 'https://image.tmdb.org/t/p/w342/rtnBpKMjMqVTiKR7VBFWmnhITJg.jpg',
    rating: 9.1,
    year: 2022,
    runtime: 28,
    genre: ['Drama', 'Comedy'],
    network: 'Hulu',
    type: 'tv',
    matchPercentage: 97,
    totalViewers: '2.4M',
    mood: 'Intense but Rewarding',
    intensity: 'medium',
    criticsScore: 95,
    audienceScore: 89,
    releaseStatus: 'trending',
    reasons: [
      { icon: <Award className="w-4 h-4" />, text: '11 Emmy wins including Best Comedy', type: 'critical' },
      { icon: <TrendingUp className="w-4 h-4" />, text: 'Most talked about show this week', type: 'trending' },
      { icon: <Heart className="w-4 h-4" />, text: 'Perfect for fans of workplace dramedies', type: 'personal' },
      { icon: <Sparkles className="w-4 h-4" />, text: 'Authentic portrayal of kitchen culture', type: 'mood' }
    ]
  },
  {
    id: '2',
    title: 'Avatar: The Way of Water',
    description: 'Set more than a decade after the events of the first film, Avatar: The Way of Water begins to tell the story of the Sully family, the trouble that follows them, and the lengths they go to keep each other safe.',
    shortDescription: 'Visually stunning underwater epic',
    backdropImage: 'https://image.tmdb.org/t/p/w1280/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
    posterImage: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
    rating: 7.8,
    year: 2022,
    runtime: 192,
    genre: ['Sci-Fi', 'Adventure', 'Family'],
    network: 'Disney+',
    type: 'movie',
    matchPercentage: 89,
    totalViewers: '15.2M',
    mood: 'Epic Adventure',
    intensity: 'medium',
    criticsScore: 76,
    audienceScore: 92,
    releaseStatus: 'released',
    reasons: [
      { icon: <Eye className="w-4 h-4" />, text: 'Groundbreaking visual effects', type: 'critical' },
      { icon: <Globe className="w-4 h-4" />, text: 'Immersive world-building experience', type: 'mood' },
      { icon: <Users className="w-4 h-4" />, text: '92% audience loved the underwater scenes', type: 'personal' },
      { icon: <Star className="w-4 h-4" />, text: 'Perfect weekend family viewing', type: 'seasonal' }
    ]
  },
  {
    id: '3',
    title: 'House of the Dragon',
    description: 'The Targaryen civil war, known as the Dance of the Dragons, comes to the small screen in this Game of Thrones prequel series.',
    shortDescription: 'Epic fantasy returning to Westeros',
    backdropImage: 'https://image.tmdb.org/t/p/w1280/7ZQJWbKEHdyBpH7G5hWhJ3V3LIC.jpg',
    posterImage: 'https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
    rating: 8.4,
    year: 2022,
    runtime: 68,
    genre: ['Fantasy', 'Drama', 'Action'],
    network: 'HBO Max',
    type: 'tv',
    matchPercentage: 94,
    totalViewers: '29.1M',
    mood: 'Dark & Political',
    intensity: 'intense',
    criticsScore: 84,
    audienceScore: 86,
    releaseStatus: 'trending',
    reasons: [
      { icon: <TrendingUp className="w-4 h-4" />, text: 'HBO\'s biggest premiere ever', type: 'trending' },
      { icon: <Zap className="w-4 h-4" />, text: 'Redeems the Game of Thrones universe', type: 'critical' },
      { icon: <Heart className="w-4 h-4" />, text: 'For fans craving epic fantasy', type: 'personal' },
      { icon: <Calendar className="w-4 h-4" />, text: 'New episodes weekly', type: 'seasonal' }
    ]
  }
];

export const IntelligentHero: React.FC<IntelligentHeroProps> = ({
  onWatchNow,
  onAddToWatchlist,
  onShowInfo
}) => {
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [imageCache, setImageCache] = useState<{ [key: string]: boolean }>({});

  const currentShow = intelligentShows[currentShowIndex];

  // Preload all images for smooth transitions
  useEffect(() => {
    intelligentShows.forEach((show) => {
      // Preload backdrop
      const backdropImg = new Image();
      backdropImg.onload = () => {
        setImageCache(prev => ({ ...prev, [show.backdropImage]: true }));
      };
      backdropImg.src = show.backdropImage;

      // Preload poster
      const posterImg = new Image();
      posterImg.onload = () => {
        setImageCache(prev => ({ ...prev, [show.posterImage]: true }));
      };
      posterImg.src = show.posterImage;
    });
  }, []);

  // Set background loaded when current image is cached
  useEffect(() => {
    setBackgroundLoaded(imageCache[currentShow.backdropImage] || false);
  }, [currentShow.backdropImage, imageCache]);

  // Auto-rotate through shows (reduced frequency for performance)
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentShowIndex((prev) => (prev + 1) % intelligentShows.length);
    }, 15000); // Increased to 15 seconds for better UX

    return () => clearInterval(interval);
  }, [isPlaying]);

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'light': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'intense': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getReasonIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'trending': return <TrendingUp className={iconClass} />;
      case 'critical': return <Award className={iconClass} />;
      case 'personal': return <Heart className={iconClass} />;
      case 'seasonal': return <Calendar className={iconClass} />;
      case 'mood': return <Sparkles className={iconClass} />;
      default: return <Star className={iconClass} />;
    }
  };

  return (
    <div className="relative h-[90vh] w-full overflow-hidden rounded-3xl bg-slate-900">
      {/* Loading State */}
      {!backgroundLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-white/60 text-lg">Loading your personalized recommendations...</p>
          </div>
        </div>
      )}

      {/* Dynamic Background with Parallax */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentShow.id}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: backgroundLoaded ? 1 : 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src={currentShow.backdropImage} 
            alt={currentShow.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Enhanced Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content Side */}
            <motion.div 
              key={`content-${currentShow.id}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Status & Match */}
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-500/30 px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {currentShow.matchPercentage}% Match
                </Badge>
                <Badge variant="secondary" className={getIntensityColor(currentShow.intensity)}>
                  {currentShow.mood}
                </Badge>
                <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {currentShow.totalViewers} watching
                </Badge>
              </div>

              {/* Title & Year with Streaming Logo */}
              <div className="space-y-2">
                <motion.h1 
                  className="text-5xl lg:text-7xl font-bold text-white leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {currentShow.title}
                </motion.h1>
                <div className="flex items-center gap-4 text-slate-300 flex-wrap">
                  <span className="text-xl font-medium">{currentShow.year}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{currentShow.rating}</span>
                  </div>
                  <span>{currentShow.runtime}min</span>
                  <span className="capitalize">{currentShow.type}</span>
                  
                  {/* Streaming Platform Logo */}
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
                    <img 
                      src={getStreamingLogo(currentShow.network)} 
                      alt={currentShow.network}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-sm font-medium">{currentShow.network}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-slate-200 leading-relaxed max-w-xl">
                {currentShow.shortDescription}
              </p>

              {/* Why This Recommendation */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  Why we picked this for you
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentShow.reasons.map((reason, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                    >
                      <div className="text-blue-400 flex-shrink-0">
                        {reason.icon}
                      </div>
                      <span className="text-sm text-slate-200">{reason.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-wrap gap-4 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-3 text-lg"
                  onClick={() => onWatchNow?.(currentShow)}
                >
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Watch Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 px-6 py-3"
                  onClick={() => onAddToWatchlist?.(currentShow)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  My List
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10 px-6 py-3"
                  onClick={() => onShowInfo?.(currentShow)}
                >
                  <Info className="w-5 h-5 mr-2" />
                  More Info
                </Button>
              </motion.div>
            </motion.div>

            {/* Poster Side with Enhanced Design */}
            <motion.div 
              key={`poster-${currentShow.id}`}
              initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                {/* Poster with 3D effect */}
                <div className="relative transform transition-transform duration-700 hover:scale-105 hover:rotate-1">
                  <img 
                    src={currentShow.posterImage}
                    alt={currentShow.title}
                    className="w-80 h-[480px] object-cover rounded-2xl shadow-2xl border border-white/10"
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Floating Stats */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{currentShow.criticsScore}%</div>
                    <div className="text-xs text-slate-400">Critics</div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{currentShow.audienceScore}%</div>
                    <div className="text-xs text-slate-400">Audience</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {intelligentShows.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentShowIndex(index);
              setIsPlaying(false);
              setTimeout(() => setIsPlaying(true), 5000);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentShowIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: isPlaying ? "100%" : "0%" }}
          transition={{ duration: 12, ease: "linear" }}
          key={currentShowIndex}
        />
      </div>
    </div>
  );
};

export default IntelligentHero;