'use client';

import { useState } from 'react';

// ─── TV Page ──────────────────────────────────────────────────────────────────

const TV_CHANNELS = [
  { id: '1', name: 'Architecture Now', ch: 'CH 01', status: 'LIVE', viewers: '4.2K', color: '#6366f1' },
  { id: '2', name: 'Design Studio TV', ch: 'CH 02', status: 'LIVE', viewers: '2.8K', color: '#D4AF37' },
  { id: '3', name: 'Creative Talks', ch: 'CH 03', status: '20:00 EST', viewers: null, color: '#ec4899' },
  { id: '4', name: 'Luxury Spaces', ch: 'CH 04', status: '22:00 EST', viewers: null, color: '#06b6d4' },
];

const TV_SCHEDULE = [
  { time: 'NOW', show: 'Design Dialogues Ep. 42', host: 'Discussing quality form and function with designers all around the globe.', live: true },
  { time: '20:00', show: 'Architecture & Light', host: 'Studio DNA special feature', live: false },
  { time: '22:00', show: 'Gallery Opening: Concrete', host: "London's premiere design event", live: false },
];

export default function TVPage({ appConfig }: { appConfig: any }) {
  const [selectedChannel, setSelectedChannel] = useState('1');

  const sections = appConfig?.sections || [];
  const tvSections = sections.filter((s: any) =>
    s.type === 'tv' || s.type === 'live_tv' || s.type === 'livestream'
  );
  const activeChannel = TV_CHANNELS.find(c => c.id === selectedChannel) || TV_CHANNELS[0];

  return (
    <div className="w-full min-h-screen" style={{ background: '#080610' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Live TV</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400">LIVE</span>
          </div>
        </div>
      </div>

      {/* Main TV Screen */}
      <div className="px-5 mb-5">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${activeChannel.color}15 0%, rgba(8,6,16,0.9) 100%)`,
            border: `1px solid ${activeChannel.color}30`,
            boxShadow: `0 8px 40px ${activeChannel.color}20`,
          }}
        >
          {/* TV Screen area */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%', background: '#000' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              {/* Scanlines effect */}
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }} />

              <div className="text-center z-10">
                <div className="flex items-center gap-2 justify-center mb-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-black text-red-400 uppercase tracking-widest">On Air</span>
                </div>
                <span className="text-5xl mb-3 block">📺</span>
                <p className="text-gray-400 text-sm mt-1">Join other viewers who are watching right now.</p>
              </div>

              {/* Play button */}
              <button className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${activeChannel.color}, ${activeChannel.color}cc)`, boxShadow: `0 6px 30px ${activeChannel.color}44` }}>
                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 ml-1">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </button>
            </div>
          </div>

          {/* Channel info bar */}
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${activeChannel.color}20`, border: `1px solid ${activeChannel.color}30` }}>
              <span className="text-xs font-black" style={{ color: activeChannel.color }}>{activeChannel.ch}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm">{activeChannel.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {activeChannel.status === 'LIVE' && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-400 font-semibold">LIVE</span>
                    {activeChannel.viewers && (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>• {activeChannel.viewers} viewers</span>
                    )}
                  </>
                )}
                {activeChannel.status !== 'LIVE' && (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Scheduled: {activeChannel.status}</span>
                )}
              </div>
            </div>
            {/* Volume icon */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Channels</h2>
        <div className="grid grid-cols-2 gap-3">
          {TV_CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel.id)}
              className="flex items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: selectedChannel === channel.id
                  ? `linear-gradient(135deg, ${channel.color}20, ${channel.color}08)`
                  : 'rgba(255,255,255,0.04)',
                border: selectedChannel === channel.id
                  ? `1px solid ${channel.color}50`
                  : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${channel.color}20` }}>
                <span className="text-[10px] font-black" style={{ color: channel.color }}>{channel.ch}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate leading-tight">{channel.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {channel.status === 'LIVE'
                    ? <><span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" /><span className="text-[9px] text-red-400">LIVE</span></>
                    : <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{channel.status}</span>
                  }
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="px-5 mb-6">
        <h2 className="text-base font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Today&apos;s Schedule</h2>
        <div className="space-y-2">
          {TV_SCHEDULE.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-4 rounded-2xl p-4"
              style={{
                background: item.live ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.03)',
                border: item.live ? '1px solid rgba(212,175,55,0.2)' : '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="shrink-0 pt-0.5">
                <span className="text-xs font-black uppercase tracking-wider"
                  style={{ color: item.live ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>
                  {item.time}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white">{item.show}</p>
                  {item.live && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.host}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom TV from Studio */}
      {tvSections.length > 0 && (
        <div className="px-5">
          <h2 className="text-base font-bold text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>Your Broadcasts</h2>
          {tvSections.map((section: any, idx: number) => (
            <div key={section.id || idx} className="mb-3 rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {section.url && (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={section.url}
                    title={section.title || 'Live TV'}
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                </div>
              )}
              {section.title && (
                <div className="p-4" style={{ background: 'rgba(15,12,28,0.8)' }}>
                  <p className="font-semibold text-white">{section.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
