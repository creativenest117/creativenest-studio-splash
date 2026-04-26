'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Radio Page ───────────────────────────────────────────────────────────────

const RADIO_STATIONS = [
  { id: '1', name: 'Midnight Architecture', genre: 'Ambient • Focus', listeners: '12.4K', live: true, color: '#6366f1' },
  { id: '2', name: 'Design Frequency', genre: 'Lo-Fi • Creative', listeners: '8.2K', live: true, color: '#D4AF37' },
  { id: '3', name: 'Studio Beats', genre: 'Electronic • Work', listeners: '5.1K', live: false, color: '#ec4899' },
  { id: '4', name: 'Architecture FM', genre: 'Jazz • Instrumental', listeners: '3.8K', live: false, color: '#06b6d4' },
];

// Animated waveform bars
function Waveform({ playing, color }: { playing: boolean; color: string }) {
  return (
    <div className="flex items-end gap-[3px] h-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: '3px',
            height: playing ? `${8 + Math.sin((i * 0.8)) * 8 + 4}px` : '3px',
            background: color,
            transition: `height ${0.3 + i * 0.05}s ease-in-out`,
            animation: playing ? `wave${i % 3} ${0.8 + i * 0.1}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function RadioPage({ appConfig }: { appConfig: any }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [currentStation, setCurrentStation] = useState(RADIO_STATIONS[0]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sections = appConfig?.sections || [];
  const radioSections = sections.filter((s: any) => s.type === 'radio');

  function handlePlay(station: typeof RADIO_STATIONS[0]) {
    setCurrentStation(station);
    if (playing === station.id) {
      setPlaying(null);
    } else {
      setPlaying(station.id);
    }
  }

  return (
    <div className="w-full min-h-screen" style={{ background: '#080610' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Radio</h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Live streams & broadcasts</p>
      </div>

      {/* Now Playing Hero Card */}
      <div className="px-5 mb-6">
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(212,175,55,0.1) 100%)`,
            border: '1px solid rgba(212,175,55,0.2)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${currentStation.color} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

          <div className="flex items-start gap-4">
            {/* Station art */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 relative"
              style={{ background: `linear-gradient(135deg, ${currentStation.color}33, ${currentStation.color}11)`, border: `1px solid ${currentStation.color}44` }}>
              <svg viewBox="0 0 24 24" fill={currentStation.color} className="w-8 h-8">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm0 4c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zm0 16c-3.3 0-6.2-1.7-8-4.2.04-2.6 5.33-4 8-4 2.67 0 7.96 1.4 8 4-1.8 2.5-4.7 4.2-8 4.2z" />
              </svg>
              {playing === currentStation.id && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: '#22c55e', boxShadow: '0 0 12px rgba(34,197,94,0.6)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {playing === currentStation.id && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.9)', color: 'white' }}>
                    LIVE
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {currentStation.name}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{currentStation.genre}</p>
              <div className="flex items-center gap-2 mt-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" className="w-3 h-3">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentStation.listeners} listeners</span>
              </div>
            </div>
          </div>

          {/* Waveform */}
          <div className="flex items-center justify-center mt-5 mb-4">
            <Waveform playing={playing === currentStation.id} color={currentStation.color} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M19 20L9 12l10-8v16zM5 4v16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </button>

            <button
              onClick={() => handlePlay(currentStation)}
              className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${currentStation.color}, ${currentStation.color}cc)`,
                boxShadow: `0 6px 30px ${currentStation.color}55`,
              }}
            >
              {playing === currentStation.id ? (
                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M5 4L15 12 5 20V4zM19 4v16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Station List */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Stations</h2>
        <div className="space-y-3">
          {RADIO_STATIONS.map(station => (
            <div
              key={station.id}
              onClick={() => handlePlay(station)}
              className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: playing === station.id
                  ? `linear-gradient(135deg, ${station.color}15, ${station.color}08)`
                  : 'rgba(255,255,255,0.04)',
                border: playing === station.id
                  ? `1px solid ${station.color}40`
                  : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Station icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${station.color}20`, border: `1px solid ${station.color}30` }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={station.color} strokeWidth="2" className="w-5 h-5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" strokeLinecap="round" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white text-sm truncate">{station.name}</p>
                  {station.live && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0"
                      style={{ background: 'rgba(239,68,68,0.9)', color: 'white' }}>
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {station.genre} • {station.listeners} listeners
                </p>
              </div>

              {playing === station.id ? (
                <Waveform playing color={station.color} />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `${station.color}20`, border: `1px solid ${station.color}30` }}>
                  <svg viewBox="0 0 24 24" fill={station.color} className="w-3.5 h-3.5 ml-0.5">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Radio from Studio */}
      {radioSections.length > 0 && (
        <div className="px-5">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Custom Broadcasts</h2>
          {radioSections.map((section: any, idx: number) => {
            const url = section.url || section.mediaUrl || section.content?.url || '';
            return (
              <div key={section.id || idx} className="mb-3 rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="p-4">
                  <p className="font-semibold text-white mb-2">{section.title || 'Radio Stream'}</p>
                  {url && (
                    <audio controls className="w-full" style={{ accentColor: '#D4AF37' }}>
                      <source src={url} />
                    </audio>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
