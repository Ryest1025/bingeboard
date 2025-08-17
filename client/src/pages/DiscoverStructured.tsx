// client/src/pages/DiscoverStructured.tsx - New Functional & Intentional Design (restored + compact hero)
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
// Color extraction for dynamic hero gradient
import ColorThief from 'colorthief';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import AppLayout from "@/components/layouts/AppLayout";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserActions } from '@/hooks/useUserActions';
import BrandedShowModal from '@/components/search/BrandedShowModal';
import UniversalShowCard from '@/components/global/UniversalShowCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Play, Plus, ChevronRight, ChevronLeft, Calendar, Film, Tv, Globe, Sparkles, ChevronDown } from 'lucide-react';

// ———————————————————————————————————————————————————————————
// Types
// ———————————————————————————————————————————————————————————

type Show = {
	id: string | number;
	title: string;
	year?: number;
	posterUrl?: string;
	poster?: string;
	backdrop?: string;
	overview?: string;
	genres?: string[];
	releaseDate?: string;
	rating?: number;
	runtime?: number;
	streamingPlatform?: string;
	platform?: string;
	mediaType?: string;
	streamingPlatforms?: Array<{
		provider_id: number;
		provider_name: string;
		logo_path?: string;
		type?: string;
	}>;
};

type FilterState = {
	mood: string | null;
	genre?: string;
	sort?: string;
	platforms?: string[];
	rating?: number;
	year?: number;
	country?: string;
};

interface DiscoverData {
	hero: Show | null;
	forYou: Show[];
	moodBuckets: string[];
	dynamicBlocks: { id: string; type: string; title: string }[];
	trendingThisWeek: Show[];
	anniversaries: any[];
	socialBuzz: { id: string; topic: string; mentions: number }[];
	meta: { source: string; fetchedAt: string };
}

// ———————————————————————————————————————————————————————————
// API utilities (with error handling for React Query)
// ———————————————————————————————————————————————————————————

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
	try {
		const res = await fetch(url, { 
			...init, 
			credentials: 'include',
			headers: { 
				'Content-Type': 'application/json', 
				...(init?.headers || {}) 
			} 
		});
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(`Request failed (${res.status}) ${res.statusText} ${text ? `- ${text}` : ''}`);
		}
		return (await res.json()) as T;
	} catch (err) {
		throw err instanceof Error ? err : new Error('Unknown network error');
	}
}

// ———————————————————————————————————————————————————————————
// Query helpers — each section gets its own key for caching & prefetch
// ———————————————————————————————————————————————————————————
const qk = {
	hero: (filters: FilterState) => ['discover', 'hero', filters],
	recommendations: (filters: FilterState) => ['discover', 'recs', filters],
	trending: () => ['discover', 'trending'],
	comingSoon: () => ['discover', 'comingSoon'],
	mood: (mood: string | null) => ['discover', 'mood', mood],
	discover: () => ['discover'],
	upcomingReleases: () => ['upcoming-releases'],
	userPreferences: () => ['user-preferences'],
};

// Fetch discover data (existing API endpoint)
async function fetchDiscoverData(): Promise<DiscoverData> {
	return fetchJSON<DiscoverData>('/api/discover');
}

async function getHero(filters: FilterState): Promise<Show> {
	const response = await fetchDiscoverData();
	return response.hero || {
		id: 'fallback',
		title: 'Discover Amazing Content',
		overview: 'Explore our curated collection of shows and movies.',
	};
}

async function getRecommendations(filters: FilterState): Promise<Show[]> {
	const response = await fetchDiscoverData();
	let filtered = response.forYou || [];
  
	// Apply mood filtering
	if (filters.mood) {
		const moodToGenres: Record<string, string[]> = {
			'Cerebral': ['documentary', 'drama', 'thriller', 'mystery', 'biography'],
			'Feel-good': ['comedy', 'romance', 'family', 'musical', 'animation'],
			'Edge-of-seat': ['action', 'thriller', 'horror', 'crime', 'war', 'adventure']
		};
    
		const targetGenres = moodToGenres[filters.mood] || [];
		filtered = filtered.filter(show => 
			show.genres?.some(genre => 
				targetGenres.some(target => 
					genre.toLowerCase().includes(target.toLowerCase())
				)
			)
		);
	}
  
	return filtered;
}

async function getTrending(): Promise<Show[]> {
	const response = await fetchDiscoverData();
	return response.trendingThisWeek || [];
}

async function getComingSoon(): Promise<Show[]> {
	try {
		return await fetchJSON<Show[]>('/api/discover/upcoming');
	} catch {
		return [];
	}
}

