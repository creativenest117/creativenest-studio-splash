'use client';

import { useState } from 'react';

// ─── OTT Page ─────────────────────────────────────────────────────────────────

const OTT_CATEGORIES = ['Featured', 'Series', 'Films', 'Docs', 'Live'];

const OTT_CONTENT = [
  { id: '1', title: 'Design Dialogues', ep: 'Ep. 42', badge: 'NEW', genre: 'Documentary' },
  { id: '2', title: 'Architecture Futures', ep: 'Season 2', badge: 'HD', genre: 'Series' },
  { id: '3', title: 'The Dark Room', ep: 'Full Film', badge: '4K', genre: 'Film' },
  { id: '4', title: 'Studio Sessions', ep: 'Ep. 18', badge: 'LIVE', genre: 'Live' },
];

export default function OTTPage({ appConfig }: { appConfig: any }) {
  const [activeCategory, setActiveCategory] = useState('Featured');
  const sections = appConfig?.sections || [];
  const ottSections = sections.filter((s: any) =>
    s.type === 'tv' || s.type === 'live_tv' || s.type === 'video' || s.type === 'livestream' || s.type === 'youtube'
  );

  return (
    <div className="w-full min-h-screen" style={{ background: '#080610' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>OTT</h1>
          <button className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Featured Hero */}
      <div className="px-5 mb-5">
        <div
          className="relative w-full rounded-3xl overflow-hidden cursor-pointer group"
          style={{
            height: '220px',
            background: 'linear-gradient(135deg, #0f1a2e 0%, #1a0f2e 50%, #2e1a0f 100%)',
            border: '1px solid rgba(212,175,55,0.15)',
          }}
        >
          {/* Abstract backdrop */}
          <div className="absolute inset-0 opacity-20 flex items-center justify-center text-8xl">🎬</div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 60%)' }} />

          {/* LIVE badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(8px)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[10px] font-black tracking-widest">LIVE</span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5"
            style={{ background: 'linear-gradient(to top, rgba(8,6,16,0.95) 0%, transparent 100%)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Now Playing</p>
            <h2 className="text-xl font-black text-white leading-tight">Design Dialogues</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Episode 42 • Season 3</p>
          </div>

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(212,175,55,0.9)', boxShadow: '0 0 40px rgba(212,175,55,0.4)' }}>
              <svg viewBox="0 0 24 24" fill="#0a0810" className="w-7 h-7 ml-1">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {OTT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 shrink-0"
              style={{
                background: activeCategory === cat ? '#D4AF37' : 'rgba(255,255,255,0.06)',
                color: activeCategory === cat ? '#0a0810' : 'rgba(255,255,255,0.5)',
                border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Cards */}
      <div className="px-5 mb-6">
        <div className="flex gap-3 overflow-x-auto pb-3">
          {OTT_CONTENT.map((item, idx) => (
            <div
              key={item.id}
              className="relative shrink-0 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-[1.02]"
              style={{
                width: '160px',
                height: '220px',
                background: `linear-gradient(135deg, hsl(${230 + idx * 25}, 40%, 12%) 0%, hsl(${230 + idx * 25}, 30%, 8%) 100%)`,
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-15">
                {['🎬', '📺', '🎞', '🔴'][idx]}
              </div>

              {/* Badge */}
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] font-black"
                style={{
                  background: item.badge === 'LIVE' ? 'rgba(239,68,68,0.9)' : 'rgba(212,175,55,0.9)',
                  color: '#0a0810',
                }}>
                {item.badge}
              </div>

              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3"
                style={{ background: 'linear-gradient(to top, rgba(8,6,16,0.95) 0%, transparent 100%)' }}>
                <p className="text-white font-bold text-sm leading-tight">{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.ep}</p>
              </div>

              {/* Hover play */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections from Studio */}
      {ottSections.length > 0 && (
        <div className="px-5">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Your Content</h2>
          {ottSections.map((section: any, idx: number) => (
            <div key={section.id || idx}
              className="mb-3 rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {section.url && (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={section.url}
                    title={section.title || 'Content'}
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                </div>
              )}
              {section.title && (
                <div className="p-4" style={{ background: 'rgba(15,12,28,0.8)' }}>
                  <p className="font-semibold text-white">{section.title}</p>
                  {section.description && <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{section.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
