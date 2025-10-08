import React from 'react';
import { UniversalMediaCard } from '@/components/universal';

// Sample media data for demonstrating the premium cards
const sampleMovies = [
  {
    id: 1,
    title: "The Matrix",
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    backdrop_path: "/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg",
    vote_average: 8.7,
    genre_ids: [28, 878, 53],
    overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    release_date: "1999-03-31",
    media_type: "movie" as const,
    streaming_platforms: [
      { provider_id: 8, provider_name: "Netflix" },
      { provider_id: 337, provider_name: "Disney+" }
    ]
  },
  {
    id: 2,
    title: "Inception",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    vote_average: 8.8,
    genre_ids: [28, 878, 53],
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    release_date: "2010-07-16",
    media_type: "movie" as const,
    streaming_platforms: [
      { provider_id: 119, provider_name: "Amazon Prime Video" },
      { provider_id: 384, provider_name: "HBO Max" }
    ]
  },
  {
    id: 3,
    name: "Stranger Things",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    vote_average: 8.6,
    genre_ids: [18, 9648, 878],
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
    first_air_date: "2016-07-15",
    media_type: "tv" as const,
    streaming_platforms: [
      { provider_id: 8, provider_name: "Netflix" }
    ]
  }
];

const CardDemo: React.FC = () => {
  const handleAction = (media: any, action: string) => {
    console.log(`${action} clicked for:`, media.title);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Premium UniversalMediaCard Showcase</h1>
          <p className="text-slate-300 text-lg">Modern redesign with floating actions, gradient overlays, and unified styling</p>
        </div>

        {/* Spotlight/Hero Card */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Spotlight/Hero Card</h2>
          <UniversalMediaCard
            media={sampleMovies[0]}
            variant="spotlight"
            size="xl"
            showRating
            showGenres
            showDescription
            showStreamingLogos
            actions={{ 
              watchNow: true, 
              trailer: true, 
              addToList: true, 
              share: true 
            }}
            onWatchNow={(media) => handleAction(media, 'Watch Now')}
            onWatchTrailer={(media) => handleAction(media, 'Trailer')}
            onAddToWatchlist={(media) => handleAction(media, 'Add to List')}
            onShareContent={(media) => handleAction(media, 'Share')}
            onCardClick={(media) => handleAction(media, 'Card Click')}
          />
        </section>

        {/* Vertical Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Vertical Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleMovies.map((movie) => (
              <UniversalMediaCard
                key={movie.id}
                media={movie}
                variant="vertical"
                size="md"
                showRating
                showGenres
                showReleaseDate
                showStreamingLogos
                actions={{ 
                  watchNow: true, 
                  trailer: true, 
                  addToList: true 
                }}
                onWatchNow={(media) => handleAction(media, 'Watch Now')}
                onWatchTrailer={(media) => handleAction(media, 'Trailer')}
                onAddToWatchlist={(media) => handleAction(media, 'Add to List')}
                onCardClick={(media) => handleAction(media, 'Card Click')}
              />
            ))}
          </div>
        </section>

        {/* Horizontal Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Horizontal Cards</h2>
          <div className="space-y-4">
            {sampleMovies.map((movie) => (
              <UniversalMediaCard
                key={`horizontal-${movie.id}`}
                media={movie}
                variant="horizontal"
                size="md"
                showRating
                showDescription
                showStreamingLogos
                actions={{ 
                  watchNow: true, 
                  addToList: true, 
                  trailer: true 
                }}
                onWatchNow={(media) => handleAction(media, 'Watch Now')}
                onWatchTrailer={(media) => handleAction(media, 'Trailer')}
                onAddToWatchlist={(media) => handleAction(media, 'Add to List')}
                onCardClick={(media) => handleAction(media, 'Card Click')}
              />
            ))}
          </div>
        </section>

        {/* Compact Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Compact Cards</h2>
          <div className="space-y-3">
            {sampleMovies.map((movie) => (
              <UniversalMediaCard
                key={`compact-${movie.id}`}
                media={movie}
                variant="compact"
                size="sm"
                showRating
                showReleaseDate
                showStreamingLogos
                actions={{ 
                  addToList: true, 
                  watchNow: true 
                }}
                onWatchNow={(media) => handleAction(media, 'Watch Now')}
                onAddToWatchlist={(media) => handleAction(media, 'Add to List')}
                onCardClick={(media) => handleAction(media, 'Card Click')}
              />
            ))}
          </div>
        </section>

        {/* Feature List */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-slate-300">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-3">🎨 Modern Design</h3>
              <ul className="space-y-2 text-sm">
                <li>• Gradient overlays & backgrounds</li>
                <li>• Premium glass-morphism effects</li>
                <li>• Enhanced typography & spacing</li>
                <li>• Consistent design language</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-3">⚡ Floating Actions</h3>
              <ul className="space-y-2 text-sm">
                <li>• Smooth hover animations</li>
                <li>• Context-aware button placement</li>
                <li>• Backdrop blur effects</li>
                <li>• Micro-interaction feedback</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-3">🎭 Enhanced UX</h3>
              <ul className="space-y-2 text-sm">
                <li>• Framer Motion integration</li>
                <li>• Staggered content reveals</li>
                <li>• Scale & glow hover effects</li>
                <li>• Unified interaction patterns</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CardDemo;