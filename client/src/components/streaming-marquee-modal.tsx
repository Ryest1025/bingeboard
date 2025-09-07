import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StreamingMarqueeModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCloseDelay?: number;
  className?: string;
}

const streamingServices = [
  { name: "Netflix", logo: "https://images.justwatch.com/icon/207360008/s200/netflix.png", color: "#E50914" },
  { name: "Disney+", logo: "https://images.justwatch.com/icon/147638351/s200/disney-plus.png", color: "#0063D1" },
  { name: "Max", logo: "https://images.justwatch.com/icon/52449539/s200/max.png", color: "#8A2BE2" },
  { name: "Amazon Prime Video", logo: "https://images.justwatch.com/icon/52449062/s200/amazon-prime-video.png", color: "#00A8E1" },
  { name: "Hulu", logo: "https://images.justwatch.com/icon/52449639/s200/hulu.png", color: "#1CE783" },
  { name: "Apple TV+", logo: "https://images.justwatch.com/icon/190848813/s200/apple-tv-plus.png", color: "#FFFFFF" },
  { name: "Paramount+", logo: "https://images.justwatch.com/icon/52449516/s200/paramount-plus.png", color: "#0064FF" },
  { name: "Peacock", logo: "https://images.justwatch.com/icon/52449334/s200/peacock.png", color: "#FA6400" },
  { name: "Crunchyroll", logo: "https://images.justwatch.com/icon/127514713/s200/crunchyroll.png", color: "#FF6500" },
  { name: "YouTube TV", logo: "https://images.justwatch.com/icon/52449020/s200/youtube-tv.png", color: "#FF0000" },
  { name: "Showtime", logo: "https://images.justwatch.com/icon/52449062/s200/showtime.png", color: "#D32F2F" },
  { name: "Starz", logo: "https://images.justwatch.com/icon/52449051/s200/starz.png", color: "#000000" }
];

const marqueeServices = [...streamingServices, ...streamingServices, ...streamingServices];

export function StreamingMarqueeModal({
  isOpen,
  onClose,
  autoCloseDelay = 5000,
  className
}: StreamingMarqueeModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [forceRender, setForceRender] = useState(Date.now()); // Force re-render

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setForceRender(Date.now()); // Update render key when modal opens
      if (autoCloseDelay > 0) {
        const timer = setTimeout(handleClose, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      key={`streaming-modal-${forceRender}`}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/60 backdrop-blur-sm",
        "transition-all duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          "relative w-full max-w-6xl mx-4",
          "bg-gradient-to-br from-red-900/95 to-blue-800/95",
          "backdrop-blur-xl border-4 border-yellow-500",
          "rounded-2xl shadow-2xl overflow-hidden",
          "transition-all duration-300 ease-out",
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        )}
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-bold text-yellow-400 mb-2 animate-pulse">🚨 TESTING CHANGES VISIBLE? 🚨</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900/30 to-slate-800/30 py-12">
          <div className="flex items-center space-x-12 animate-marquee">
            {marqueeServices.map((service, index) => (
              <div
                key={`${service.name}-${index}-${Date.now()}`}
                className="flex-shrink-0 flex items-center justify-center group cursor-pointer"
                style={{ minWidth: "300px" }}
              >
                <img
                  src={`${service.logo}?cache=${Date.now()}&force=true`}
                  alt={service.name}
                  className="h-64 w-auto object-contain group-hover:scale-110 transition-all duration-300 drop-shadow-2xl border-2 border-red-500"
                  style={{
                    filter: service.color === "#000000" ? "invert(1) contrast(2) brightness(3)" : "brightness(1.3) contrast(1.1)"
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <span
                  className="hidden text-white font-semibold text-sm drop-shadow-lg"
                  style={{ color: service.color }}
                >
                  {service.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (optional) */}
        <div className="p-6 pt-4 text-center"></div>
      </div>
    </div>
  );
}

// CSS for the marquee animation – put this in your global CSS file
export const marqueeStyles = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
`;
