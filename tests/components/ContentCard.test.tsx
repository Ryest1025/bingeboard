import { render, screen, fireEvent } from '@testing-library/react';
import { ContentCard } from '@/components/ui/ContentCard';

// Mock TMDB API response data
const mockShow = {
  id: 1399,
  name: "Game of Thrones",
  overview: "Seven noble families fight for control of the mythical land of Westeros.",
  poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
  first_air_date: "2011-04-17",
  vote_average: 9.3,
  genre_ids: [18, 10759, 10765],
  origin_country: ["US"],
  original_language: "en",
  popularity: 369.594,
  vote_count: 11504
};

const mockWatchProviders = [
  {
    provider_id: 8,
    provider_name: "Netflix",
    logo_path: "/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg"
  },
  {
    provider_id: 384,
    provider_name: "HBO Max",
    logo_path: "/Ajqyt5aNxNGjmF9uOfxArGrdf3X.jpg"
  }
];

describe('ContentCard', () => {
  const mockProps = {
    item: mockShow,
    type: 'tv' as const,
    onWatchNow: jest.fn(),
    onAddToWatchlist: jest.fn(),
    providers: mockWatchProviders
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders show information correctly', () => {
    render(<ContentCard {...mockProps} />);
    
    expect(screen.getByText('Game of Thrones')).toBeInTheDocument();
    expect(screen.getByText(/Seven noble families fight/)).toBeInTheDocument();
    expect(screen.getByText('9.3')).toBeInTheDocument();
  });

  it('displays streaming providers when available', () => {
    render(<ContentCard {...mockProps} />);
    
    // Should show Netflix and HBO Max logos
    expect(screen.getByAltText('Netflix')).toBeInTheDocument();
    expect(screen.getByAltText('HBO Max')).toBeInTheDocument();
  });

  it('handles single provider with direct Watch Now button', () => {
    const singleProviderProps = {
      ...mockProps,
      providers: [mockWatchProviders[0]]
    };
    
    render(<ContentCard {...singleProviderProps} />);
    
    const watchButton = screen.getByRole('button', { name: /watch now/i });
    fireEvent.click(watchButton);
    
    expect(mockProps.onWatchNow).toHaveBeenCalledWith(mockShow, mockWatchProviders[0]);
  });

  it('shows dropdown selector for multiple providers', () => {
    render(<ContentCard {...mockProps} />);
    
    // Should show dropdown for multiple providers
    const dropdown = screen.getByRole('button', { name: /choose streaming service/i });
    expect(dropdown).toBeInTheDocument();
  });

  it('handles add to watchlist action', () => {
    render(<ContentCard {...mockProps} />);
    
    const addButton = screen.getByRole('button', { name: /add to watchlist/i });
    fireEvent.click(addButton);
    
    expect(mockProps.onAddToWatchlist).toHaveBeenCalledWith(mockShow);
  });

  it('displays fallback image when poster fails to load', () => {
    const showWithoutPoster = {
      ...mockShow,
      poster_path: null
    };
    
    render(<ContentCard {...mockProps} item={showWithoutPoster} />);
    
    const image = screen.getByAltText('Game of Thrones');
    fireEvent.error(image);
    
    // Should show placeholder image
    expect(image).toHaveAttribute('src', '/placeholder-poster.png');
  });

  it('renders different styling for movies vs TV shows', () => {
    const movieProps = {
      ...mockProps,
      type: 'movie' as const
    };
    
    render(<ContentCard {...movieProps} />);
    
    // Should have movie-specific styling classes
    const card = screen.getByTestId('content-card');
    expect(card).toHaveClass('content-card-movie');
  });
});