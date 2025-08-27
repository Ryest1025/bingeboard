import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

type BasicShow = {
  id: string | number;
  title: string;
  posterUrl?: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  mediaType?: string;
  // If a logo is available from upstream APIs, we can use it directly
  logoUrl?: string;
};

interface HeroSpotProps {
  shows: BasicShow[];
  height?: string; // tailwind class string e.g., "h-[55vh] min-h-[400px]"
  onWatchNow?: (show: BasicShow) => void;
  onMoreInfo?: (show: BasicShow) => void;
}

// Simple in-memory cache for discovered logos (or poster fallbacks)
const logoCache: Record<string, string> = {};

export default function HeroSpot({ shows, height = 'h-[600px]', onWatchNow, onMoreInfo }: HeroSpotProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroLogo, setHeroLogo] = useState<string | undefined>();
  const controls = useAnimation();
  const directionRef = useRef(1); // 1 = forward, -1 = backward
  const pointerStartX = useRef<number | null>(null);
  const pointerStartTime = useRef<number>(0);

  const totalSlides = shows.length;
  const activeShow = shows[activeIndex];

  // Choose a display image for the hero (logo preferred, else poster/backdrop)
  const displayImage = useMemo(() => {
    if (!activeShow) return '';
    if (heroLogo) return heroLogo;
    return activeShow.posterUrl || activeShow.poster || activeShow.backdrop || '';
  }, [activeShow, heroLogo]);

  // Lazy-load logo (if provided) and prefetch next slide imagery
  useEffect(() => {
    const current = activeShow;
    if (!current) return;

    // Prefer provided logoUrl; otherwise cache poster as the "logo"
    const cacheKey = String(current.id);
    const fromCache = logoCache[cacheKey];
    if (fromCache) setHeroLogo(fromCache);
    else if (current.logoUrl) {
      logoCache[cacheKey] = current.logoUrl;
      setHeroLogo(current.logoUrl);
    } else if (current.posterUrl || current.poster) {
      const url = current.posterUrl || current.poster;
      if (url) {
        logoCache[cacheKey] = url;
        setHeroLogo(url);
      }
    } else {
      setHeroLogo(undefined);
    }

    // Prefetch next slide background to smooth transitions
    const nextIndex = (activeIndex + 1) % Math.max(totalSlides, 1);
    const nextShow = shows[nextIndex];
    const nextUrl = nextShow?.backdrop || nextShow?.posterUrl || nextShow?.poster;
    if (nextUrl) {
      const img = new Image();
      img.src = nextUrl;
    }
  }, [activeShow, activeIndex, shows, totalSlides]);

  // Auto-slide every 8s
  useEffect(() => {
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      directionRef.current = 1;
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 8000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Animate subtle zoom / parallax
  useEffect(() => {
    controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
    });
  }, [controls, activeIndex]);

  // Background style
  const backgroundStyle = useMemo<React.CSSProperties>(() => {
    const url = activeShow?.backdrop || activeShow?.posterUrl || activeShow?.poster || '';
    return {
      backgroundImage: url
        ? `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.75)), url(${url})`
        : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }, [activeShow]);

  // Slide animation variants
  const slideVariant = (direction: number) => ({
    initial: { opacity: 0, x: 50 * direction },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 * direction },
    transition: { duration: 0.6 },
  });

  // Minimal swipe detection using pointer events (no external deps)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
    pointerStartTime.current = Date.now();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current == null) return;
    const dx = e.clientX - pointerStartX.current;
    const dt = Date.now() - pointerStartTime.current;
    pointerStartX.current = null;

    const threshold = 40; // px
    const timeMax = 600; // ms
    if (Math.abs(dx) > threshold && dt < timeMax) {
      directionRef.current = dx < 0 ? 1 : -1;
      setActiveIndex((prev) => (prev + directionRef.current + totalSlides) % totalSlides);
    }
  };

  return (
    <div
      className={`relative w-full ${height} overflow-hidden select-none touch-pan-y`}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      role="region"
      aria-label="Featured titles"
    >
      {/* Hero Background */}
      <motion.div className="absolute inset-0" style={backgroundStyle} animate={controls} />

      {/* Hero Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12">
        <AnimatePresence mode="wait">
          {displayImage && (
            <motion.img
              key={String(activeShow?.id) + '-logo'}
              src={displayImage}
              alt={activeShow?.title || 'Featured title'}
              className="max-h-32 md:max-h-48 object-contain mb-4 drop-shadow-lg"
              custom={directionRef.current}
              variants={slideVariant(directionRef.current)}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeShow?.overview && (
            <motion.p
              key={String(activeShow.id) + '-overview'}
              className="text-white text-sm md:text-lg max-w-xl drop-shadow-lg"
              custom={directionRef.current}
              variants={slideVariant(directionRef.current)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activeShow.overview}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA Buttons with subtle animation */}
        <div className="mt-4 flex space-x-3">
          <motion.button
            className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ opacity: [0.95, 1, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => activeShow && onWatchNow?.(activeShow)}
            aria-label={activeShow ? `Watch ${activeShow.title}` : 'Watch now'}
          >
            Watch Now
          </motion.button>

          <motion.button
            className="bg-gray-700 bg-opacity-70 text-white px-4 py-2 rounded-lg font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ opacity: [0.95, 1, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => activeShow && onMoreInfo?.(activeShow)}
            aria-label={activeShow ? `More info about ${activeShow.title}` : 'More info'}
          >
            More Info
          </motion.button>
        </div>
      </div>

      {/* Navigation Dots */}
      {totalSlides > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {shows.map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full ${i === activeIndex ? 'bg-white' : 'bg-gray-400/50'}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                directionRef.current = i > activeIndex ? 1 : -1;
                setActiveIndex(i);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
