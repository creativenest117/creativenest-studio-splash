'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, X, Plus, Check, Star, List, ChevronLeft, ChevronRight } from 'lucide-react';

function cn(...c: (string|undefined|null|false)[]) { return c.filter(Boolean).join(' '); }

interface ContentModalProps {
  item: any;
  onClose: () => void;
  onPlay: (url: string) => void;
}

export function ContentModal({ item, onClose, onPlay }: ContentModalProps) {
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [inList, setInList] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animate in
  useEffect(() => {
    setMounted(true);
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(t);
  }, []);

  // Reset season when item changes
  useEffect(() => { setSelectedSeason(0); }, [item?.id]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const genres = (item?.genre || '').split(',').map((g: string) => g.trim()).filter(Boolean);
  const currentSeason = item?.seasons?.[selectedSeason];
  const episodes: any[] = currentSeason?.episodes || [];

  const getPlayUrl = () => {
    if (item?.type === 'series') return episodes[0]?.videoUrl || item?.videoUrl || '';
    return item?.videoUrl || '';
  };

  if (!mounted) return null;

  const modal = (
    <div
      data-ott-modal
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'flex-end',
        transition: 'background-color 280ms ease',
        backgroundColor: visible ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'none',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      {/* Mobile: bottom-sheet, Desktop: centered */}
      <div
        data-ott-sheet
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          margin: '0 auto',
          background: 'linear-gradient(180deg,#1a1a2e 0%,#16213e 100%)',
          borderRadius: '20px 20px 0 0',
          overflowY: 'auto',
          transition: 'transform 280ms cubic-bezier(0.34,1.26,0.64,1), opacity 280ms ease',
          transform: visible ? 'translateY(0)' : 'translateY(60px)',
          opacity: visible ? 1 : 0,
          boxShadow: '0 -20px 80px rgba(0,0,0,0.7)',
          alignSelf: 'flex-end',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', flexShrink: 0 }}>
          {item?.thumbnail
            ? <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px 20px 0 0' }} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#0f3460)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px 20px 0 0' }}>
                <Play style={{ width: 48, height: 48, color: 'rgba(255,255,255,0.2)' }} />
              </div>
          }
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1a1a2e 0%, rgba(26,26,46,0.5) 50%, transparent 100%)', borderRadius: '20px 20px 0 0' }} />
          {/* Close button */}
          <button onClick={handleClose} style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', transition: 'background 200ms' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
          {/* Live badge */}
          {item?.type === 'live' && (
            <span style={{ position: 'absolute', top: 12, left: 12, background: '#e50914', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1s infinite' }} />LIVE
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '0 20px 24px', fontFamily: "'Outfit',sans-serif" }}>
          {/* Title + Actions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginTop: 16, marginBottom: 12 }}>
            <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, lineHeight: 1.2, margin: 0, flex: 1 }}>{item?.title}</h2>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {item?.scheduledAt && new Date(item.scheduledAt).getTime() > Date.now() ? (
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 18px', fontWeight: 800, fontSize: 14, cursor: 'not-allowed', fontFamily: "'Outfit',sans-serif" }}
                >
                  Coming Soon: {new Date(item.scheduledAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </button>
              ) : (
                <button
                  onClick={() => { const url = getPlayUrl(); if (url) { onPlay(url); } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', color: '#000', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 800, fontSize: 14, cursor: 'pointer', transition: 'background 200ms,transform 150ms', fontFamily: "'Outfit',sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#e5e5e5')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <Play style={{ width: 14, height: 14, fill: '#000' }} /> Play
                </button>
              )}
              <button
                onClick={() => setInList(!inList)}
                style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 200ms,background 200ms' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
              >
                {inList ? <Check style={{ width: 16, height: 16 }} /> : <Plus style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {item?.rating && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f5c518', fontSize: 13, fontWeight: 700 }}>
                <Star style={{ width: 13, height: 13, fill: '#f5c518' }} />{item.rating.toFixed(1)}
              </span>
            )}
            <span style={{ color: '#46d369', fontSize: 13, fontWeight: 700 }}>98% Match</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{item?.createdAt ? new Date(item.createdAt).getFullYear() : '2024'}</span>
            <span style={{ border: '1px solid rgba(255,255,255,0.3)', padding: '1px 6px', borderRadius: 3, color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600 }}>HD</span>
            {genres.map((g: string) => (
              <span key={g} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600 }}>{g}</span>
            ))}
          </div>

          {/* Description */}
          {item?.description && (
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>{item.description}</p>
          )}

          {/* Series: Seasons + Episodes */}
          {item?.type === 'series' && item?.seasons?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {/* Season tabs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
                <List style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                {item.seasons.map((s: any, i: number) => (
                  <button key={i} onClick={() => setSelectedSeason(i)} style={{
                    flexShrink: 0,
                    padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    background: selectedSeason === i ? '#fff' : 'rgba(255,255,255,0.1)',
                    color: selectedSeason === i ? '#000' : 'rgba(255,255,255,0.7)',
                    transition: 'background 200ms, color 200ms',
                    fontFamily: "'Outfit',sans-serif",
                  }}>
                    {s.title || `Season ${s.seasonNum || i + 1}`}
                  </button>
                ))}
              </div>

              {/* Episodes */}
              {episodes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>No episodes added yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
                  {episodes.map((ep: any, ei: number) => {
                    const isFuture = ep.scheduledAt && new Date(ep.scheduledAt).getTime() > Date.now();
                    return (
                    <button
                      key={ei}
                      onClick={() => { if (!isFuture && ep.videoUrl) onPlay(ep.videoUrl); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)', border: 'none', cursor: isFuture ? 'not-allowed' : (ep.videoUrl ? 'pointer' : 'default'),
                        textAlign: 'left', transition: 'background 180ms', width: '100%',
                        opacity: isFuture ? 0.6 : 1
                      }}
                      onMouseEnter={e => !isFuture && (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                      onMouseLeave={e => !isFuture && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: 15, width: 22, flexShrink: 0, textAlign: 'center' }}>
                        {ep.episodeNum || ei + 1}
                      </span>
                      {ep.thumbnail && (
                        <img src={ep.thumbnail} alt={ep.title} style={{ width: 72, height: 42, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ep.title || `Episode ${ei + 1}`}
                        </p>
                        {isFuture ? (
                           <p style={{ color: '#e50914', fontSize: 11, margin: '2px 0 0', fontWeight: 600 }}>
                             Coming Soon: {new Date(ep.scheduledAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                           </p>
                        ) : ep.description && (
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '2px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {ep.description}
                          </p>
                        )}
                      </div>
                      {!isFuture && ep.videoUrl && <Play style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />}
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media(min-width:640px){
          [data-ott-modal]{
            align-items:center!important;
          }
          [data-ott-sheet]{
            border-radius:16px!important;
            max-height:88vh!important;
            align-self:center!important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
