'use client';

import Image from 'next/image';

// ─── Magazine Page ────────────────────────────────────────────────────────────

const SAMPLE_ISSUES = [
  { vol: 'VOL. 24', title: 'The Autumn Couture', subtitle: 'Published 2 days ago', featured: true },
  { vol: 'VOL. 23', title: 'Modern Edge', subtitle: 'Published 1 week ago', featured: false },
  { vol: 'VOL. 22', title: 'Golden Era', subtitle: 'Published 2 weeks ago', featured: false },
];

function MagazineCover({ issue, large = false }: { issue: typeof SAMPLE_ISSUES[0]; large?: boolean }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] ${large ? 'h-72' : 'h-48'}`}
      style={{
        background: 'linear-gradient(135deg, #1a0f2e 0%, #2d1f42 100%)',
        border: '1px solid rgba(212,175,55,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Luxury gold sheen */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 60%)' }} />

      {/* Vol badge */}
      <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-black tracking-widest"
        style={{ background: '#D4AF37', color: '#0a0810' }}>
        {issue.vol}
      </div>

      {/* Magazine title lettering */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-4xl font-black tracking-tighter opacity-20"
          style={{ color: '#D4AF37', fontFamily: "'Outfit', sans-serif", fontSize: large ? '72px' : '48px' }}
        >
          {issue.title.slice(0, 3).toUpperCase()}
        </span>
      </div>

      {/* Gradient overlay bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{ background: 'linear-gradient(to top, rgba(8,6,16,0.95) 0%, transparent 100%)' }} />

      {/* Bottom text */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-bold text-lg leading-tight">{issue.title}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{issue.subtitle}</p>
      </div>
    </div>
  );
}

function StatsCard({ value, label, sub, arrow }: { value: string; label: string; sub?: string; arrow?: 'up' | 'down' }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-3xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{value}</span>
        {arrow && sub && (
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: arrow === 'up' ? '#22c55e' : '#ef4444' }}>
              {arrow === 'up'
                ? <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M7 7L17 17M17 17H7M17 17V7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              }
            </svg>
            <span className="text-sm font-bold" style={{ color: arrow === 'up' ? '#22c55e' : '#ef4444' }}>{sub}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MagazinePage({ appConfig }: { appConfig: any }) {
  const displayName = appConfig?.appName || 'Creator';
  const sections = appConfig?.sections || [];
  const magazineSections = sections.filter((s: any) => s.type === 'magazine' || s.type === 'article');

  return (
    <div className="w-full min-h-screen pb-4" style={{ background: '#080610' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Welcome Back
        </p>
        <h1 className="text-3xl font-black" style={{ color: '#D4AF37', fontFamily: "'Outfit', sans-serif" }}>
          {displayName}
        </h1>
        <button className="absolute top-12 right-5 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
            style={{ background: '#D4AF37', color: '#0a0810' }}>3</span>
        </button>
      </div>

      {/* Audience Stats */}
      <div className="px-5 mb-6">
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(15,12,28,0.8)',
            border: '1px solid rgba(212,175,55,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Total Audience</p>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-5xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>2.4M</span>
            <div className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: '#22c55e' }}>
                <path d="M7 17L17 7M17 7H7M17 7v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-bold" style={{ color: '#22c55e' }}>12.5%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatsCard value="840K" label="Magazine" />
            <StatsCard value="1.2M" label="TV / OTT" />
            <StatsCard value="$42K" label="Revenue" />
          </div>
        </div>
      </div>

      {/* Latest Issues */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Latest Issues</h2>
          <button className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#D4AF37' }}>View All</button>
        </div>

        {/* Featured issue */}
        <MagazineCover issue={SAMPLE_ISSUES[0]} large />

        {/* Issue row */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {SAMPLE_ISSUES.slice(1).map(issue => (
            <MagazineCover key={issue.vol} issue={issue} />
          ))}
        </div>
      </div>

      {/* Broadcast Status */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Broadcast Status</h2>
        <div className="space-y-3">
          {[
            { icon: '📻', name: 'Radio Channel 1', status: 'Live Now • 12K Listeners', live: true },
            { icon: '📺', name: 'OTT Premium', status: 'Scheduled: 20:00 EST', live: false },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-4 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: item.live ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)' }}>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                  <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.status}</p>
                </div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="w-5 h-5 shrink-0">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Media */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Recent Media</h2>
          <div className="flex gap-2">
            {['grid', 'list'].map(v => (
              <button key={v} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: v === 'grid' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)', border: v === 'grid' ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                {v === 'grid'
                  ? <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#D4AF37' }}><path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" className="w-4 h-4"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" /></svg>
                }
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group ${i === 3 ? 'relative' : ''}`}
              style={{
                background: `linear-gradient(135deg, hsl(${260 + i * 30}, 40%, 12%) 0%, hsl(${260 + i * 30}, 30%, 8%) 100%)`,
                border: '1px solid rgba(255,255,255,0.06)',
                aspectRatio: '1',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-20">
                {['🎬', '🎵', '📸', '✨'][i]}
              </div>
              {i === 3 && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(8,6,16,0.7)', backdropFilter: 'blur(4px)' }}>
                  <div className="text-center">
                    <span className="text-2xl font-black" style={{ color: '#D4AF37', fontFamily: "'Outfit', sans-serif" }}>+15</span>
                    <p className="text-xs text-white/50 mt-0.5">More</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
