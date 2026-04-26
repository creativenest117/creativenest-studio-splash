'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Music Player Page — Spotify-Style ─────────────────────────────────────

const SAMPLE_PLAYLISTS = [
  { id: 'p1', name: 'Dark Frequencies', count: 12, color: '#6366f1' },
  { id: 'p2', name: 'Morning Rituals', count: 8, color: '#D4AF37' },
  { id: 'p3', name: 'Focus Mode', count: 15, color: '#10b981' },
];

const SAMPLE_TRACKS = [
  { id: 't1', title: 'Midnight Architecture', artist: 'Prabhat Sharma', duration: '3:42', cover: null, genre: 'Electronic', playlistId: 'p1' },
  { id: 't2', title: 'Golden Hour Sessions', artist: 'Prabhat Sharma', duration: '4:15', cover: null, genre: 'Ambient', playlistId: 'p1' },
  { id: 't3', title: 'Brutalist Forms', artist: 'Prabhat Sharma', duration: '2:58', cover: null, genre: 'Experimental', playlistId: 'p2' },
  { id: 't4', title: 'Light & Shadow Study', artist: 'Prabhat Sharma', duration: '5:10', cover: null, genre: 'Cinematic', playlistId: 'p1' },
  { id: 't5', title: 'The Dark Room', artist: 'Prabhat Sharma', duration: '3:28', cover: null, genre: 'Electronic', playlistId: 'p3' },
  { id: 't6', title: 'Urban Pulse', artist: 'Prabhat Sharma', duration: '4:02', cover: null, genre: 'Electronic', playlistId: 'p3' },
];

