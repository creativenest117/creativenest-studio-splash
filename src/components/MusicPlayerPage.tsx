'use client';
import { useState, useRef, useEffect } from 'react';
import MiniPlayer from './music/MiniPlayer';
import FullScreenPlayer from './music/FullScreenPlayer';
import PodcastPanel from './music/PodcastPanel';

export const GREEN = '#1DB954';

export function fmtTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}
export function isEmbed(url?: string) {
  if (!url) return false;
  return url.includes('spotify.com') || url.includes('soundcloud.com');
}
export function buildEmbed(url: string) {
  if (url.includes('spotify.com/track')) {
    const id = url.split('track/')[1]?.split('?')[0];
    return id ? `https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0` : null;
  }
  if (url.includes('soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%231DB954&auto_play=false&hide_related=true&show_comments=false&visual=true`;
  }
  return null;
}
export function EqBars({ playing, color = GREEN }: { playing: boolean; color?: string }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:14, width:14 }}>
      {[0.7,1,0.5].map((h,i) => (
        <div key={i} style={{ width:3, height:'100%', background:color, borderRadius:2, transformOrigin:'bottom',
          animation: playing ? `waveBar 0.8s ease-in-out ${i*0.15}s infinite` : 'none',
          transform: playing ? undefined : `scaleY(${h})` }}/>
      ))}
    </div>
  );
}
export function CoverArt({ src, size, spinning=false, rounded=12 }: { src?: string; size: number; spinning?: boolean; rounded?: number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:rounded, overflow:'hidden', flexShrink:0,
      background:'linear-gradient(135deg,#282828,#121212)', animation: spinning ? 'vinylSpin 8s linear infinite' : 'none',
      border:'1px solid rgba(255,255,255,0.05)' }}>
      {src
        ? <img src={src} alt="cover" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg viewBox="0 0 24 24" fill="none" style={{width:size*0.4,color:'rgba(255,255,255,0.2)'}}>
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
      }
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
@keyframes waveBar{0%,100%{transform:scaleY(0.4)}50%{transform:scaleY(1)}}
@keyframes slideUpFade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.music-no-scroll::-webkit-scrollbar{display:none}
.music-no-scroll{-ms-overflow-style:none;scrollbar-width:none}
.music-range::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#1DB954;cursor:pointer}
*{font-family:'Inter',sans-serif;box-sizing:border-box}
.m-play-btn { opacity:0; transform:translateY(8px); transition:all 0.2s; }
.m-card:hover .m-play-btn { opacity:1; transform:translateY(0); }
.m-card:hover { background: rgba(255,255,255,0.1) !important; }
@media (max-width: 768px) {
  .music-bottom-padding { padding-bottom: 100px !important; }
  .music-right-panel { display: none !important; }
  .m-play-btn { opacity:1; transform:translateY(0); }
}
`;

// ── Featured Card (Wide) ──────────────────────────────────────────────────────────────
function FeaturedCard({ container, onPlay }: { container: any; onPlay: (t: any) => void }) {
  const cover = container.coverImage || container.thumbnail;
  const first = container.audios?.[0];
  return (
    <div className="m-card" style={{ position:'relative', minWidth:260, flex:'1 1 260px', height:180, borderRadius:8, overflow:'hidden', cursor:'pointer', background:'rgba(255,255,255,0.05)', transition:'background 0.2s' }}
      onClick={() => first && onPlay(first)}>
      {cover
        ? <img src={cover} alt={container.name} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: 0.6 }}/>
        : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#2a2a35,#121218)' }}/>
      }
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)' }}/>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'flex-end', padding:16 }}>
        <div style={{ flex:1, minWidth:0, paddingRight:16 }}>
          <p style={{ color:'#fff', fontSize:20, fontWeight:800, margin:'0 0 4px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{container.name}</p>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, margin:0, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
            {container.audios?.slice(0,3).map((a: any) => a.artist || a.title).join(', ') || container.genre || 'Various artists'}
          </p>
        </div>
        <button className="m-play-btn" style={{ width:44, height:44, borderRadius:'50%', background:'#fff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 16px rgba(0,0,0,0.4)', flexShrink:0 }}
          onClick={(e) => { e.stopPropagation(); first && onPlay(first); }}>
          <svg viewBox="0 0 24 24" fill="#000" style={{width:20,height:20,marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Made For You Card (Square) ─────────────────────────────────────────────────────────
function MFYCard({ container, isActive, onPlay }: { container: any; isActive: boolean; onPlay: (t: any) => void }) {
  const cover = container.coverImage || container.thumbnail;
  const first = container.audios?.[0];
  return (
    <div className="m-card" onClick={() => first && onPlay(first)} style={{ background:'rgba(255,255,255,0.02)', borderRadius:8, cursor:'pointer', padding:16, textAlign:'left', flexShrink:0, width:180, transition:'background 0.2s' }}>
      <div style={{ borderRadius:8, overflow:'hidden', marginBottom:12, position:'relative', boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
        <CoverArt src={cover} size={148} rounded={8}/>
        <button className="m-play-btn" style={{ position:'absolute', bottom:8, right:8, width:40, height:40, borderRadius:'50%', background:GREEN, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 16px rgba(0,0,0,0.4)' }}
          onClick={(e) => { e.stopPropagation(); first && onPlay(first); }}>
          <svg viewBox="0 0 24 24" fill="#000" style={{width:18,height:18,marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
        </button>
      </div>
      <p style={{ color:'#fff', fontSize:14, fontWeight:700, margin:'0 0 4px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{container.name}</p>
      <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{container.genre || `${container.audios?.length||0} tracks`}</p>
    </div>
  );
}

// ── Track Row ────────────────────────────────────────────────────────
function TrackRow({ track, index, currentId, playing, onPlay }: { track: any; index: number; currentId?: string; playing: boolean; onPlay: (t: any) => void }) {
  const active = track.id === currentId;
  return (
    <div className="m-card" onClick={() => onPlay(track)} style={{
      display:'flex', alignItems:'center', gap:16, width:'100%', padding:'8px 16px',
      background: 'transparent', border:'none', cursor:'pointer', textAlign:'left',
      borderRadius:4, transition:'background 0.15s',
    }}>
      <div style={{ width:24, textAlign:'right', flexShrink:0 }}>
        {active ? <EqBars playing={playing}/> : <span style={{ color: active ? GREEN : 'rgba(255,255,255,0.6)', fontSize:14 }}>{index+1}</span>}
      </div>
      <CoverArt src={track.coverImage||track.thumbnail} size={40} rounded={4}/>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ color: active ? GREEN : '#fff', fontSize:14, fontWeight:400, margin:'0 0 2px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{track.title}</p>
        <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:0 }}>{track.artist || 'Unknown'}</p>
      </div>
      <span style={{ color:'rgba(255,255,255,0.6)', fontSize:13, flexShrink:0 }}>{track.duration||''}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function MusicPlayerPage({ appConfig }: { appConfig: any }) {
  const [tab, setTab] = useState<'all'|'music'|'podcasts'|'albums'|'eps'>('all');
  const [expandedId, setExpandedId] = useState<string|null>(null);
  const [current, setCurrent] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  
  // Shared state
  const [isLiked, setIsLiked] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement|null>(null);

  const all: any[] = appConfig?.audioContents || [];
  const musicContainers = all.filter(c => c.isContainer && (c.type==='ep'||c.type==='playlist'||c.type==='album'));
  const musicTracks     = all.filter(c => !c.isContainer && c.type==='song');
  const podContainers   = all.filter(c => c.isContainer && c.type==='podcast');
  const podTracks       = all.filter(c => !c.isContainer && c.type==='podcast');
  const epContainers    = all.filter(c => c.isContainer && c.type==='ep');

  const featuredContainers = tab==='podcasts' ? podContainers : tab==='albums' ? musicContainers : tab==='eps' ? epContainers : musicContainers;
  const singles = tab==='podcasts' ? podTracks : tab==='albums'||tab==='eps' ? [] : musicTracks;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    if (!current || isEmbed(current.audioUrl)) return;
    if (playing) {
      audioRef.current?.play().catch(()=>{});
    } else {
      audioRef.current?.pause();
    }
  }, [current, playing]);

  const queue = () => {
    if (!current) return [];
    const c = [...musicContainers,...podContainers].find(x => x.audios?.some((t:any)=>t.id===current.id));
    return c ? c.audios : [...musicTracks,...podTracks];
  };
  const handlePlay = (track: any) => {
    if (current?.id===track.id) { setPlaying(p=>!p); return; }
    setCurrent(track); setPlaying(true); setProgress(0); setDuration(0);
  };
  const handleNext = () => { 
    const q=queue(); if(!q.length||!current) return; 
    if (isShuffle) {
       handlePlay(q[Math.floor(Math.random() * q.length)]);
       return;
    }
    const i=q.findIndex((t:any)=>t.id===current.id); 
    handlePlay(q[(i+1)%q.length]); 
  };
  const handlePrev = () => { const q=queue(); if(!q.length||!current) return; const i=q.findIndex((t:any)=>t.id===current.id); handlePlay(q[(i-1+q.length)%q.length]); };
  const handleSeek = (v: number) => { if(audioRef.current) audioRef.current.currentTime=v; setProgress(v); };

  const TABS = [
    { id:'all', label:'All' },
    { id:'music', label:'Music' },
    { id:'podcasts', label:'Podcasts' },
    { id:'albums', label:'Albums' },
    { id:'eps', label:'EPs' },
  ] as const;

  const showPodPanel = tab==='all' || tab==='podcasts';

  const RESPONSIVE_CSS = `
  @media (max-width: 768px) {
    .mini-player-dock { padding: 0 12px !important; height: 72px !important; }
    .mini-player-left { width: auto !important; max-width: 50%; flex: 1; gap: 8px !important; }
    .mini-player-left img { width: 44px !important; height: 44px !important; }
    .mini-player-left p { font-size: 13px !important; }
    .mini-player-center { width: auto !important; max-width: 50% !important; padding: 0 !important; }
    .mini-player-center > div:first-child { margin-bottom: 0 !important; gap: 16px !important; }
    .mini-player-scrubber { display: none !important; }
    .mini-player-right { display: none !important; }
    .m-hide-mobile { display: none !important; }
  }`;

  return (
    <div style={{ position: 'relative', height:'100svh', background:'#121212', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <style dangerouslySetInnerHTML={{__html: CSS + RESPONSIVE_CSS}}/>

      {current && !isEmbed(current.audioUrl) && (
        <audio
          ref={audioRef}
          src={current.audioUrl}
          loop={isLoop}
          onTimeUpdate={e => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
          onEnded={handleNext}
        />
      )}

      <div style={{ display:'flex', flex:1, overflow:'hidden', height:'100%' }}>

        {/* ── MAIN SCROLL AREA ── */}
        <div style={{ flex:1, overflowY:'auto' }} className="music-no-scroll music-bottom-padding">

          {/* Header & Tabs */}
          <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(18,18,18,0.95)', backdropFilter:'blur(24px)', padding:'32px 24px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
            <h1 style={{ color:'#fff', fontSize:32, fontWeight:800, margin:'0 0 24px', letterSpacing:'-0.5px' }}>{greeting()}</h1>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setExpandedId(null); }}
                  style={{ padding:'6px 16px', borderRadius:50, border:'none', cursor:'pointer', fontWeight:500, fontSize:14,
                    background: tab===t.id ? GREEN : 'rgba(255,255,255,0.1)',
                    color: tab===t.id ? '#fff' : '#fff',
                    transition:'all 0.2s' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ paddingBottom: current ? 120 : 40 }}>
            {/* Featured row */}
            {featuredContainers.length > 0 && (
              <div style={{ padding:'24px 24px 0' }}>
                <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                  {featuredContainers.slice(0,3).map((c: any) => (
                    <FeaturedCard key={c.id} container={c} onPlay={t => { handlePlay(t); setExpandedId(c.id); }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Expanded container tracks */}
            {expandedId && (() => {
              const c = [...musicContainers,...podContainers].find(x=>x.id===expandedId);
              return c ? (
                <div style={{ margin:'32px 24px 8px', animation:'slideUpFade 0.3s ease', background:'rgba(255,255,255,0.03)', padding:24, borderRadius:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
                    <CoverArt src={c.coverImage||c.thumbnail} size={120} rounded={8} />
                    <div>
                      <p style={{ color:'#fff', fontSize:12, fontWeight:700, margin:'0 0 8px' }}>{c.type?.toUpperCase()||'PLAYLIST'}</p>
                      <h2 style={{ color:'#fff', fontSize:40, fontWeight:900, margin:'0 0 12px', letterSpacing:'-1px' }}>{c.name}</h2>
                      <p style={{ color:'rgba(255,255,255,0.7)', fontSize:14, margin:0 }}>{c.audios?.length||0} tracks</p>
                    </div>
                  </div>
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:16 }}>
                    {(c.audios||[]).map((t: any, i: number) => (
                      <TrackRow key={t.id} track={t} index={i} currentId={current?.id} playing={playing} onPlay={handlePlay}/>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Made for you / Albums carousel */}
            {featuredContainers.length > 0 && (
              <div style={{ marginTop:40 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 24px', marginBottom:16 }}>
                  <h3 style={{ color:'#fff', fontSize:22, fontWeight:700, margin:0, letterSpacing:'-0.5px' }}>
                    {tab==='eps' ? 'EPs' : tab==='albums' ? 'Albums' : 'Made for you'}
                  </h3>
                  <button style={{ color:'rgba(255,255,255,0.6)', fontSize:13, fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>Show all</button>
                </div>
                <div className="music-no-scroll" style={{ display:'flex', gap:16, overflowX:'auto', padding:'0 24px 4px', scrollSnapType:'x mandatory' }}>
                  {featuredContainers.map((c: any) => (
                    <MFYCard key={c.id} container={c} isActive={expandedId===c.id}
                      onPlay={t => { handlePlay(t); setExpandedId(expandedId===c.id ? null : c.id); }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Singles Grid */}
            {singles.length > 0 && (
              <div style={{ marginTop:40 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 24px', marginBottom:16 }}>
                  <h3 style={{ color:'#fff', fontSize:22, fontWeight:700, margin:0, letterSpacing:'-0.5px' }}>
                    {tab==='podcasts' ? 'Episodes' : 'Singles & Tracks'}
                  </h3>
                </div>
                <div className="music-no-scroll" style={{ display:'flex', gap:16, overflowX:'auto', padding:'0 24px 4px', scrollSnapType:'x mandatory' }}>
                  {singles.map((t: any) => (
                     <div key={t.id} className="m-card" onClick={() => handlePlay(t)} style={{ background:'rgba(255,255,255,0.02)', borderRadius:8, cursor:'pointer', padding:16, textAlign:'left', flexShrink:0, width:180, transition:'background 0.2s' }}>
                      <div style={{ borderRadius:8, overflow:'hidden', marginBottom:12, position:'relative', boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
                        <CoverArt src={t.coverImage||t.thumbnail} size={148} rounded={8}/>
                        <button className="m-play-btn" style={{ position:'absolute', bottom:8, right:8, width:40, height:40, borderRadius:'50%', background:GREEN, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 16px rgba(0,0,0,0.4)' }}
                          onClick={(e) => { e.stopPropagation(); handlePlay(t); }}>
                          <svg viewBox="0 0 24 24" fill="#000" style={{width:18,height:18,marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
                        </button>
                      </div>
                      <p style={{ color: current?.id === t.id ? GREEN : '#fff', fontSize:14, fontWeight:700, margin:'0 0 4px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{t.title}</p>
                      <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:0, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{t.artist || 'Unknown'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {featuredContainers.length===0 && singles.length===0 && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:100, color:'rgba(255,255,255,0.2)' }}>
                <svg viewBox="0 0 24 24" fill="none" style={{width:64,height:64,marginBottom:20}}>
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <p style={{ fontSize:20, fontWeight:700, margin:'0 0 8px' }}>No Content Yet</p>
                <p style={{ fontSize:15, textAlign:'center' }}>Add music or podcasts from the Studio dashboard</p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Podcasts ── */}
        {showPodPanel && (
          <div className="music-right-panel" style={{ height:'100%' }}>
            <PodcastPanel podcasts={podContainers} podTracks={podTracks} currentId={current?.id} playing={playing} onPlay={handlePlay}/>
          </div>
        )}
      </div>

      {/* Mini player */}
      {current && !fullScreen && (
        <MiniPlayer 
          track={current} playing={playing} progress={progress} duration={duration}
          isLiked={isLiked} isLoop={isLoop} isShuffle={isShuffle}
          onToggle={() => setPlaying(p=>!p)} onNext={handleNext} onPrev={handlePrev} onOpen={() => setFullScreen(true)}
          onToggleLike={() => setIsLiked(l=>!l)} onToggleLoop={() => setIsLoop(l=>!l)} onToggleShuffle={() => setIsShuffle(s=>!s)}
          onSeek={handleSeek}
        />
      )}

      {/* Full screen */}
      {fullScreen && current && (
        <FullScreenPlayer 
          track={current} playing={playing} progress={progress} duration={duration}
          isLiked={isLiked} isLoop={isLoop} isShuffle={isShuffle}
          onClose={() => setFullScreen(false)} onToggle={() => setPlaying(p=>!p)}
          onSeek={handleSeek} onNext={handleNext} onPrev={handlePrev}
          onToggleLike={() => setIsLiked(l=>!l)} onToggleLoop={() => setIsLoop(l=>!l)} onToggleShuffle={() => setIsShuffle(s=>!s)}
        />
      )}
    </div>
  );
}
