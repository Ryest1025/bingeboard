import React from 'react';

interface InfoSectionProps {
  title: string;
  year?: number | null;
  genres?: string[];
  showReleaseDate?: boolean;
  showGenres?: boolean;
  showDescription?: boolean;
  description?: string;
  config: {
    padding: string;
    titleSize: string;
    textSize: string;
  };
  className?: string;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  title,
  year,
  genres = [],
  showReleaseDate = false,
  showGenres = false,
  showDescription = false,
  description,
  config,
  className = ''
}) => {
  return (
    <div className={`${config.padding} flex-grow flex flex-col justify-between min-h-0 ${className}`}>
      <div className="space-y-2 flex-grow">
        {/* Title */}
        <h3 className={`${config.titleSize} font-bold text-white leading-tight line-clamp-2 group-hover:text-blue-300 transition-colors duration-300`}>
          {title}
        </h3>
        
        {/* Release Year */}
        {showReleaseDate && year && (
          <p className={`${config.textSize} text-slate-400`}>
            {year}
          </p>
        )}
        
        {/* Genres */}
        {showGenres && genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genres.map((genre, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-slate-700/70 text-slate-300 text-xs rounded-md backdrop-blur-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
        
        {/* Description */}
        {showDescription && description && (
          <p className={`${config.textSize} text-slate-300 line-clamp-3 leading-relaxed`}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};