async function getMoodPicks(mood: string | null): Promise<Show[]> {
	if (!mood) return [];
	const response = await fetchDiscoverData();
  
	// Filter by mood-related genres
	const moodToGenres: Record<string, string[]> = {
		'Cerebral': ['documentary', 'drama', 'thriller', 'mystery', 'biography'],
		'Feel-good': ['comedy', 'romance', 'family', 'musical', 'animation'],
		'Edge-of-seat': ['action', 'thriller', 'horror', 'crime', 'war', 'adventure']
	};
  
	const targetGenres = moodToGenres[mood] || [];
	return (response.forYou || []).filter(show => 
		show.genres?.some(genre => 
			targetGenres.some(target => 
				genre.toLowerCase().includes(target.toLowerCase())
			)
		)
	);
}

// User preferences API
async function getUserPreferences() {
	return fetchJSON<any>('/api/user/preferences');
}

// Watchlist API using existing endpoints
async function addToWatchlist(showId: string | number, mediaType: string = 'movie') {
	return fetchJSON<{ success: true }>('/api/watchlist', {
		method: 'POST',
		body: JSON.stringify({ showId, type: mediaType }),
	});
}

// ———————————————————————————————————————————————————————————
// UI helpers
// ———————————————————————————————————————————————————————————
function SectionHeader({ title, subtitle, onSeeAll, viewAllHref }: { title: string; subtitle?: string; onSeeAll?: () => void; viewAllHref?: string }) {
	return (
		<div className="mb-6">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
				{viewAllHref ? (
					<a
						href={viewAllHref}
						className="inline-flex items-center text-sm text-gray-300 hover:text-white"
						aria-label={`View all for ${title}`}
					>
						View all <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
					</a>
				) : onSeeAll ? (
					<Button 
						size="sm" 
						variant="ghost" 
						onClick={onSeeAll} 
						aria-label={`See all for ${title}`}
						className="self-start sm:self-auto text-gray-400 hover:text-white"
					>
						See all <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
					</Button>
				) : null}
			</div>
			{subtitle ? (
				<p className="mt-1 text-xs sm:text-sm text-gray-300/80 max-w-3xl">{subtitle}</p>
			) : null}
		</div>
	);
}

function Grid({ children, ariaLabel, compact = false }: React.PropsWithChildren<{ ariaLabel: string; compact?: boolean }>) {
	return (
		<div
			role="grid"
			aria-label={ariaLabel}
			className={compact
				? "grid grid-cols-4 gap-1.5 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10"
				: "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8"}
		>
			{children}
		</div>
	);
}

// Enhanced Loading Skeleton Components
function ContentCardSkeleton() {
	return (
		<div className="group">
			<div className="relative overflow-hidden rounded-xl bg-gray-800/40 aspect-[2/3] mb-3">
				<Skeleton className="w-full h-full" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-3/4 bg-gray-700/50" />
				<div className="flex gap-1">
					<Skeleton className="h-3 w-8 bg-gray-700/30 rounded-full" />
					<Skeleton className="h-3 w-8 bg-gray-700/30 rounded-full" />
				</div>
			</div>
		</div>
	);
}

