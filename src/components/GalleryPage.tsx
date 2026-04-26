'use client';

import Image from 'next/image';
import { useState } from 'react';

// ─── Gallery Page ─────────────────────────────────────────────────────────────

type MediaItem = {
  id: string;
  type: 'image' | 'video' | 'audio';
  src?: string;
  thumb?: string;
  title: string;
  duration?: string;
};

const DEMO_ITEMS: MediaItem[] = [
  { id: '1', type: 'image', title: 'Midnight Architecture', duration: undefined },
  { id: '2', type: 'video', title: 'Design Dialogues Ep. 42', duration: '12:45' },
  { id: '3', type: 'image', title: 'Light & Shadow Study', duration: undefined },
  { id: '4', type: 'audio', title: 'Focus Session Mix', duration: '48:00' },
  { id: '5', type: 'image', title: 'The Dark Room', duration: undefined },
  { id: '6', type: 'video', title: 'Studio Tour 2026', duration: '08:32' },
  { id: '7', type: 'image', title: 'Brutalist Forms', duration: undefined },
  { id: '8', type: 'image', title: 'Golden Hour', duration: undefined },
];

const FILTER_TABS = ['All', 'Images', 'Videos', 'Audio'];

const GRADIENT_PALETTES = [
  'linear-gradient(135deg, #1a0f2e 0%, #2d1234 100%)',
  'linear-gradient(135deg, #0f1a2e 0%, #1a2d42 100%)',
  'linear-gradient(135deg, #1a1f0f 0%, #2a2d14 100%)',
  'linear-gradient(135deg, #2e0f1a 0%, #420f20 100%)',
  'linear-gradient(135deg, #1a2e2e 0%, #0f2e2a 100%)',
  'linear-gradient(135deg, #2e1a0f 0%, #421a0f 100%)',
  'linear-gradient(135deg, #1a0f2e 0%, #290f42 100%)',
  'linear-gradient(135deg, #2e2e0f 0%, #3a2e0a 100%)',
];

function MediaTypeIcon({ type }: { type: MediaItem['type'] }) {
  if (type === 'video') return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </div>
    </div>
  );
  if (type === 'audio') return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.3)' }}>
        <svg viewBox="0 0 24 24" fill="#D4AF37" className="w-5 h-5">
          <path d="M9 18V5l12-2v13M9 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
  return null;
}

export default function GalleryPage({ appConfig }: { appConfig: any }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [view, setView] = useState<'masonry' | 'list'>('masonry');

  const sections = appConfig?.sections || [];
  const gallerySections = sections.filter((s: any) =>
    s.type === 'gallery' || s.type === 'image_gallery' || s.type === 'video' || s.type === 'audio'
  );

  const filteredItems = DEMO_ITEMS.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Images') return item.type === 'image';
    if (activeFilter === 'Videos') return item.type === 'video';
    if (activeFilter === 'Audio') return item.type === 'audio';
    return true;
  });

  return (
    <div className="w-full min-h-screen" style={{ background: '#080610' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-5 pt-12 pb-4"
        style={{ background: 'rgba(8,6,16,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Gallery</h1>
          <div className="flex gap-2">
            {[
              { id: 'masonry' as const, icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" /></svg> },
              { id: 'list' as const, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" /></svg> },
            ].map(({ id, icon }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: view === id ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                  border: view === id ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: view === id ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 shrink-0"
              style={{
                background: activeFilter === tab ? '#D4AF37' : 'rgba(255,255,255,0.06)',
                color: activeFilter === tab ? '#0a0810' : 'rgba(255,255,255,0.5)',
                border: activeFilter === tab ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="px-4 pb-8">
        {view === 'masonry' ? (
          <div className="columns-2 gap-3 space-y-3">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: GRADIENT_PALETTES[idx % GRADIENT_PALETTES.length],
                  border: '1px solid rgba(255,255,255,0.07)',
                  aspectRatio: idx % 3 === 0 ? '3/4' : '1/1',
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 60%)' }} />

                {/* Fake abstract art background */}
                <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-10">
                  {['🏛', '🎬', '🖼', '🎵', '✨', '🌃', '🎨', '🔮'][idx % 8]}
                </div>

                <MediaTypeIcon type={item.type} />

                {/* Duration badge */}
                {item.duration && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'rgba(255,255,255,0.9)' }}>
                    {item.duration}
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(8,6,16,0.9) 0%, transparent 50%)' }}>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-xs font-semibold leading-tight">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative"
                  style={{ background: GRADIENT_PALETTES[idx % GRADIENT_PALETTES.length] }}
                >
                  <span className="text-2xl opacity-30">{['🏛', '🎬', '🖼', '🎵', '✨', '🌃', '🎨', '🔮'][idx % 8]}</span>
                  <MediaTypeIcon type={item.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{item.title}</p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {item.type}{item.duration ? ` • ${item.duration}` : ''}
                  </p>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <svg viewBox="0 0 24 24" fill="#D4AF37" className="w-3.5 h-3.5 ml-0.5">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
