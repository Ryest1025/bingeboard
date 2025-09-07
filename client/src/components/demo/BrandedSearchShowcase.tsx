// components/demo/BrandedSearchShowcase.tsx - Showcase the Enhanced Search System
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import BrandedSearchBar from "@/components/search/BrandedSearchBar";
import { colors, gradients, radii, spacing, shadows } from "@/styles/tokens";
import { tw } from "@/styles/theme";
import {
  Play,
  Heart,
  Star,
  Clock,
  Users,
  Zap,
  Search,
  MousePointer,
  Keyboard,
  Eye
} from "lucide-react";

// Create a dedicated query client for the demo
const demoQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}

const searchFeatures: Feature[] = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Search",
    description: "Real-time results as you type with smart debouncing and prefetching",
    highlight: "< 100ms response",
  },
  {
    icon: <Keyboard className="w-6 h-6" />,
    title: "Full Accessibility",
    description: "Complete keyboard navigation, ARIA roles, and screen reader support",
    highlight: "WCAG 2.1 AA",
  },
  {
    icon: <MousePointer className="w-6 h-6" />,
    title: "Inline Actions",
    description: "Watch trailers and manage watchlist without leaving search results",
    highlight: "Zero-click UX",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Smart Previews",
    description: "Hover for instant show details, cast, ratings, and streaming info",
    highlight: "Netflix-level",
  },
];

const stats = [
  { label: "Search Results", value: "10,000+", icon: <Search className="w-5 h-5" /> },
  { label: "Avg Response", value: "< 50ms", icon: <Zap className="w-5 h-5" /> },
  { label: "Accessibility", value: "100%", icon: <Heart className="w-5 h-5" /> },
  { label: "Mobile Ready", value: "Perfect", icon: <Star className="w-5 h-5" /> },
];

export default function BrandedSearchShowcase() {
  const [searchStats, setSearchStats] = useState({
    searches: 0,
    trailerClicks: 0,
    watchlistAdds: 0,
  });

  const handleAddToWatchlist = (showId: number) => {
    setSearchStats(prev => ({ ...prev, watchlistAdds: prev.watchlistAdds + 1 }));
    console.log(`Added show ${showId} to watchlist`);
  };

  const handleWatchNow = (show: any) => {
    setSearchStats(prev => ({ ...prev, trailerClicks: prev.trailerClicks + 1 }));
    console.log(`Starting to watch:`, show);
  };

  return (
    <QueryClientProvider client={demoQueryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.primary}20 0%, transparent 50%), 
                             radial-gradient(circle at 75% 75%, ${colors.accent}20 0%, transparent 50%)`,
          }}
        />

        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: gradients.primary,
                  boxShadow: `0 8px 32px ${colors.primary}40`,
                }}
              >
                <Search className="w-6 h-6 text-white" />
              </div>
              <h1
                className="text-4xl md:text-6xl font-bold"
                style={{
                  background: gradients.primary,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                BingeBoard Search
              </h1>
            </div>

            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience our premium search system with instant results,
              accessibility-first design, and Netflix-level user experience
            </p>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="p-4 rounded-xl text-center"
                  style={{
                    background: `${colors.backgroundCard}80`,
                    border: `1px solid ${colors.border}`,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    className="flex items-center justify-center mb-2"
                    style={{ color: colors.primary }}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main Search Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-4xl mx-auto mb-16"
          >
            <div
              className="p-8 rounded-3xl"
              style={{
                background: `${colors.backgroundCard}40`,
                border: `1px solid ${colors.borderLight}`,
                backdropFilter: "blur(20px)",
                boxShadow: shadows["2xl"],
              }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Try the Enhanced Search Experience
                </h2>
                <p className="text-slate-400">
                  Search for movies, TV shows, or people. Use keyboard navigation and try the inline actions.
                </p>
              </div>

              <BrandedSearchBar
                placeholder="Search for The Matrix, Breaking Bad, Ryan Gosling..."
                className="mx-auto"
                onAddToWatchlist={handleAddToWatchlist}
                onWatchNow={handleWatchNow}
              />

              {/* Usage Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg" style={{ background: `${colors.primary}10` }}>
                  <div className="text-lg font-bold" style={{ color: colors.primary }}>
                    {searchStats.searches}
                  </div>
                  <div className="text-xs text-slate-400">Searches</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: `${colors.accent}10` }}>
                  <div className="text-lg font-bold" style={{ color: colors.accent }}>
                    {searchStats.trailerClicks}
                  </div>
                  <div className="text-xs text-slate-400">Trailers</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: `${colors.success}10` }}>
                  <div className="text-lg font-bold" style={{ color: colors.success }}>
                    {searchStats.watchlistAdds}
                  </div>
                  <div className="text-xs text-slate-400">Watchlist</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {searchFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl group cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  background: `${colors.backgroundCard}60`,
                  border: `1px solid ${colors.border}`,
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: `${colors.primary}20`,
                    color: colors.primary,
                  }}
                >
                  {feature.icon}
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                  {feature.description}
                </p>

                <div
                  className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                  style={{
                    background: `${colors.accent}20`,
                    color: colors.accent,
                  }}
                >
                  {feature.highlight}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div
              className="p-6 rounded-2xl"
              style={{
                background: `${colors.backgroundCard}40`,
                border: `1px solid ${colors.border}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                How to Use
              </h3>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Keyboard className="w-4 h-4 text-slate-400" />
                  <span>Use ↑↓ arrows to navigate, Enter to select</span>
                </div>
                <div className="flex items-center gap-3">
                  <MousePointer className="w-4 h-4 text-slate-400" />
                  <span>Hover or click results for instant details</span>
                </div>
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 text-slate-400" />
                  <span>Click "Trailer" or "Watchlist" for inline actions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>Modal opens with full show details and streaming info</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