// Horizontal Carousel Component
function HorizontalCarousel({ 
	items, 
	title, 
	ariaLabel,
	onAddToWatchlist, 
	onWatchNow,
	cardWidth = 180,
}: { 
	items: Show[]; 
	title: string;
	ariaLabel?: string;
	onAddToWatchlist?: (show: Show) => void;
	onWatchNow?: (show: Show) => void;
	cardWidth?: number;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const idRef = useRef<string>(`hc-${Math.random().toString(36).slice(2)}`);

	const scrollLeft = useCallback(() => {
		if (containerRef.current) {
			containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
		}
	}, []);

	const scrollRight = useCallback(() => {
		if (containerRef.current) {
			containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
		}
	}, []);

	const onKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!containerRef.current) return;
		switch (e.key) {
			case 'ArrowLeft':
				e.preventDefault();
				scrollLeft();
				break;
			case 'ArrowRight':
				e.preventDefault();
				scrollRight();
				break;
			case 'Home':
				e.preventDefault();
				containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
				break;
			case 'End':
				e.preventDefault();
				containerRef.current.scrollTo({ left: containerRef.current.scrollWidth, behavior: 'smooth' });
				break;
		}
	}, [scrollLeft, scrollRight]);

	if (!items.length) return null;

	return (
		<section className="group relative" aria-labelledby={title ? `${title.replace(/\s+/g, '-').toLowerCase()}-heading` : undefined} role="region" aria-label={ariaLabel || title || 'Carousel'}>
			{title && (
				<div className="flex justify-between items-center mb-6">
					<h2 
						id={`${title.replace(/\s+/g, '-').toLowerCase()}-heading`}
						className="text-2xl font-bold text-white"
					>
						{title}
					</h2>
					<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
						<Button 
							variant="outline" 
							size="sm" 
							onClick={scrollLeft}
							className="bg-gray-800/60 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/80 hover:text-white"
							aria-label={`Scroll ${title} left`}
							aria-controls={idRef.current}
						>
							<ChevronLeft className="w-4 h-4" aria-hidden="true" />
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={scrollRight}
							className="bg-gray-800/60 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/80 hover:text-white"
							aria-label={`Scroll ${title} right`}
							aria-controls={idRef.current}
						>
							<ChevronRight className="w-4 h-4" aria-hidden="true" />
						</Button>
					</div>
				</div>
			)}
      
			{/* Always visible scroll arrows for sections without titles */}
			{!title && (
				<div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 flex justify-between pointer-events-none z-10">
					<Button 
						variant="outline" 
						size="sm" 
						onClick={scrollLeft}
						className="bg-gray-800/80 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/90 hover:text-white shadow-lg pointer-events-auto opacity-80 hover:opacity-100 transition-opacity"
						aria-label="Scroll left"
						aria-controls={idRef.current}
					>
						<ChevronLeft className="w-4 h-4" aria-hidden="true" />
					</Button>
					<Button 
						variant="outline" 
						size="sm" 
						onClick={scrollRight}
						className="bg-gray-800/80 backdrop-blur-sm border-gray-600 text-gray-300 hover:bg-gray-700/90 hover:text-white shadow-lg pointer-events-auto opacity-80 hover:opacity-100 transition-opacity"
						aria-label="Scroll right"
						aria-controls={idRef.current}
					>
						<ChevronRight className="w-4 h-4" aria-hidden="true" />
					</Button>
				</div>
			)}
      
			<div 
				ref={containerRef}
				id={idRef.current}
				className="flex space-x-6 overflow-x-auto pb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
				role="list"
				aria-label={`${ariaLabel || title || 'Carousel'} items`}
				tabIndex={0}
				onKeyDown={onKey}
				style={{
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
				}}
			>
				{items.map((item, index) => (
					<motion.div 
						key={item.id} 
						className="group/item"
						style={{ minWidth: cardWidth, maxWidth: cardWidth }}
						role="listitem"
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
					>
						<div className="transform transition-all duration-300 hover:scale-105 hover:z-10 relative">
							<UniversalShowCard 
								show={item}
								className="w-full shadow-xl hover:shadow-2xl"
								onAddToList={onAddToWatchlist}
								showQuickActions={true}
							/>
						</div>
					</motion.div>
				))}
			</div>
			{/* Edge gradient fades to hint scroll */}
			<div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/80 via-black/40 to-transparent opacity-70" />
			<div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/80 via-black/40 to-transparent opacity-70" />
		</section>
	);
}

