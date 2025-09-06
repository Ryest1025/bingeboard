// client/src/pages/DiscoverStructured.tsx - Universal Design System Implementation
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
import HeroSpot from '@/components/hero/HeroSpot';
import { universal } from '@/styles/universal';
import { forceSparse, isDebugEnabled, isExpandedDebug } from '@/utils/debugSparse';
import { useHybridRecommendations, getHybridRecommendations } from '@/hooks/useHybridRecommendations';
import DebugRecBadge from '@/components/DebugRecBadge';

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
	// Optional logo URL if upstream provides a branded logo
	logoUrl?: string;
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

// Normalize API payloads and map TMDB items to our Show shape
function unwrapResults<T = any>(payload: any): T[] {
	if (Array.isArray(payload)) return payload as T[];
	if (payload && Array.isArray(payload.results)) return payload.results as T[];
	return [];
}

function toImg(urlPart?: string | null, size: 'w500' | 'original' = 'w500'): string | undefined {
	if (!urlPart) return undefined;
	if (urlPart.startsWith('http')) return urlPart;
	return `https://image.tmdb.org/t/p/${size}${urlPart}`;
}

function mapTmdbToShow(item: any): Show {
	const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
	return {
		id: item.id,
		title: item.title || item.name || '',
		year: item.release_date ? Number((item.release_date as string).slice(0, 4)) : (item.first_air_date ? Number((item.first_air_date as string).slice(0, 4)) : undefined),
		posterUrl: toImg(item.poster_path, 'w500'),
		poster: toImg(item.poster_path, 'w500'),
		backdrop: toImg(item.backdrop_path, 'original'),
		overview: item.overview,
		genres: item.genre_names || item.genres || undefined, // may not be present; UI tolerates undefined
		releaseDate: item.release_date || item.first_air_date,
		rating: typeof item.vote_average === 'number' ? item.vote_average : undefined,
		runtime: item.runtime,
		platform: item.platform || undefined,
		mediaType,
		streamingPlatforms: item.streamingPlatforms || item.streamingProviders || item.streaming_platforms || item.watchProviders || undefined,
		logoUrl: item.logoUrl || undefined,
	};
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

// Fetch discover data with enhanced multi-API integration
async function fetchDiscoverData(): Promise<DiscoverData> {
	return fetchJSON<DiscoverData>('/api/discover');
}

// ———————————————————————————————————————————————————————————
// Mapping helpers – normalize various upstream response shapes
// ———————————————————————————————————————————————————————————
function mapTmdbItem(raw: any): Show | null {
	if (!raw || (!raw.id && raw.id !== 0)) return null;
	const title = raw.title || raw.name || raw.original_title || raw.original_name;
	if (!title) return null;
	const poster = raw.poster || raw.posterUrl || (raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : undefined);
	const backdrop = raw.backdrop || (raw.backdrop_path ? `https://image.tmdb.org/t/p/original${raw.backdrop_path}` : poster);
	const genres: string[] | undefined = Array.isArray(raw.genres)
		? raw.genres.map((g: any) => typeof g === 'string' ? g : g.name).filter(Boolean)
		: (Array.isArray(raw.genre_ids) ? raw.genre_ids.map((g: any) => String(g)) : undefined);
	return {
		id: raw.id,
		title,
		posterUrl: poster,
		poster,
		backdrop,
		overview: raw.overview,
		genres,
		releaseDate: raw.release_date || raw.first_air_date,
		rating: typeof raw.vote_average === 'number' ? Number(raw.vote_average.toFixed(1)) : raw.rating,
		mediaType: raw.media_type || (raw.first_air_date ? 'tv' : 'movie'),
		platform: raw.platform,
		streamingPlatforms: raw.streamingPlatforms || raw.streaming_platforms || raw.providers || [],
		logoUrl: raw.logoUrl || (raw.logo_path ? `https://image.tmdb.org/t/p/w300${raw.logo_path}` : undefined)
	};
}

function mapTmdbResponse(payload: any): Show[] {
	if (!payload) return [];
	const arr = Array.isArray(payload) ? payload : Array.isArray(payload.results) ? payload.results : [];
	return arr.map(mapTmdbItem).filter(Boolean) as Show[];
}
async function getHero(filters: FilterState): Promise<Show> {
	// Use enhanced trending endpoint for hero content with streaming data
	try {
		const response = await fetchJSON<any>('/api/content/trending-enhanced?mediaType=all&includeStreaming=true&limit=6');
		const mapped = mapTmdbResponse(response);
		if (mapped.length > 0) return mapped[0];
	} catch (error) {
		console.warn('Enhanced hero fetch failed, falling back to basic discover');
	}

	const response = await fetchDiscoverData();
	return response.hero || {
		id: 'fallback',
		title: 'Discover Amazing Content',
		overview: 'Explore our curated collection of shows and movies.',
	};
}

async function getRecommendations(filters: FilterState): Promise<Show[]> {
	// Use enhanced API endpoints for recommendations with streaming data
	try {
		const debug = typeof window !== 'undefined' && isDebugEnabled();
		const t0 = performance.now();
		const params: string[] = ['includeStreaming=true'];
		// Map mood to a genre boost (genre IDs prioritized)
		const moodGenreMap: Record<string, string[]> = {
			'Cerebral': ['99','18','53','9648','36'],
			'Feel-good': ['35','10749','10751','10402','16'],
			'Edge-of-seat': ['28','53','27','80','10752','12']
		};
		const moodGenres = filters.mood ? moodGenreMap[filters.mood] || [] : [];
		if (filters.genre) params.push(`with_genres=${encodeURIComponent(filters.genre)}`);
		else if (moodGenres.length) params.push(`with_genres=${moodGenres.join(',')}`);
		if (filters.platforms?.length) params.push(`with_watch_providers=${filters.platforms.join('|')}`);
		if (filters.country) params.push(`region=${filters.country}`);
		if (filters.year) params.push(`primary_release_year=${filters.year}`);
		if (filters.sort) params.push(`sort_by=${encodeURIComponent(filters.sort)}.desc`);

		const base = '/api/tmdb/discover/movie';
		const url = `${base}?${params.join('&')}`;
		const raw = await fetchJSON<any>(url);
		let mapped = mapTmdbResponse(raw);
		mapped = forceSparse(mapped, 'primary'); // allow forcing sparse primary results
		const primaryTime = performance.now() - t0;
		if (debug) console.debug('[recs] primary source url=', url, 'count=', mapped.length, 'time', primaryTime.toFixed(1));
		if (mapped.length >= 6) return Object.assign(mapped.slice(0, 20), { __meta: { source: 'primary', primaryTime, primaryUrl: url, primarySample: mapped.slice(0,5) } });

		// If movie discover sparse, try mixed media (tv) supplement
		const tvStart = performance.now();
		const tvUrl = url.replace('/movie', '/tv');
		const tvRaw = await fetchJSON<any>(tvUrl);
		let tvMapped = mapTmdbResponse(tvRaw);
		tvMapped = forceSparse(tvMapped, 'tv');
		const tvTime = performance.now() - tvStart;
		const combined = [...mapped, ...tvMapped].filter((v, i, a) => a.findIndex(x => x.id === v.id) === i);
		if (debug) console.debug('[recs] combined movie+tv count=', combined.length, 'primaryTime', (performance.now()-t0).toFixed(1));
		if (combined.length >= 6) return Object.assign(combined.slice(0, 20), { __meta: { source: 'movie+tv', primaryTime, tvTime, primaryUrl: url, tvUrl, primarySample: mapped.slice(0,3), tvSample: tvMapped.slice(0,3) } });

		// Enhanced general recommendations with trending
		const trendingStart = performance.now();
		const trendingUrl = '/api/content/trending-enhanced?mediaType=all&includeStreaming=true&limit=40';
		const trendingRaw = await fetchJSON<any>(trendingUrl);
		let trendingMapped = mapTmdbResponse(trendingRaw);
		trendingMapped = forceSparse(trendingMapped, 'trending');
		const trendingTime = performance.now() - trendingStart;
		if (debug) console.debug('[recs] fallback trending count=', trendingMapped.length, 'time', trendingTime.toFixed(1));
		return Object.assign(trendingMapped.slice(0, 20), { __meta: { source: 'trending-fallback', primaryTime, trendingTime, trendingUrl, primaryUrl: url, primarySample: mapped.slice(0,3), trendingSample: trendingMapped.slice(0,5) } });
	} catch (error) {
		console.warn('Enhanced recommendations fetch failed, falling back to basic discover');
	}

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
	// Use enhanced trending endpoint with comprehensive streaming data
	try {
		const raw = await fetchJSON<any>('/api/content/trending-enhanced?mediaType=all&includeStreaming=true&limit=30');
		const mapped = mapTmdbResponse(raw);
		return mapped.slice(0, 24);
	} catch (error) {
		console.warn('Enhanced trending fetch failed, falling back to basic discover');
		const response = await fetchDiscoverData();
		return response.trendingThisWeek || [];
	}
}

async function getComingSoon(): Promise<Show[]> {
	// Use enhanced upcoming releases endpoint with streaming data
	try {
		const today = new Date().toISOString().split('T')[0];
		const raw = await fetchJSON<any>(`/api/tmdb/discover/movie?includeStreaming=true&primary_release_date.gte=${today}&sort_by=primary_release_date.asc`);
		return mapTmdbResponse(raw).slice(0, 30);
	} catch (error) {
		console.warn('Enhanced coming soon fetch failed, falling back to basic endpoint');
		try {
			const fallback = await fetchJSON<any>('/api/discover/upcoming');
			return Array.isArray(fallback) ? fallback as Show[] : (fallback.upcoming || []);
		} catch {
			return [];
		}
	}
}

async function getMoodPicks(mood: string | null): Promise<Show[]> {
	if (!mood) return [];

	// Use enhanced discovery with mood-based genre filtering and streaming data
	try {
		const moodToGenres: Record<string, string[]> = {
			'Cerebral': ['99', '18', '53', '9648', '36'],
			'Feel-good': ['35', '10749', '10751', '10402', '16'],
			'Edge-of-seat': ['28', '53', '27', '80', '10752', '12']
		};
		const genreIds = moodToGenres[mood] || [];
		if (genreIds.length) {
			const raw = await fetchJSON<any>(`/api/tmdb/discover/movie?includeStreaming=true&with_genres=${genreIds.join(',')}&sort_by=vote_average.desc&vote_count.gte=200`);
			return mapTmdbResponse(raw).slice(0, 24);
		}
	} catch (error) {
		console.warn('Enhanced mood picks fetch failed, falling back to basic filtering');
	}

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

// User preferences API with enhanced data
async function getUserPreferences() {
	return fetchJSON<any>('/api/user/preferences');
}

// Enhanced Watchlist API with streaming data integration
async function addToWatchlist(showId: string | number, mediaType: string = 'movie') {
	// Add with enhanced streaming data tracking
	return fetchJSON<{ success: true }>('/api/watchlist-enhanced', {
		method: 'POST',
		body: JSON.stringify({
			showId,
			type: mediaType,
			includeStreaming: true,
			trackAffiliate: true
		}),
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

// Enhanced Loading Skeleton Components
function ContentCardSkeleton() {
	return (
		<div className="group">
			<div className="relative overflow-hidden rounded-xl bg-gray-800/40 aspect-[2/3] mb-3">
				<Skeleton className="w-full h-full" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
			</div>
			<div className={universal.spacing.itemY}>
				<Skeleton className="h-4 w-3/4 bg-gray-700/50" />
				<div className={universal.spacing.itemX}>
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
								onClick={() => onWatchNow?.(item)}
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
		} catch { }
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
		// Hybrid hook uses its own query key; warm it by manual fetch
		qc.prefetchQuery({
			queryKey: ['hybrid-recommendations', {
				mood: next.mood,
				genre: next.genre,
				platforms: next.platforms,
				country: next.country,
				year: next.year ? String(next.year) : undefined,
				sort: next.sort
			}],
			queryFn: () => getHybridRecommendations({
				mood: next.mood,
				genre: next.genre,
				platforms: next.platforms,
				country: next.country,
				year: next.year ? String(next.year) : undefined,
				sort: next.sort
			})
		}).catch(() => { });
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

	// Replace legacy recommendations with hybrid hook (normalized multi-stage flow)
	const { data: hybridRecs, isLoading: recsLoading, meta: hybridMeta } = useHybridRecommendations({
		mood: filters.mood || undefined,
		genre: filters.genre,
		platforms: filters.platforms,
		country: filters.country,
		year: filters.year ? String(filters.year) : undefined,
		sort: filters.sort
	});
	const recs = hybridRecs as unknown as Show[] | undefined; // adapt mapping; ShowCard tolerant to fields subset

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

	const COUNTRIES = useMemo(() => ['US', 'UK', 'CA', 'JP', 'KR', 'FR', 'DE', 'IN'], []);

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
	const openModal = useCallback((show: Show) => {
		setActiveShow(show);
		setModalOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setModalOpen(false);
		setActiveShow(null);
	}, []);

	const debugMeta = (recs as any)?.__meta;
	const renderedCount = (filteredForYou && filteredForYou.length ? filteredForYou : (recs || [])).slice(0, 6).length;
	return (
		<AppLayout>
			<main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
				{/* Hero Section using reusable HeroSpot component */}
				<HeroSpot
					shows={heroSlides}
					height="h-[55vh] min-h-[400px]"
					onWatchNow={(s) => openModal(s)}
					onMoreInfo={(s) => openModal(s)}
				/>

				{/* Main Content Container - Universal Design System */}
				<div className={universal.containers.main}>
					{/* Compact Filter Toolbar — horizontally scrollable, expandable pills */}
					<section aria-label="Filter toolbar" className={universal.cards.glass}>
						<div className={universal.cn('flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1', universal.utilities.scrollbarHide)}>
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
								{['Cerebral', 'Feel-good', 'Edge-of-seat'].map(m => {
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
								{(filters.mood ? (filters.mood === 'Cerebral' ? ['Documentary', 'Drama', 'Thriller', 'Mystery'] : filters.mood === 'Feel-good' ? ['Comedy', 'Romance', 'Family', 'Animation'] : ['Action', 'Thriller', 'Horror', 'Crime', 'Adventure']) : allowedGenres).slice(0, 16).map(g => {
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
								{allowedPlatforms.slice(0, 16).map(p => {
									const pressed = Boolean(filters.platforms?.includes(p));
									return (
										<button
											key={p}
											className={`px-2.5 py-1.5 rounded-full border text-xs ${pressed ? 'bg-teal-500 text-white border-teal-400' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
											onClick={() => {
												const has = filters.platforms?.includes(p);
												const next = has ? (filters.platforms || []).filter(x => x !== p) : [...(filters.platforms || []), p];
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

					{/* Recommendations - Universal Section Pattern */}
					<section id="recommendations-section" aria-label="Recommendations" className={universal.containers.section}>
						<SectionHeader title="Recommended for you" viewAllHref="/discover/recommended" subtitle={filters.mood || filters.genre || (filters.platforms && filters.platforms.length) ? `Because you chose ${[
							filters.mood ? `“${filters.mood}”` : null,
							filters.genre ? `“${filters.genre}”` : null,
							filters.platforms?.length ? `“${filters.platforms.join(', ')}”` : null,
						].filter(Boolean).join(' and ')}.` : 'Personalized picks based on your taste.'} />
						{recsLoading ? (
							<div className={universal.grids.poster} aria-label="Loading recommendations">
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={`rec-skel-${i}`} className={universal.spacing.elementY}>
										<ContentCardSkeleton />
									</div>
								))}
							</div>
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

					{/* Trending Now (grid) */}
					{/* Trending Now - Universal Grid Pattern */}
					<motion.section
						aria-label="Trending"
						className={universal.containers.section}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<SectionHeader
							title="Trending Now"
							subtitle="What everyone's watching this week."
							viewAllHref="/discover/trending"
						/>
						{trendingLoading ? (
							<div className={universal.grids.poster} aria-label="Loading trending">
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={`trend-skel-${i}`} className={universal.spacing.elementY}>
										<ContentCardSkeleton />
									</div>
								))}
							</div>
						) : (
							<div className={compact ? universal.grids.four : universal.grids.three} role="grid" aria-label="Trending grid">
								{((trending as Show[] | undefined) || []).slice(0, 6).map((show: Show, i: number) => (
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
					</motion.section>					{/* Coming Soon — Universal Timeline Pattern */}
					<motion.section
						aria-label="Coming soon"
						id="coming-soon-section"
						className={universal.containers.section}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						<SectionHeader title="New Seasons & Releases" subtitle="Upcoming and newly released titles you'll care about" viewAllHref="/discover/coming-soon" />
						{comingSoonLoading ? (
							<div className={universal.grids.poster} aria-label="Loading coming soon">
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={`soon-skel-${i}`} className={universal.spacing.elementY}>
										<ContentCardSkeleton />
									</div>
								))}
							</div>
						) : (
							<div className="relative pl-4">
								<div aria-hidden className="absolute left-1 top-0 bottom-0 w-px bg-white/10" />
								{(comingSoon ?? []).slice().sort((a, b) => (a.releaseDate ?? '').localeCompare(b.releaseDate ?? '')).slice(0, 6).map((show) => (
									<div key={show.id} className={universal.cn('relative', universal.spacing.contentY)}>
										<div aria-hidden className="absolute -left-[7px] top-2 h-3 w-3 rounded-full bg-teal-400 shadow-[0_0_0_3px_rgba(20,184,166,0.25)]" />
										<div className={universal.cn(universal.cards.glass, 'flex flex-col sm:flex-row items-start sm:items-center', universal.spacing.elementX)}>
											<div className={universal.cn('flex items-center', universal.spacing.itemX, 'text-xs text-gray-200')}>
												<Calendar className="w-4 h-4" /> {show.releaseDate || 'TBA'}
											</div>
											<div className="flex-1 w-full">
												<div className={universal.cn('flex flex-col sm:flex-row', universal.spacing.elementX)}>
													<div className="w-full sm:w-56 h-28 overflow-hidden rounded-lg bg-gray-800/40 flex-shrink-0">
														<img src={show.backdrop || show.poster || ''} alt={show.title} className="w-full h-full object-cover" />
													</div>
													<div className="flex-1">
														<h3 className="text-base font-semibold text-white">{show.title}</h3>
														{show.overview && <p className="text-sm text-gray-300/90 line-clamp-2">{show.overview}</p>}
													</div>
												</div>
											</div>
											<div className={universal.cn('flex', universal.spacing.itemX, 'self-stretch sm:self-auto')}>
												<Button size="sm" onClick={() => openModal(show)} className={universal.buttons.primary}><Play className="h-4 w-4 mr-1" /> Watch</Button>
												<Button size="sm" variant="outline" onClick={() => handleQuickAdd(show)} className={universal.buttons.secondary}><Plus className="h-4 w-4" /></Button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</motion.section>

					{/* Mood Picks - Universal Section Pattern */}
					{filters.mood && (
						<section aria-label="Mood picks" className={universal.containers.section}>
							<SectionHeader title={`Perfect for ${filters.mood} moments`} subtitle={`Unwind with these ${filters.mood?.toLowerCase()} picks handpicked for you.`} viewAllHref="/discover/mood" />
							{moodLoading ? (
								<div className={universal.grids.poster} aria-label="Loading mood picks">
									{Array.from({ length: 6 }).map((_, i) => (
										<div key={`mood-skel-${i}`} className={universal.spacing.elementY}>
											<ContentCardSkeleton />
										</div>
									))}
								</div>
							) : (
								<div className={universal.grids.poster} aria-label="Mood picks grid">
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
								</div>
							)}
						</section>
					)}

					{/* Staff Picks - Universal Section Pattern */}
					<motion.section
						aria-label="Staff Picks"
						className={universal.containers.section}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
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

					{/* Hidden Gems - Universal Section Pattern */}
					<motion.section
						aria-label="Hidden Gems"
						className={universal.containers.section}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.3 }}
					>
						<SectionHeader title="Hidden gems" subtitle="Critically loved titles you might have missed." viewAllHref="/discover/hidden-gems" />
						<HorizontalCarousel
							items={(((recs as Show[] | undefined) || []).filter((s: Show) => (s.rating ?? 0) >= 7)).slice(0, 6)}
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
				{isDebugEnabled() && (
					<DebugRecBadge
						discoverCount={(recs || []).length}
						tvCount={debugMeta?.source === 'movie+tv' ? (recs || []).length : 0}
						trendingCount={debugMeta?.source === 'trending-fallback' ? (recs || []).length : 0}
						source={debugMeta?.source || 'unknown'}
						discoverTime={debugMeta?.primaryTime}
						tvTime={debugMeta?.tvTime}
						trendingTime={debugMeta?.trendingTime}
						renderedCount={renderedCount}
						expanded={isExpandedDebug()}
						rawPrimarySample={debugMeta?.primarySample}
						rawTvSample={debugMeta?.tvSample}
						rawTrendingSample={debugMeta?.trendingSample}
						requestUrls={{ primary: debugMeta?.primaryUrl, tv: debugMeta?.tvUrl, trending: debugMeta?.trendingUrl }}
					/>
				)}
			</main>
		</AppLayout>
	);
}

