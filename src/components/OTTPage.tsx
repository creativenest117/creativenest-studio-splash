'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Info, Search, Volume2, VolumeX, Maximize, Pause, Rewind, FastForward, ChevronLeft, ChevronRight, X, Star, Plus, Check, List } from 'lucide-react';
import { ContentModal } from './OTTModal';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ─── Helpers ──────────────────────────────────────────────────── */
function getEmbedUrl(url: string) {
  if (!url) return '';
  if (url.includes('youtube.com/watch')) {
    const id = url.split('v=')[1]?.split('&')[0];
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }
  if (url.includes('twitch.tv/')) {
    const channel = url.split('twitch.tv/')[1]?.split('?')[0];
    if (channel) return `https://player.twitch.tv/?channel=${channel}&parent=${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`;
  }
  return url;
}

function isEmbedUrl(url: string) {
  return url?.includes('youtube.com') || url?.includes('youtu.be') || url?.includes('twitch.tv');
}

/* ─── Video Player ──────────────────────────────────────────────── */
function VideoPlayer({ url, onClose }: { url: string; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => { resetTimer(); return () => clearTimeout(timerRef.current); }, [resetTimer]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  };

  if (isEmbedUrl(url)) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <button onClick={onClose} className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-white/20 transition">
          <X className="w-6 h-6" />
        </button>
        <iframe src={getEmbedUrl(url)} className="w-full h-full border-none" allowFullScreen allow="autoplay; fullscreen" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" onMouseMove={resetTimer}>
      <video ref={videoRef} src={url} className="w-full h-full object-contain" autoPlay
        onTimeUpdate={() => { if (videoRef.current) setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100); }}
        onClick={togglePlay}
      />
      <div className={cn("absolute top-0 left-0 right-0 p-6 flex justify-between transition-opacity duration-300", showControls ? "opacity-100" : "opacity-0")}>
        <button onClick={onClose} className="p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition"><ChevronLeft className="w-8 h-8" /></button>
      </div>
      <div className={cn("absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300", showControls ? "opacity-100" : "opacity-0")}>
        <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer" onClick={(e) => {
          if (!videoRef.current) return;
          const r = e.currentTarget.getBoundingClientRect();
          videoRef.current.currentTime = ((e.clientX - r.left) / r.width) * videoRef.current.duration;
        }}>
          <div className="h-full bg-red-600 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white">{playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}</button>
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }} className="text-white"><Rewind className="w-5 h-5" /></button>
            <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }} className="text-white"><FastForward className="w-5 h-5" /></button>
            <button onClick={() => { if (videoRef.current) { videoRef.current.muted = !muted; setMuted(!muted); } }} className="text-white">{muted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}</button>
          </div>
          <button onClick={() => { if (videoRef.current) { document.fullscreenElement ? document.exitFullscreen() : videoRef.current.requestFullscreen(); } }} className="text-white"><Maximize className="w-6 h-6" /></button>
        </div>
      </div>
    </div>
  );
}