// ———————————————————————————————————————————————————————————
// Main Page Component
// ———————————————————————————————————————————————————————————
export default function DiscoverStructured() {
	const { user } = useAuth();
	const { toast } = useToast();
	const { addToList } = useUserActions();
	const qc = useQueryClient();

	// Filter state controlled by EnhancedFilterSystem
	const [filters, setFilters] = useState<FilterState>({
		mood: null,
		genre: '',
		sort: 'popularity',
	});

	const [searchQuery, setSearchQuery] = useState('');
	const [visibleCount, setVisibleCount] = useState(12);
	const [openFilter, setOpenFilter] = useState<null | 'mood' | 'genre' | 'platform' | 'country'>(null);
	const [compact, setCompact] = useState<boolean>(() => {
		try {
			return localStorage.getItem('bb-compact') === '1';
		} catch {
			return false;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem('bb-compact', compact ? '1' : '0');
		} catch {}
	}, [compact]);

	// Modal state
	const [activeShow, setActiveShow] = useState<Show | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	// Extract search query from URL on mount
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const search = urlParams.get('search');
		if (search) {
			setSearchQuery(search);
		}
	}, []);

	const onFilterChange = useCallback((next: FilterState) => {
		setFilters(next);
		// Prefetch recommendations for responsiveness
		qc.prefetchQuery({ 
			queryKey: qk.recommendations(next), 
			queryFn: () => getRecommendations(next) 
		}).catch(() => {});
	}, [qc]);

	// Queries with error handling
	const {
		data: hero,
		isLoading: heroLoading,
	} = useQuery<Show>({
		queryKey: qk.hero(filters),
		queryFn: () => getHero(filters),
		staleTime: 60_000,
	});

	const { data: recs, isLoading: recsLoading } = useQuery<Show[]>({
		queryKey: qk.recommendations(filters),
		queryFn: () => getRecommendations(filters),
	});

	const { data: trending, isLoading: trendingLoading } = useQuery<Show[]>({
		queryKey: qk.trending(),
		queryFn: getTrending,
		staleTime: 60_000,
	});

	const { data: comingSoon, isLoading: comingSoonLoading } = useQuery<Show[]>({
		queryKey: qk.comingSoon(),
		queryFn: getComingSoon,
	});

	const { data: moodPicks, isLoading: moodLoading } = useQuery<Show[]>({
		queryKey: qk.mood(filters.mood),
		queryFn: () => getMoodPicks(filters.mood),
		enabled: Boolean(filters.mood),
	});

	useQuery({
		queryKey: qk.userPreferences(),
		queryFn: getUserPreferences,
		staleTime: 10 * 60 * 1000,
	});

	// Watchlist mutation with optimistic updates
	const addToWatchlistMutation = useMutation({
		mutationFn: ({ showId, mediaType }: { showId: string | number; mediaType: string }) => 
			addToWatchlist(showId, mediaType),
		onMutate: async ({ showId }) => {
			await qc.cancelQueries({ queryKey: ['watchlist'] });
			const previousWatchlist = qc.getQueryData(['watchlist']);
			qc.setQueryData(['watchlist'], (old: any) => 
				old ? [...old, { id: showId }] : [{ id: showId }]
			);
			return { previousWatchlist };
		},
		onError: (err, variables, context) => {
			qc.setQueryData(['watchlist'], context?.previousWatchlist);
			toast({
				title: "Error",
				description: "Failed to add to watchlist. Please try again.",
				variant: "destructive",
			});
		},
		onSuccess: () => {
			toast({
				title: "Added to Watchlist",
				description: "Successfully added to your watchlist.",
				duration: 3000,
			});
		}
	});

	const handleQuickAdd = useCallback(async (show: Show) => {
		try {
			if (!user) {
				toast({ 
					title: 'Sign in required', 
					description: 'Please sign in to add to your list.' 
				});
				return;
			}
			addToWatchlistMutation.mutate({ 
				showId: show.id, 
				mediaType: show.mediaType || 'movie' 
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Could not add to list';
			toast({ title: 'Error', description: message, variant: 'destructive' });
		}
	}, [toast, user, addToWatchlistMutation]);

	const filteredForYou = useMemo((): Show[] => {
		if (!recs) return [];
		let filtered: Show[] = recs;
		if (searchQuery) {
			filtered = filtered.filter(show =>
				show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				show.genres?.some(genre => 
					genre.toLowerCase().includes(searchQuery.toLowerCase())
				)
			);
		}
		if (filters.genre) {
			const target = filters.genre.toLowerCase();
			filtered = filtered.filter(show => show.genres?.some(g => g.toLowerCase() === target));
		}
		if (filters.platforms && filters.platforms.length) {
			const wanted = new Set(filters.platforms.map(p => p.toLowerCase()));
			filtered = filtered.filter(show => {
				const cardPlatform = show.platform?.toLowerCase();
				const spMatch = show.streamingPlatforms?.some(sp => sp.provider_name && wanted.has(sp.provider_name.toLowerCase()));
				return (cardPlatform && wanted.has(cardPlatform)) || spMatch || false;
			});
		}
		return filtered.slice(0, visibleCount);
	}, [recs, searchQuery, visibleCount, filters]);

	const allowedGenres = useMemo(() => {
		const set = new Set<string>();
		(recs || []).forEach(r => r.genres?.forEach(g => set.add(g)));
		return Array.from(set).slice(0, 10);
	}, [recs]);

	const allowedPlatforms = useMemo(() => {
		const set = new Set<string>();
		const addFrom = (arr?: Show[]) => arr?.forEach(r => {
			if (r.platform) set.add(r.platform);
			r.streamingPlatforms?.forEach(sp => sp.provider_name && set.add(sp.provider_name));
		});
		addFrom(recs);
		addFrom(trending);
		return Array.from(set).filter(Boolean).slice(0, 10);
	}, [recs, trending]);

	const COUNTRIES = useMemo(() => ['US','UK','CA','JP','KR','FR','DE','IN'], []);

	// Build hero slides from hero + trending + recs (dedup, ensure image)
	const heroSlides = useMemo((): Show[] => {
		const list: Show[] = [];
		if (hero) list.push(hero);
		if (trending && trending.length) list.push(...trending);
		if (recs && recs.length) list.push(...recs);
		const seen = new Set<string>();
		return list.filter((s) => {
			if (!s) return false;
			const id = String(s.id);
			if (seen.has(id)) return false;
			seen.add(id);
			const img = s.backdrop || s.posterUrl || s.poster;
			return Boolean(img);
		}).slice(0, 6);
	}, [hero, trending, recs]);

	const [heroIndex, setHeroIndex] = useState(0);
	const [heroPaused, setHeroPaused] = useState(false);

	useEffect(() => {
		if (heroPaused || heroSlides.length <= 1) return;
		const id = setInterval(() => {
			setHeroIndex((i) => (i + 1) % heroSlides.length);
		}, 6000);
		return () => clearInterval(id);
	}, [heroPaused, heroSlides.length]);

	const nextHero = useCallback(() => {
		setHeroIndex((i) => (i + 1) % Math.max(heroSlides.length, 1));
	}, [heroSlides.length]);

	const prevHero = useCallback(() => {
		setHeroIndex((i) => (i - 1 + Math.max(heroSlides.length, 1)) % Math.max(heroSlides.length, 1));
	}, [heroSlides.length]);

	const activeHero = heroSlides[heroIndex] || hero || null;

	// Hero image URL (we animate zoom-out with a foreground <img> instead of CSS background)
	const heroImageUrl = useMemo(() => (
		activeHero?.backdrop || activeHero?.posterUrl || activeHero?.poster || ''
	), [activeHero]);

	// Dynamic gradient colors derived from hero image (fallback to neutral darks)
	const [gradientColors, setGradientColors] = useState<string[]>([
		'#000000', '#1f2937', '#111827'
	]);

	useEffect(() => {
		if (!heroImageUrl) return;
		let canceled = false;
		const img = new Image();
		// Attempt to allow cross-origin color extraction when possible
		img.crossOrigin = 'anonymous';
		img.src = heroImageUrl;
		img.onload = () => {
			try {
				const thief = new ColorThief();
				// getPalette can throw if the image isn't CORS-enabled; guard with try/catch
				const dominant = thief.getColor(img) as [number, number, number];
				const palette = thief.getPalette(img, 5) as [number, number, number][];
				const secondary = (palette && palette[1]) ? palette[1] : dominant;
				if (!canceled) {
					setGradientColors([
						`rgb(${dominant[0]},${dominant[1]},${dominant[2]})`,
						`rgb(${secondary[0]},${secondary[1]},${secondary[2]})`,
						'#000000',
					]);
				}
			} catch (_err) {
				// Ignore extraction errors; fallback stays in place
			}
		};
		img.onerror = () => {
			// keep fallback
		};
		return () => { canceled = true; };
	}, [heroImageUrl]);

	const openModal = useCallback((show: Show) => {
		setActiveShow(show);
		setModalOpen(true);
	}, []);
  
	const closeModal = useCallback(() => {
		setModalOpen(false);
		setActiveShow(null);
	}, []);

	if (heroLoading && recsLoading && trendingLoading) {
		return (
			<AppLayout>
				<main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
					{/* Hero Skeleton (reduced height) */}
					<div className="relative h-[55vh] min-h-[400px]">
						<Skeleton className="absolute inset-0 w-full h-full" />
						<div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
					</div>
					{/* Content Skeletons */}
					<div className="px-4 md:px-8 lg:px-16 max-w-[1440px] mx-auto pt-8">
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
							{Array.from({ length: 18 }).map((_, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: i * 0.05 }}
								>
									<ContentCardSkeleton />
								</motion.div>
							))}
						</div>
					</div>
				</main>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			<main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" aria-label="Discover page">
				{/* Hero Section (compact, gradient overlay, rotating slides) */}
				<div
					className="relative h-[55vh] min-h-[400px] w-full overflow-hidden"
					onMouseEnter={() => setHeroPaused(true)}
					onMouseLeave={() => setHeroPaused(false)}
					role="region"
					aria-label="Featured titles"
				>
					{/* Dynamic gradient + Animated background image (zoom-out per slide) */}
					{heroImageUrl ? (
						<div className="absolute inset-0 z-0 overflow-hidden" aria-hidden>
							{/* Dynamic gradient background that adapts to the image */}
							<div
								className="absolute inset-0"
								style={{
									background: `linear-gradient(to top, ${gradientColors[2]}, ${gradientColors[1]}, ${gradientColors[0]})`
								}}
							/>
							{/* Blurred background fill for seamless look */}
							<img
								src={heroImageUrl}
								alt=""
								className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-60"
								style={{ zIndex: 1, objectPosition: 'center center', pointerEvents: 'none' }}
							/>
							{/* Main hero image, always fully visible */}
							<motion.img
								src={heroImageUrl}
								alt=""
								className="relative w-full h-full object-contain select-none mx-auto"
								style={{ objectPosition: 'center center', zIndex: 2 }}
								initial={{ scale: heroPaused ? 1 : 1.22, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								transition={{ duration: heroPaused ? 0 : 6, ease: 'easeOut' }}
								key={`${heroIndex}-${heroPaused ? 'paused' : 'run'}`}
							/>
						</div>
					) : null}

					{/* Readability overlay to ensure text/CTAs pop over any gradient */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none z-10" />
					{/* Nav Controls */}
					{heroSlides.length > 1 && (
						<>
							<button
								className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/60"
								onClick={prevHero}
								aria-label="Previous featured"
							>
								<ChevronLeft className="h-5 w-5" />
							</button>
							<button
								className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/60"
								onClick={nextHero}
								aria-label="Next featured"
							>
								<ChevronRight className="h-5 w-5" />
							</button>
							<div className="absolute bottom-4 right-6 z-30 flex gap-2" aria-label="Featured pagination">
								{heroSlides.map((_, i) => (
									<button
										key={`dot-${i}`}
										className={`h-2 w-2 rounded-full ${i === heroIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
										onClick={() => setHeroIndex(i)}
										aria-label={`Go to slide ${i + 1}`}
										aria-current={i === heroIndex}
									/>
								))}
							</div>
						</>
					)}

					<div className="relative z-20 h-full flex items-end pb-10">
						<div className="container mx-auto px-6 lg:px-16">
							<div className="max-w-2xl space-y-4">
								<h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
									{activeHero?.title || 'Discover'}
								</h1>
								<div className="flex gap-4">
									<button
										className="bg-white text-black font-semibold px-6 py-2 rounded-xl shadow hover:bg-gray-200"
										onClick={() => activeHero && openModal(activeHero)}
									>
										Watch Now
									</button>
									<button
										className="border border-white text-white px-6 py-2 rounded-xl hover:bg-white/10"
										onClick={() => activeHero && handleQuickAdd(activeHero)}
									>
										Add to List
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="mx-auto max-w-7xl px-4 py-12 space-y-20">
					{/* Compact Filter Toolbar — horizontally scrollable, expandable pills */}
					<section aria-label="Filter toolbar" className="rounded-xl">
						<div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
							<button
								className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${openFilter === 'mood' ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
								onClick={() => setOpenFilter(f => f === 'mood' ? null : 'mood')}
								aria-pressed={openFilter === 'mood'}
							>
								<Sparkles className="w-3.5 h-3.5" /> Mood <ChevronDown className="w-3.5 h-3.5 opacity-70" />
							</button>
							<button
								className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${openFilter === 'genre' ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
								onClick={() => setOpenFilter(f => f === 'genre' ? null : 'genre')}
								aria-pressed={openFilter === 'genre'}
							>
								<Film className="w-3.5 h-3.5" /> Genre <ChevronDown className="w-3.5 h-3.5 opacity-70" />
							</button>
							<button
								className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${openFilter === 'platform' ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
								onClick={() => setOpenFilter(f => f === 'platform' ? null : 'platform')}
								aria-pressed={openFilter === 'platform'}
							>
								<Tv className="w-3.5 h-3.5" /> Platform <ChevronDown className="w-3.5 h-3.5 opacity-70" />
							</button>
							<button
								className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border ${openFilter === 'country' ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
								onClick={() => setOpenFilter(f => f === 'country' ? null : 'country')}
								aria-pressed={openFilter === 'country'}
							>
								<Globe className="w-3.5 h-3.5" /> Country <ChevronDown className="w-3.5 h-3.5 opacity-70" />
							</button>
							<div className="ml-auto flex items-center gap-3">
								<div className="text-xs text-gray-300/90 whitespace-nowrap">Showing <span className="text-white font-medium">{filteredForYou.length}</span> picks</div>
								<button
									className={`px-2.5 py-1.5 rounded-full border text-xs ${compact ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
									onClick={() => setCompact(c => !c)}
									aria-pressed={compact}
									aria-label={`Toggle compact mode ${compact ? 'on' : 'off'}`}
								>Compact</button>
							</div>
						</div>

						{/* Expanded rows */}
						{openFilter === 'mood' && (
							<div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="region" aria-label="Mood options">
								{['Cerebral','Feel-good','Edge-of-seat'].map(m => {
									const active = filters.mood === m;
									return (
										<button
											key={m}
											className={`px-2.5 py-1.5 rounded-full border text-xs ${active ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
											onClick={() => onFilterChange({ ...filters, mood: active ? null : m })}
											aria-pressed={active}
											aria-label={`Mood ${m}${active ? ' selected' : ''}`}
										>{m}</button>
									);
								})}
							</div>
						)}
						{openFilter === 'genre' && (
							<div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="region" aria-label="Genre options">
								{(filters.mood ? (filters.mood === 'Cerebral' ? ['Documentary','Drama','Thriller','Mystery'] : filters.mood === 'Feel-good' ? ['Comedy','Romance','Family','Animation'] : ['Action','Thriller','Horror','Crime','Adventure']) : allowedGenres).slice(0,16).map(g => {
									const pressed = filters.genre?.toLowerCase() === g.toLowerCase();
									return (
										<button
											key={g}
											className={`px-2.5 py-1.5 rounded-full border text-xs ${pressed ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
											onClick={() => onFilterChange({ ...filters, genre: pressed ? '' : g })}
											aria-pressed={pressed}
											aria-label={`Genre ${g}${pressed ? ' selected' : ''}`}
										>{g}</button>
									);
								})}
							</div>
						)}
						{openFilter === 'platform' && (
							<div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="region" aria-label="Platform options">
								{allowedPlatforms.slice(0,16).map(p => {
									const pressed = Boolean(filters.platforms?.includes(p));
									return (
										<button
											key={p}
											className={`px-2.5 py-1.5 rounded-full border text-xs ${pressed ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
											onClick={() => {
												const has = filters.platforms?.includes(p);
												const next = has ? (filters.platforms || []).filter(x => x !== p) : [ ...(filters.platforms || []), p ];
												onFilterChange({ ...filters, platforms: next });
											}}
											aria-pressed={pressed}
											aria-label={`Platform ${p}${pressed ? ' selected' : ''}`}
										>{p}</button>
									);
								})}
							</div>
						)}
						{openFilter === 'country' && (
							<div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="region" aria-label="Country options">
								{COUNTRIES.map(c => {
									const pressed = filters.country === c;
									return (
										<button
											key={c}
											className={`px-2.5 py-1.5 rounded-full border text-xs ${pressed ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
											onClick={() => onFilterChange({ ...filters, country: pressed ? '' : c })}
											aria-pressed={pressed}
											aria-label={`Country ${c}${pressed ? ' selected' : ''}`}
										>{c}</button>
									);
								})}
							</div>
						)}
					</section>
          
					{/* Recommendations - single row horizontal carousel */}
					<section id="recommendations-section" aria-label="Recommendations">
						<SectionHeader title="Recommended for you" viewAllHref="/discover/recommended" subtitle={filters.mood || filters.genre || (filters.platforms && filters.platforms.length) ? `Because you chose ${[
							filters.mood ? `“${filters.mood}”` : null,
							filters.genre ? `“${filters.genre}”` : null,
							filters.platforms?.length ? `“${filters.platforms.join(', ')}”` : null,
						].filter(Boolean).join(' and ')}.` : 'Personalized picks based on your taste.'} />
						{recsLoading ? (
							<Grid ariaLabel="Loading recommendations" compact={compact}>
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={`rec-skel-${i}`} className="space-y-3">
										<ContentCardSkeleton />
									</div>
								))}
							</Grid>
						) : (
							<HorizontalCarousel
								items={(filteredForYou && filteredForYou.length ? filteredForYou : (recs || [])).slice(0, 6)}
								title=""
								ariaLabel="Recommended for you"
								onAddToWatchlist={handleQuickAdd}
								onWatchNow={(show) => openModal(show)}
								cardWidth={compact ? 160 : 180}
							/>
						)}
					</section>

					<div className="border-t border-white/10" />
					{/* Trending Now (grid) */}
					<motion.section aria-label="Trending" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
						<SectionHeader
							title="Trending Now"
							subtitle="What everyone’s watching this week."
							viewAllHref="/discover/trending"
						/>
						{trendingLoading ? (
							<Grid ariaLabel="Loading trending" compact={compact}>
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={`trend-skel-${i}`} className="space-y-3">
										<ContentCardSkeleton />
									</div>
								))}
							</Grid>
						) : (
							<div className={`grid gap-3 ${compact ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'}`} role="grid" aria-label="Trending grid">
								{(trending || []).slice(0, 6).map((show, i) => (
									<motion.div key={show.id} role="gridcell" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.4, delay: i * 0.03 }}>
										<UniversalShowCard
											show={show}
											className="w-full"
											onClick={() => openModal(show)}
											onAddToList={() => handleQuickAdd(show)}
											showQuickActions={true}
										/>
									</motion.div>
								))}
							</div>
						)}
					</motion.section>

					<div className="border-t border-white/10" />
					{/* Coming Soon — timeline style */}
					<motion.section aria-label="Coming soon" id="coming-soon-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}>
						<SectionHeader title="New Seasons & Releases" subtitle="Upcoming and newly released titles you'll care about" viewAllHref="/discover/coming-soon" />
						{comingSoonLoading ? (
							<Grid ariaLabel="Loading coming soon" compact={compact}>
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={`soon-skel-${i}`} className="space-y-3">
										<ContentCardSkeleton />
									</div>
								))}
							</Grid>
						) : (
							<div className="relative pl-4">
								<div aria-hidden className="absolute left-1 top-0 bottom-0 w-px bg-white/10" />
								{(comingSoon ?? []).slice().sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? '')).slice(0, 6).map((show) => (
									<div key={show.id} className="relative mb-5">
										<div aria-hidden className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-teal-400 shadow-[0_0_0_3px_rgba(20,184,166,0.25)]" />
										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-3">
											<div className="flex items-center gap-2 text-xs text-gray-200">
												<Calendar className="w-4 h-4" /> {show.releaseDate || 'TBA'}
											</div>
											<div className="flex-1 w-full">
												<div className="flex flex-col sm:flex-row gap-3">
													<div className="w-full sm:w-56 h-28 overflow-hidden rounded-lg bg-gray-800/40 flex-shrink-0">
														<img src={show.backdrop || show.poster || ''} alt={show.title} className="w-full h-full object-cover" />
													</div>
													<div className="flex-1">
														<h3 className="text-base font-semibold text-white">{show.title}</h3>
														{show.overview && <p className="text-sm text-gray-300/90 line-clamp-2">{show.overview}</p>}
													</div>
												</div>
											</div>
											<div className="flex gap-2 self-stretch sm:self-auto">
												<Button size="sm" onClick={() => openModal(show)} className="bg-white text-black hover:bg-gray-100"><Play className="h-4 w-4 mr-1" /> Watch</Button>
												<Button size="sm" variant="outline" onClick={() => handleQuickAdd(show)} className="bg-black/30 border-white/30 text-white hover:bg-black/40"><Plus className="h-4 w-4" /></Button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</motion.section>

					{/* Mood Picks */}
					{filters.mood && (
						<section aria-label="Mood picks">
							<SectionHeader title={`Perfect for ${filters.mood} moments`} subtitle={`Unwind with these ${filters.mood?.toLowerCase()} picks handpicked for you.`} viewAllHref="/discover/mood" />
							{moodLoading ? (
								<Grid ariaLabel="Loading mood picks" compact={compact}>
									{Array.from({ length: 6 }).map((_, i) => (
										<div key={`mood-skel-${i}`} className="space-y-3">
											<ContentCardSkeleton />
										</div>
									))}
								</Grid>
							) : (
								<Grid ariaLabel="Mood picks grid" compact={compact}>
									{(moodPicks ?? []).slice(0, 6).map((show) => (
										<motion.div
											key={show.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											className="group"
										>
											<UniversalShowCard
												show={show}
												className="w-full transition-transform hover:scale-105"
												onClick={() => openModal(show)}
												onAddToList={() => handleQuickAdd(show)}
												showQuickActions={true}
											/>
										</motion.div>
									))}
								</Grid>
							)}
						</section>
					)}

					{/* Staff Picks */}
					<div className="border-t border-white/10" />
					<motion.section aria-label="Staff Picks" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
						<SectionHeader title="Staff picks" subtitle="Handpicked by our team — quality over quantity." viewAllHref="/discover/staff-picks" />
						<HorizontalCarousel
							items={(recs || []).slice(0, 6)}
							title=""
							ariaLabel="Staff picks"
							onAddToWatchlist={handleQuickAdd}
							onWatchNow={openModal}
							cardWidth={compact ? 160 : 180}
						/>
					</motion.section>

					{/* Hidden Gems */}
					<motion.section aria-label="Hidden Gems" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
						<SectionHeader title="Hidden gems" subtitle="Critically loved titles you might have missed." viewAllHref="/discover/hidden-gems" />
						<HorizontalCarousel
							items={(recs || []).filter(s => (s.rating ?? 0) >= 7).slice(0, 6)}
							title=""
							ariaLabel="Hidden gems"
							onAddToWatchlist={handleQuickAdd}
							onWatchNow={openModal}
							cardWidth={compact ? 130 : 140}
						/>
					</motion.section>
				</div>

				{/* Modal for detailed show actions */}
				{activeShow && (
					<BrandedShowModal
						showId={String(activeShow.id)}
						showType={activeShow.mediaType || 'movie'}
						open={modalOpen}
						onClose={closeModal}
						reason={[
							filters.mood ? `You're in a ${filters.mood} mood` : null,
							filters.genre ? `You like ${filters.genre}` : null,
							filters.platforms?.length ? `Available on ${filters.platforms.join(', ')}` : null,
						].filter(Boolean).join(' • ') || undefined}
						onAddToWatchlist={async (showId) => {
							try {
								await addToWatchlist(showId, activeShow.mediaType || 'movie');
								toast({ title: 'Added', description: `"${activeShow.title}" was added to your list.` });
								await qc.invalidateQueries({ queryKey: ['watchlist'] });
							} catch (err) {
								const message = err instanceof Error ? err.message : 'Could not add to list';
								toast({ title: 'Error', description: message, variant: 'destructive' });
							}
						}}
						onWatchNow={(show) => {
							console.log('Watch now:', show.title);
						}}
					/>
				)}
			</main>
		</AppLayout>
	);
}

