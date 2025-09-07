import RecommendationCard, { Show } from "./RecommendationCard";

interface RecommendationGridProps {
  shows: Show[];
  title?: string;
  variant?: 'default' | 'compact' | 'large';
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  onInteraction?: (action: string, tmdbId: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function RecommendationGrid({
  shows,
  title,
  variant = 'default',
  columns = { sm: 2, md: 3, lg: 4, xl: 5 },
  onInteraction,
  isLoading = false,
  emptyMessage = "No recommendations available"
}: RecommendationGridProps) {
  const getGridClasses = () => {
    const { sm = 2, md = 3, lg = 4, xl = 5 } = columns;
    
    // Use static classes to ensure Tailwind includes them
    const gridMap = {
      2: 'grid-cols-2',
      3: 'grid-cols-3', 
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6'
    };

    const smClass = gridMap[sm as keyof typeof gridMap] || 'grid-cols-2';
    const mdClass = gridMap[md as keyof typeof gridMap] || 'grid-cols-3';
    const lgClass = gridMap[lg as keyof typeof gridMap] || 'grid-cols-4';
    const xlClass = gridMap[xl as keyof typeof gridMap] || 'grid-cols-5';

    return `grid ${smClass} md:${mdClass} lg:${lgClass} xl:${xlClass} gap-4`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
        <div className={getGridClasses()}>
          {Array.from({ length: columns.xl || 5 }).map((_, idx) => (
            <div key={idx} className="animate-pulse">
              <div className="bg-gray-700 rounded-lg h-64 mb-2" />
              <div className="bg-gray-700 rounded h-4 mb-1" />
              <div className="bg-gray-700 rounded h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!shows || shows.length === 0) {
    return (
      <div className="space-y-4">
        {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
        <div className="text-center py-8 text-gray-400">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
      <div className={getGridClasses()}>
        {shows.map((show) => (
          <RecommendationCard
            key={show.tmdbId}
            show={show}
            variant={variant}
            onInteraction={onInteraction}
          />
        ))}
      </div>
    </div>
  );
}
