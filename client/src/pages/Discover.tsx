import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

// Types
interface HeroItem { id: string | number; title: string; backdrop: string | null; genres?: string[]; platform?: string; rationale?: string }
interface SimpleItem { id: string | number; title: string; poster: string | null; mediaType?: string }
interface DiscoverPayload {
    hero: HeroItem | null;
    forYou: SimpleItem[];
    moodBuckets: string[];
    dynamicBlocks: { id: string; type: string; title: string }[];
    trendingThisWeek: SimpleItem[];
    anniversaries: any[];
    socialBuzz: { id: string; topic: string; mentions: number }[];
    meta: { source: string; fetchedAt: string };
}

async function fetchDiscover(): Promise<DiscoverPayload> {
    const res = await fetch('/api/discover');
    if (!res.ok) throw new Error('Failed to load discover');
    return res.json();
}

// Small helpers
function HorizontalCarousel({ items, title }: { items: SimpleItem[]; title?: string }) {
    if (!items?.length) return null;
    return (
        <div className="space-y-2">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            <div className="flex space-x-3 overflow-x-auto py-2">
                {items.map(it => (
                    <div key={it.id} className="min-w-[150px] max-w-[150px]">
                        <Card className="h-full">
                            <div className="relative h-44 w-full overflow-hidden rounded-md bg-gray-800">
                                {it.poster ? (
                                    <img src={it.poster} alt={it.title} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm">No image</div>
                                )}
                            </div>
                            <CardContent>
                                <div className="truncate text-sm font-medium" title={it.title}>{it.title}</div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DynamicAIBlock({ block }: { block?: { id: string; type: string; title: string } }) {
    if (!block) return null;
    if (block.type === 'quiz') {
        return (
            <Card className="p-4">
                <h4 className="text-lg font-semibold">{block.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">Quick interactive quiz to refine your picks.</p>
                <div className="mt-3 flex gap-2">
                    <Button onClick={() => alert('quiz flow start')}>Start Quiz</Button>
                </div>
            </Card>
        );
    }
    return (
        <Card className="p-4">
            <h4 className="text-lg font-semibold">{block.title}</h4>
            <p className="mt-2 text-sm text-muted-foreground">AI spotlight curated for your tastes.</p>
        </Card>
    );
}

function PopCultureSidebar({ buzz }: { buzz: { id: string; topic: string; mentions: number }[] }) {
    if (!buzz?.length) return null;
    return (
        <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>What's Hot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {buzz.map(b => (
                                <li key={b.id} className="flex items-center justify-between text-sm">
                                    <span>{b.topic}</span>
                                    <span className="text-xs text-muted-foreground">{b.mentions.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </aside>
    );
}

export default function Discover() {
    const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['discover'], queryFn: fetchDiscover, staleTime: 60_000 });
    const [openRationale, setOpenRationale] = useState(false);
    const [activeMood, setActiveMood] = useState<string | null>(null);
    const [activeGenres, setActiveGenres] = useState<string[]>([]);
    const [rotatingIndex, setRotatingIndex] = useState(0);

    useEffect(() => {
        if (data?.dynamicBlocks?.length) {
            const idx = Math.floor(Math.random() * data.dynamicBlocks.length);
            setRotatingIndex(idx);
        }
    }, [data]);

    const filteredForYou = useMemo(() => {
        if (!data?.forYou) return [];
        let items = data.forYou;
        if (activeMood) {
            items = items.filter(it => it.title.toLowerCase().includes(activeMood.toLowerCase().split(' ')[0]));
        }
        if (activeGenres.length) {
            // Placeholder genre filtering; real implementation would consult item.genres
            items = items.filter((_it, i) => i % 2 === 0);
        }
        return items.length ? items : data.forYou;
    }, [data, activeMood, activeGenres]);

    if (isLoading) return <div className="p-8 text-white">Loading Discover...</div>;
    if (isError || !data) return <div className="p-8 text-red-400">Failed to load discover data <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">Retry</Button></div>;

    const hero = data.hero;

    return (
        <div className="min-h-screen bg-neutral-900 text-white">
            {/* Hero */}
            {hero && (
                <div className="relative h-[420px] w-full">
                    {hero.backdrop && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} className="absolute inset-0" style={{ backgroundImage: `url(${hero.backdrop})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-extrabold leading-tight">{hero.title}</h1>
                            <div className="mt-4 flex gap-3">
                                <Button onClick={() => alert(`Open player for ${hero.title}`)}>Watch Now</Button>
                                <Button variant="outline" onClick={() => setOpenRationale(true)}>Why we picked this</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Mood/Genre explorer */}
            <div className="sticky top-16 z-30 w-full bg-gradient-to-b from-black/60 via-black/40 to-transparent py-3 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex gap-3 overflow-x-auto py-2">
                        {data.moodBuckets.map(m => {
                            const active = activeMood === m;
                            return (
                                <button key={m} onClick={() => setActiveMood(curr => (curr === m ? null : m))} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${active ? 'scale-105 bg-gradient-to-r from-indigo-500 to-pink-500 text-white' : 'bg-white/10 text-white/90 hover:bg-white/20'}`}>{m}</button>
                            );
                        })}
                        {/* Genre chips placeholder (no real genres yet in payload) */}
                        {['Sci-Fi', 'Drama', 'Thriller'].map(g => {
                            const active = activeGenres.includes(g);
                            return (
                                <button key={g} onClick={() => setActiveGenres(curr => (curr.includes(g) ? curr.filter(c => c !== g) : [...curr, g]))} className={`whitespace-nowrap rounded-full px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${active ? 'scale-105 bg-emerald-500 text-black' : 'bg-white/10 text-white/90 hover:bg-white/20'}`}>{g}</button>
                            );
                        })}
                        <div className="ml-auto flex items-center gap-2">
                            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                                <Search className="h-4 w-4" />
                                <span>Search moods & genres</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto mt-6 max-w-7xl px-4">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <main className="col-span-1 space-y-6 lg:col-span-3">
                        <AnimatePresence>
                            <motion.div key={rotatingIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <DynamicAIBlock block={data.dynamicBlocks?.[rotatingIndex]} />
                            </motion.div>
                        </AnimatePresence>
                        <section>
                            <HorizontalCarousel items={filteredForYou} title={activeMood ? `Because you're feeling ${activeMood}` : 'Because it\'s trending'} />
                        </section>
                        <section>
                            <HorizontalCarousel items={data.forYou} title={`Tailored to your mood ${activeMood ?? ''}`} />
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold">Trending This Week</h2>
                            <HorizontalCarousel items={data.trendingThisWeek.slice(0, 12)} />
                            {data.anniversaries?.length > 0 && <><h2 className="text-2xl font-bold">Anniversary Specials</h2><HorizontalCarousel items={data.anniversaries as any} /></>}
                        </section>
                    </main>
                    <PopCultureSidebar buzz={data.socialBuzz} />
                </div>
            </div>

            <Dialog open={openRationale} onOpenChange={setOpenRationale}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Why we picked {hero?.title}</DialogTitle>
                        <DialogDescription>{hero?.rationale || 'AI rationale not available.'}</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}
