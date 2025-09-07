// components/BrandShowcase.tsx - BingeBoard Brand Showcase
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, Play, Heart, Zap, Sparkles } from "lucide-react";
import { colors, gradients, radii, spacing, shadows } from "@/styles/tokens";
import { tw } from "@/styles/theme";

export default function BrandShowcase() {
  return (
    <div
      className="min-h-screen p-8"
      style={{ background: colors.background }}
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <h1
            className="text-6xl font-bold"
            style={{
              background: gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BingeBoard
          </h1>
          <p
            className="text-xl max-w-2xl mx-auto"
            style={{ color: colors.textSecondary }}
          >
            Premium streaming discovery with Netflix-level design and performance
          </p>
        </motion.div>

        {/* Color Palette */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: colors.text }}
          >
            Brand Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Primary", color: colors.primary, description: "Hero actions" },
              { name: "Accent", color: colors.accent, description: "Highlights" },
              { name: "Background", color: colors.backgroundCard, description: "Cards" },
              { name: "Success", color: colors.success, description: "Confirmations" },
            ].map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl text-center"
                style={{
                  backgroundColor: colors.backgroundCard,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                  style={{ backgroundColor: item.color }}
                />
                <h3
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  {item.name}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {item.description}
                </p>
                <code
                  className="text-xs mt-2 block"
                  style={{ color: colors.textMuted }}
                >
                  {item.color}
                </code>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Button Styles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: colors.text }}
          >
            Button Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3
                className="text-xl font-semibold"
                style={{ color: colors.text }}
              >
                Primary Actions
              </h3>
              <Button
                size="lg"
                className="w-full gap-3"
                style={{
                  background: gradients.primary,
                  color: colors.text,
                  borderRadius: radii.xl,
                  boxShadow: shadows.glow,
                }}
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Watch Now
              </Button>
              <Button
                size="md"
                className="w-full gap-3"
                style={{
                  background: gradients.primary,
                  color: colors.text,
                  borderRadius: radii.lg,
                }}
              >
                <Zap className="w-4 h-4" />
                Get Started
              </Button>
            </div>

            <div className="space-y-4">
              <h3
                className="text-xl font-semibold"
                style={{ color: colors.text }}
              >
                Secondary Actions
              </h3>
              <Button
                size="lg"
                variant="secondary"
                className="w-full gap-3"
                style={{
                  backgroundColor: colors.backgroundCard,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.xl,
                }}
              >
                <Heart className="w-5 h-5" />
                Add to Watchlist
              </Button>
              <Button
                size="md"
                variant="outline"
                className="w-full gap-3"
                style={{
                  borderColor: colors.border,
                  color: colors.textSecondary,
                  borderRadius: radii.lg,
                }}
              >
                <Sparkles className="w-4 h-4" />
                Discover More
              </Button>
            </div>

            <div className="space-y-4">
              <h3
                className="text-xl font-semibold"
                style={{ color: colors.text }}
              >
                Streaming Platforms
              </h3>
              {[
                { name: "Netflix", color: colors.netflix },
                { name: "Disney+", color: colors.disney },
                { name: "Prime", color: colors.prime },
                { name: "HBO Max", color: colors.hbo },
              ].map((platform) => (
                <Button
                  key={platform.name}
                  size="sm"
                  className="w-full"
                  style={{
                    backgroundColor: platform.color,
                    color: colors.text,
                    borderRadius: radii.md,
                  }}
                >
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Card Styles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: colors.text }}
          >
            Card Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Breaking Bad",
                year: "2008",
                rating: 9.5,
                type: "TV Series",
                poster: "/placeholder.png"
              },
              {
                title: "The Dark Knight",
                year: "2008",
                rating: 9.0,
                type: "Movie",
                poster: "/placeholder.png"
              },
              {
                title: "Stranger Things",
                year: "2016",
                rating: 8.7,
                type: "TV Series",
                poster: "/placeholder.png"
              },
            ].map((show, index) => (
              <motion.div
                key={show.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: shadows.glow,
                }}
                className="group cursor-pointer"
                style={{
                  backgroundColor: colors.backgroundCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii['2xl'],
                  padding: spacing.lg,
                  transition: 'all 0.3s ease',
                }}
              >
                <img
                  src={show.poster}
                  alt={show.title}
                  className="w-full h-48 object-cover mb-4"
                  style={{ borderRadius: radii.lg }}
                />

                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3
                      className="font-semibold text-lg"
                      style={{ color: colors.text }}
                    >
                      {show.title}
                    </h3>
                    <Badge
                      style={{
                        backgroundColor: colors.accent,
                        color: colors.textDark,
                        borderRadius: radii.md,
                      }}
                    >
                      {show.type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      {show.year}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.text }}
                      >
                        {show.rating}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full mt-4 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: gradients.primary,
                      color: colors.text,
                      borderRadius: radii.lg,
                    }}
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                    Watch Trailer
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Typography */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: colors.text }}
          >
            Typography Scale
          </h2>
          <div className="space-y-4">
            {[
              { size: "5xl", text: "Hero Heading", weight: "bold" },
              { size: "3xl", text: "Section Heading", weight: "semibold" },
              { size: "xl", text: "Card Title", weight: "medium" },
              { size: "base", text: "Body Text", weight: "normal" },
              { size: "sm", text: "Caption Text", weight: "normal" },
            ].map((item) => (
              <div
                key={item.size}
                className={`text-${item.size} font-${item.weight}`}
                style={{ color: colors.text }}
              >
                {item.text} - {item.size}
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