type Track = typeof SAMPLE_TRACKS[0];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function TrackCover({ track, size = 48, playing = false }: { track: Track; size?: number; playing?: boolean }) {
  const colors = ['#6366f1', '#D4AF37', '#10b981', '#f97316', '#ec4899', '#06b6d4'];
  const color = colors[parseInt(track.id.replace('t', '')) % colors.length];
  return (
    <div
      className="rounded-xl flex items-center justify-center relative overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
        border: `1px solid ${color}33`,
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.5, height: size * 0.5, color }}>
        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
      {playing && (
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="flex gap-0.5 items-end h-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-1 rounded-full animate-pulse"
                style={{ background: '#D4AF37', height: `${40 + i * 20}%`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FullScreenPlayer({
  track,
  isPlaying,
  progress,
  duration,
  onClose,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
}: {
  track: Track;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onClose: () => void;
  onTogglePlay: () => void;
  onSeek: (v: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const colors = ['#6366f1', '#D4AF37', '#10b981', '#f97316', '#ec4899', '#06b6d4'];
  const accent = colors[parseInt(track.id.replace('t', '')) % colors.length];

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{
        background: `linear-gradient(180deg, ${accent}22 0%, #080610 40%)`,
        backdropFilter: 'blur(40px)',
      }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Now Playing</p>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <circle cx="12" cy="12" r="1" fill="white" /><circle cx="19" cy="12" r="1" fill="white" /><circle cx="5" cy="12" r="1" fill="white" />
          </svg>
        </button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="relative mb-8"
          style={{
            width: 260,
            height: 260,
            borderRadius: 24,
            background: `linear-gradient(135deg, ${accent}44, ${accent}11)`,
            border: `1px solid ${accent}44`,
            boxShadow: `0 0 80px ${accent}44`,
          }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 100, height: 100, color: accent }}>
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          {isPlaying && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 items-end"
              style={{ height: 20 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-1.5 rounded-full animate-pulse"
                  style={{ background: accent, height: `${30 + i * 20}%`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="text-center mb-8 w-full">
          <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {track.title}
          </h2>
          <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{track.artist}</p>
          <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}>
            {track.genre}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full px-2 mb-6">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={progress}
            onChange={e => onSeek(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(90deg, ${accent} ${(progress / (duration || 100)) * 100}%, rgba(255,255,255,0.15) 0%)`,
              accentColor: accent,
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatTime(progress)}</span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{formatTime(duration || 0)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 w-full">
          <button onClick={onPrev} className="w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-90"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={onTogglePlay}
            className="w-18 h-18 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              width: 72, height: 72,
              background: accent,
              boxShadow: `0 0 40px ${accent}66`,
            }}>
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="#0a0810" className="w-8 h-8">
                <path d="M6 19h4V5H6zm8-14v14h4V5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="#0a0810" className="w-8 h-8 ml-1">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <button onClick={onNext} className="w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-90"
            style={{ color: 'rgba(255,255,255,0.6)' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MusicPlayerPage({ appConfig }: { appConfig: any }) {
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(220);
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists' | 'podcasts'>('songs');
  const progressRef = useRef<any>(null);

  // Simulate progress tick
  useEffect(() => {
    if (isPlaying) {
      progressRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= duration) { setIsPlaying(false); return 0; }
          return p + 1;
        });
      }, 1000);
    }
    return () => clearInterval(progressRef.current);
  }, [isPlaying, duration]);

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
      setDuration(parseInt(track.duration.split(':')[0]) * 60 + parseInt(track.duration.split(':')[1]));
    }
  };

  const handleNext = () => {
    if (!currentTrack) return;
    const idx = SAMPLE_TRACKS.findIndex(t => t.id === currentTrack.id);
    const next = SAMPLE_TRACKS[(idx + 1) % SAMPLE_TRACKS.length];
    handlePlayTrack(next);
  };

  const handlePrev = () => {
    if (!currentTrack) return;
    const idx = SAMPLE_TRACKS.findIndex(t => t.id === currentTrack.id);
    const prev = SAMPLE_TRACKS[(idx - 1 + SAMPLE_TRACKS.length) % SAMPLE_TRACKS.length];
    handlePlayTrack(prev);
  };

  const displayTracks = activePlaylist
    ? SAMPLE_TRACKS.filter(t => t.playlistId === activePlaylist)
    : SAMPLE_TRACKS;

  return (
    <div className="w-full min-h-screen pb-28" style={{ background: '#080610' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Your Music
            </p>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Music Player
            </h1>
          </div>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mt-4">
          {(['songs', 'playlists', 'podcasts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200"
              style={{
                background: activeTab === tab ? '#D4AF37' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab ? '#0a0810' : 'rgba(255,255,255,0.5)',
                border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Playlists Section */}
      {activeTab === 'playlists' ? (
        <div className="px-5">
          <div className="grid grid-cols-1 gap-3">
            {SAMPLE_PLAYLISTS.map(pl => (
              <button
                key={pl.id}
                onClick={() => { setActivePlaylist(pl.id === activePlaylist ? null : pl.id); setActiveTab('songs'); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: activePlaylist === pl.id ? `1px solid ${pl.color}66` : '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${pl.color}22`, border: `1px solid ${pl.color}44` }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: 28, height: 28, color: pl.color }}>
                    <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{pl.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{pl.count} tracks</p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="w-5 h-5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ) : activeTab === 'podcasts' ? (
        <div className="px-5 text-center py-20">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" className="w-8 h-8">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-white font-bold mb-2">No Podcasts Yet</p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Upload your first podcast episode from the Studio</p>
        </div>
      ) : (
        <>
          {/* Playlist Filter Chips */}
          {activePlaylist && (
            <div className="px-5 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Filtering:
                </span>
                {SAMPLE_PLAYLISTS.filter(p => p.id === activePlaylist).map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => setActivePlaylist(null)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: `${pl.color}22`, color: pl.color, border: `1px solid ${pl.color}44` }}
                  >
                    {pl.name}
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Track List */}
          <div className="px-5 space-y-2">
            {displayTracks.map((track, idx) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => handlePlayTrack(track)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 text-left group hover:scale-[1.005] active:scale-[0.99]"
                  style={{
                    background: isCurrentTrack ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isCurrentTrack ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Track Number / Cover */}
                  <div className="shrink-0">
                    {isCurrentTrack ? (
                      <TrackCover track={track} size={44} playing={isPlaying} />
                    ) : (
                      <div className="w-11 h-11 flex items-center justify-center relative">
                        <span className="text-sm font-bold group-hover:opacity-0 transition-opacity"
                          style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {idx + 1}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" className="w-5 h-5">
                            <polygon points="5,3 19,12 5,21" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate"
                      style={{ color: isCurrentTrack ? '#D4AF37' : 'white' }}>
                      {track.title}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {track.artist} · {track.genre}
                    </p>
                  </div>

                  {/* Duration */}
                  <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {track.duration}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Mini Player Bar */}
      {currentTrack && !showFullPlayer && (
        <div
          className="fixed left-3 right-3 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
          style={{
            bottom: 88,
            background: 'rgba(20,16,38,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
          onClick={() => setShowFullPlayer(true)}
        >
          <TrackCover track={currentTrack} size={40} playing={isPlaying} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{currentTrack.title}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{currentTrack.artist}</p>
          </div>
          {/* Progress bar thin */}
          <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(progress / duration) * 100}%`, background: '#D4AF37' }} />
          </div>
          <button
            onClick={e => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: '#D4AF37' }}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="#0a0810" className="w-4 h-4">
                <path d="M6 19h4V5H6zm8-14v14h4V5z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="#0a0810" className="w-4 h-4 ml-0.5">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>
          <button
            onClick={e => { e.stopPropagation(); handleNext(); }}
            className="w-8 h-8 flex items-center justify-center"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" />
            </svg>
          </button>
        </div>
      )}

      {/* Full Screen Player */}
      {showFullPlayer && currentTrack && (
        <FullScreenPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          onClose={() => setShowFullPlayer(false)}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSeek={setProgress}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
}
