import { motion } from "framer-motion";
import { Show } from "@/types";

interface AnimatedShowCardProps {
  show: Show;
  onClick?: () => void;
  onAddToList?: () => void;
  className?: string;
  index?: number;
}

export default function AnimatedShowCard({
  show,
  onClick,
  onAddToList,
  className = "",
  index = 0
}: AnimatedShowCardProps) {
  const posterUrl = show.posterUrl || show.poster;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1.05,
        y: -8,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative cursor-pointer rounded-lg overflow-hidden shadow-lg bg-gray-800 group ${className}`}
      onClick={onClick}
    >
      {/* Poster Image */}
      <div className="relative overflow-hidden">
        <img
          src={posterUrl}
          alt={show.title}
          className="w-full h-[250px] md:h-[300px] object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Actions on Hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToList?.();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
          >
            + Add to List
          </motion.button>
        </motion.div>
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
        <h3 className="text-sm md:text-base font-semibold text-white mb-1 line-clamp-2">
          {show.title}
        </h3>

        {show.genres && show.genres.length > 0 && (
          <p className="text-xs md:text-sm text-gray-300 line-clamp-1">
            {show.genres.slice(0, 2).join(", ")}
          </p>
        )}

        {show.rating && (
          <div className="flex items-center mt-1">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-xs text-gray-300 ml-1">
              {show.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Rating Badge */}
      {show.rating && show.rating >= 8.5 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full"
        >
          {show.rating.toFixed(1)}
        </motion.div>
      )}
    </motion.div>
  );
}