/* ─── Content Card ──────────────────────────────────────────────── */
function ContentCard({ item, onClick }: { item: any; onClick: () => void }) {
  const genres = (item.genre || '').split(',').map((g: string) => g.trim()).filter(Boolean);
  return (
    <div onClick={onClick}
      className="relative shrink-0 rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 hover:z-20 shadow-lg"
      style={{ width: '200px', height: '300px' }}>
      {item.thumbnail
        ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"><Play className="w-10 h-10 text-white/30" /></div>
      }
      {/* Always visible bottom gradient with title */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 pt-8">
        <p className="font-bold text-white text-sm leading-tight line-clamp-2 mb-1">{item.title}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.type === 'live' && <span className="text-red-500 text-[10px] font-bold flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" /> LIVE</span>}
          {genres.slice(0, 2).map((g: string) => <span key={g} className="text-[10px] text-white/60 bg-white/10 px-1.5 py-0.5 rounded-full">{g}</span>)}
        </div>
      </div>
      {/* Hover overlay play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
        <div className="w-12 h-12 bg-black/60 rounded-full border-2 border-white flex items-center justify-center backdrop-blur-sm">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>
      </div>
    </div>
  );
}

/* ─── Featured Carousel ─────────────────────────────────────────── */
function FeaturedCarousel({ items, onInfo, onPlay }: { items: any[]; onInfo: (item: any) => void; onPlay: (item: any) => void }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const next = useCallback(() => setCurrent(c => (c + 1) % items.length), [items.length]);
  const prev = () => setCurrent(c => (c - 1 + items.length) % items.length);

  useEffect(() => {
    timerRef.current = setInterval(next, 6000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  if (!items.length) return null;

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden group">
      {items.map((item, index) => (
        <div key={item.id || index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img src={item.thumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000'} alt={item.title} className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-[6000ms] ease-linear" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/30 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-[15%] left-4 md:left-12 max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              {item.type === 'series' && <span className="text-xs font-bold tracking-widest text-white/70 uppercase border border-white/20 px-2 py-0.5 rounded">Series</span>}
              {item.type === 'movie' && <span className="text-xs font-bold tracking-widest text-white/70 uppercase border border-white/20 px-2 py-0.5 rounded">Film</span>}
              {item.type === 'live' && <span className="text-xs font-bold tracking-widest text-red-500 uppercase flex items-center gap-1 animate-pulse">🔴 Live</span>}
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3 drop-shadow-lg leading-tight">{item.title}</h2>
            <div className="flex items-center gap-3 text-sm font-medium mb-3 text-white/80">
              <span className="text-green-400 font-bold">98% Match</span>
              {item.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{item.rating.toFixed(1)}</span>}
              <span className="border border-white/30 px-1.5 py-0.5 text-xs rounded">HD</span>
            </div>
            <p className="text-white/75 text-sm md:text-base line-clamp-2 mb-5 max-w-lg">{item.description}</p>
            <div className="flex gap-3">
              {item.scheduledAt && new Date(item.scheduledAt).getTime() > Date.now() ? (
                <button className="flex items-center gap-2 bg-gray-500/50 backdrop-blur-md text-white px-6 py-2.5 rounded font-bold cursor-not-allowed border border-white/20">
                  Coming Soon: {new Date(item.scheduledAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </button>
              ) : (
                <button onClick={() => onPlay(item)} className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded font-bold hover:bg-gray-200 transition">
                  <Play className="w-5 h-5 fill-black" /> Play
                </button>
              )}
              <button onClick={() => onInfo(item)} className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-6 py-2.5 rounded font-bold hover:bg-white/30 transition border border-white/20">
                <Info className="w-5 h-5" /> More Info
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Nav Controls */}
      {items.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 rounded-full"><ChevronLeft className="w-8 h-8 text-white" /></button>
          <button onClick={next} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/40 rounded-full"><ChevronRight className="w-8 h-8 text-white" /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {items.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={cn("rounded-full transition-all duration-300", current === i ? "bg-white w-6 h-2" : "bg-white/40 w-2 h-2")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Row ───────────────────────────────────────────────────────── */
function ContentRow({ title, items, onCardClick }: { title: string; items: any[]; onCardClick: (item: any) => void }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-base md:text-xl font-bold mb-3 px-1 text-white">{title}</h3>
      <div className="flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
        {items.map((item: any) => <ContentCard key={item.id} item={item} onClick={() => onCardClick(item)} />)}
      </div>
    </div>
  );
}

/* ─── Main OTT Page ─────────────────────────────────────────────── */
export default function OTTPage({ appConfig }: { appConfig: any }) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'movie' | 'series' | 'live'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);

  const ottContents: any[] = appConfig?.ottContents || [];

  const featured = ottContents.filter((c: any) => c.isFeatured);
  const featuredItems = featured.length ? featured : (ottContents.length ? [ottContents[0]] : []);

  const filtered = ottContents.filter((c: any) => {
    const matchCat = activeCategory === 'all' || c.type === activeCategory;
    const matchSearch = !searchQuery || c.title?.toLowerCase().includes(searchQuery.toLowerCase()) || c.genre?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const movies = ottContents.filter((c: any) => c.type === 'movie');
  const series = ottContents.filter((c: any) => c.type === 'series');
  const live = ottContents.filter((c: any) => c.type === 'live');

  // Compute trending (sorted by rating)
  const trending = [...ottContents].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);

  // Compute unique genres
  const allGenres = new Set<string>();
  ottContents.forEach((c: any) => {
    if (c.genre) c.genre.split(',').forEach((g: string) => allGenres.add(g.trim()));
  });
  const genresList = Array.from(allGenres).filter(Boolean).slice(0, 5); // Limit to 5 genre rows to avoid clutter

  const handlePlay = (item: any) => {
    const url = item.type === 'series'
      ? item.seasons?.[0]?.episodes?.[0]?.videoUrl || item.videoUrl || ''
      : item.videoUrl || '';
    if (url) setPlayingUrl(url);
  };

  const handlePlayUrl = (url: string) => {
    if (url) { setSelectedItem(null); setPlayingUrl(url); }
  };

  const CATS = ['all', 'movie', 'series', 'live'] as const;

  if (playingUrl) return <VideoPlayer url={playingUrl} onClose={() => setPlayingUrl(null)} />;

  return (
    <div className="w-full min-h-screen bg-[#141414] text-white pb-28" style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Glassmorphic Navbar ── */}
      <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="flex items-center justify-between px-4 md:px-8 h-14 md:h-16">
          {/* Left: Logo + Desktop Cats */}
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black text-red-500 tracking-tighter">OTT</h1>
            <div className="hidden md:flex items-center gap-5">
              {CATS.map(cat => (
                <button key={cat} onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
                  className={cn("text-sm font-semibold capitalize transition", activeCategory === cat && !searchQuery ? "text-white" : "text-white/50 hover:text-white/80")}>
                  {cat === 'all' ? 'Home' : cat + 's'}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Search */}
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex items-center gap-2 bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <Search className="w-4 h-4 text-white/50 shrink-0" />
                <input autoFocus type="text" placeholder="Search titles, genres…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder:text-white/40 outline-none w-40 md:w-56" />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Category Pills */}
        <div className="md:hidden flex gap-2 px-4 pb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {CATS.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
              className={cn("shrink-0 px-4 py-1 rounded-full text-xs font-bold capitalize transition border",
                activeCategory === cat && !searchQuery ? "bg-white text-black border-white" : "bg-transparent text-white/70 border-white/20 hover:border-white/50")}>
              {cat === 'all' ? 'Home' : cat + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Spacer for navbar ── */}
      <div className="h-14 md:h-16" />
      <div className="h-8 md:h-0" />

      {/* ── Search Results ── */}
      {searchQuery ? (
        <div className="px-4 md:px-8 pt-4">
          <h3 className="text-sm text-white/50 mb-4">Results for &quot;<span className="text-white">{searchQuery}</span>&quot;</h3>
          {filtered.length === 0
            ? <div className="flex flex-col items-center justify-center py-24 text-white/30"><Search className="w-12 h-12 mb-4" /><p className="text-lg">No results found</p></div>
            : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filtered.map((item: any) => <ContentCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />)}
              </div>
          }
        </div>
      ) : (
        <>
          {/* ── Featured Carousel ── */}
          {activeCategory === 'all' && featuredItems.length > 0 && (
            <FeaturedCarousel items={featuredItems} onInfo={item => setSelectedItem(item)} onPlay={handlePlay} />
          )}

          {/* ── Content Rows ── */}
          <div className="px-4 md:px-8 space-y-8 mt-6">
            {activeCategory === 'all' ? (
              <>
                {trending.length > 0 && <ContentRow title="Trending Now" items={trending} onCardClick={setSelectedItem} />}
                {series.length > 0 && <ContentRow title="Series" items={series} onCardClick={setSelectedItem} />}
                {movies.length > 0 && <ContentRow title="Movies" items={movies} onCardClick={setSelectedItem} />}
                {live.length > 0 && <ContentRow title="Live Streams" items={live} onCardClick={setSelectedItem} />}
                {genresList.map(genre => {
                  const genreItems = ottContents.filter((c: any) => c.genre?.toLowerCase().includes(genre.toLowerCase()));
                  if (genreItems.length === 0) return null;
                  return <ContentRow key={genre} title={`Top in ${genre}`} items={genreItems} onCardClick={setSelectedItem} />;
                })}
                {ottContents.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-28 text-white/30">
                    <Play className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-xl font-bold">No content yet</p>
                    <p className="text-sm mt-1">Add videos from the Studio dashboard.</p>
                  </div>
                )}
              </>
            ) : (
              <ContentRow title={activeCategory === 'movie' ? 'Movies' : activeCategory === 'series' ? 'Series' : 'Live Streams'} items={filtered} onCardClick={setSelectedItem} />
            )}
          </div>
        </>
      )}

      {/* ── Netflix Popup ── */}
      {selectedItem && (
        <ContentModal item={selectedItem} onClose={() => setSelectedItem(null)} onPlay={handlePlayUrl} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `*::-webkit-scrollbar{display:none;}` }} />
    </div>
  );
}
