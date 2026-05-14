'use client';
import { useState } from 'react';
import { GREEN, fmtTime } from '../MusicPlayerPage';

const G = '#1DB954';
const FSP_CSS = `
  .fsp-root { position:absolute; top:0; left:0; right:0; bottom:0; z-index:300; display:flex; flex-direction:column; overflow:hidden; }
  .fsp-bg { position:absolute; inset:0; z-index:0; }
  .fsp-bg-img { position:absolute; inset:-20px; background-size:cover; background-position:center; filter:blur(80px); opacity:0.25; transform:scale(1.1); }
  .fsp-bg-overlay { position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.97) 100%); }
  
  .fsp-topbar { position:relative; z-index:2; display:flex; align-items:center; justify-content:space-between; padding:20px 28px; flex-shrink:0; }
  .fsp-topbtn { background:rgba(255,255,255,0.08); border:none; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; transition:background 0.2s, transform 0.15s; }
  .fsp-topbtn:hover { background:rgba(255,255,255,0.15); transform:scale(1.1); }
  .fsp-title-label { color:rgba(255,255,255,0.7); font-size:11px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; margin:0; }

  .fsp-body { position:relative; z-index:2; flex:1; display:flex; align-items:stretch; overflow:hidden; }
  
  /* Desktop: side-by-side */
  .fsp-left { display:flex; align-items:center; justify-content:center; flex:1; padding:0 48px 40px; min-width:0; }
  .fsp-art-wrap { width:100%; max-width:380px; aspect-ratio:1; border-radius:20px; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,0.9); transition:transform 0.3s ease; flex-shrink:0; }
  .fsp-art-wrap:hover { transform:scale(1.02); }
  .fsp-art-wrap img { width:100%; height:100%; object-fit:cover; display:block; }

  .fsp-right { display:flex; flex-direction:column; justify-content:center; flex:1; padding:0 48px 40px; min-width:0; max-width:480px; gap:0; }

  .fsp-track-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
  .fsp-track-info { flex:1; min-width:0; }
  .fsp-track-title { color:#fff; font-size:26px; font-weight:800; margin:0 0 6px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; letter-spacing:-0.5px; }
  .fsp-track-artist { color:rgba(255,255,255,0.55); font-size:15px; margin:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .fsp-actions { display:flex; align-items:center; gap:14px; flex-shrink:0; margin-left:20px; }
  .fsp-action-btn { background:none; border:none; cursor:pointer; padding:0; display:flex; align-items:center; justify-content:center; transition:transform 0.15s, color 0.2s; color:rgba(255,255,255,0.55); }
  .fsp-action-btn:hover { transform:scale(1.15); color:#fff; }

  .fsp-scrubber-wrap { margin-bottom:24px; }
  .fsp-scrubber-track { position:relative; height:4px; background:rgba(255,255,255,0.15); border-radius:99px; cursor:pointer; transition:height 0.15s; }
  .fsp-scrubber-track:hover { height:6px; }
  .fsp-scrubber-fill { position:absolute; left:0; top:0; height:100%; background:${G}; border-radius:99px; pointer-events:none; }
  .fsp-scrubber-track:hover .fsp-scrubber-fill { background:#fff; }
  .fsp-scrubber-input { position:absolute; inset:0; width:100%; opacity:0; cursor:pointer; height:100%; }
  .fsp-time-row { display:flex; justify-content:space-between; margin-top:8px; }
  .fsp-time { color:rgba(255,255,255,0.4); font-size:11px; font-weight:500; }

  .fsp-controls { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
  .fsp-ctrl-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.55); padding:0; display:flex; align-items:center; justify-content:center; transition:color 0.2s, transform 0.15s; }
  .fsp-ctrl-btn:hover { color:#fff; transform:scale(1.1); }
  .fsp-ctrl-btn.active { color:${G} !important; }
  .fsp-ctrl-center { display:flex; align-items:center; gap:28px; }
  .fsp-play-btn { width:64px; height:64px; border-radius:50%; background:${G}; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#000; transition:transform 0.15s, box-shadow 0.2s; box-shadow:0 0 0 transparent; }
  .fsp-play-btn:hover { transform:scale(1.05); box-shadow:0 8px 32px rgba(29,185,84,0.5); }
  .fsp-play-btn:active { transform:scale(0.96); }
  .fsp-play-btn.playing { box-shadow:0 0 40px rgba(29,185,84,0.4); }

  .fsp-vol-row { display:flex; align-items:center; gap:12px; }
  .fsp-vol-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.55); padding:0; }
  .fsp-vol-btn:hover { color:#fff; }
  .fsp-vol-track { flex:1; height:3px; background:rgba(255,255,255,0.15); border-radius:99px; position:relative; cursor:pointer; }
  .fsp-vol-fill { position:absolute; left:0; top:0; height:100%; background:rgba(255,255,255,0.5); border-radius:99px; pointer-events:none; }
  .fsp-vol-input { position:absolute; inset:0; width:100%; opacity:0; cursor:pointer; }

  /* Mobile: stacked */
  @media (max-width: 700px) {
    .fsp-body { flex-direction:column; overflow-y:auto; }
    .fsp-left { padding:20px 32px 24px; flex:0 0 auto; align-items:flex-start; }
    .fsp-art-wrap { max-width:100%; }
    .fsp-right { flex:0 0 auto; max-width:100%; padding:0 28px 80px; }
    .fsp-track-title { font-size:22px; }
    .fsp-play-btn { width:56px; height:56px; }
    .fsp-controls { gap:0; }
    .fsp-ctrl-center { gap:20px; }
  }
  @media (max-width: 420px) {
    .fsp-left { padding:16px 20px 16px; }
    .fsp-right { padding:0 20px 60px; }
    .fsp-track-title { font-size:19px; }
  }
`;

export default function FullScreenPlayer({ 
  track, playing, progress, duration, 
  isLiked, isLoop, isShuffle,
  onClose, onToggle, onSeek, onNext, onPrev,
  onToggleLike, onToggleLoop, onToggleShuffle
}: {
  track: any; playing: boolean; progress: number; duration: number;
  isLiked: boolean; isLoop: boolean; isShuffle: boolean;
  onClose: () => void; onToggle: () => void; onSeek: (v: number) => void;
  onNext: () => void; onPrev: () => void;
  onToggleLike: () => void; onToggleLoop: () => void; onToggleShuffle: () => void;
}) {
  const [volume, setVolume] = useState(80);
  const cover = track.coverImage || track.thumbnail;
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="fsp-root" style={{ background:'#0a0a0a' }}>
      <style dangerouslySetInnerHTML={{ __html: FSP_CSS }} />

      {/* Ambient background */}
      <div className="fsp-bg">
        {cover && <div className="fsp-bg-img" style={{ backgroundImage:`url(${cover})` }} />}
        <div className="fsp-bg-overlay" />
      </div>

      {/* Top bar */}
      <div className="fsp-topbar">
        <button className="fsp-topbtn" onClick={onClose} title="Minimize">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:16,height:16}}>
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="fsp-title-label">Now Playing</p>
        <button className="fsp-topbtn" title="More options">
          <svg viewBox="0 0 24 24" fill="currentColor" style={{width:15,height:15}}>
            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Main body */}
      <div className="fsp-body">
        {/* LEFT: Album art */}
        <div className="fsp-left">
          <div className="fsp-art-wrap">
            {cover
              ? <img src={cover} alt={track.title} />
              : (
                <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg viewBox="0 0 24 24" fill="none" style={{width:'40%',color:'rgba(255,255,255,0.15)'}}>
                    <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
              )
            }
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="fsp-right">
          {/* Track info + actions */}
          <div className="fsp-track-row">
            <div className="fsp-track-info">
              <h2 className="fsp-track-title">{track.title}</h2>
              <p className="fsp-track-artist">{track.artist || 'Unknown Artist'}</p>
            </div>
            <div className="fsp-actions">
              <button
                className="fsp-action-btn"
                onClick={onToggleLike}
                title={isLiked ? 'Unlike' : 'Like'}
                style={{ color: isLiked ? GREEN : 'rgba(255,255,255,0.55)' }}
              >
                <svg viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{width:22,height:22}}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <button className="fsp-action-btn" title="Share">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:20,height:20}}>
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Scrubber */}
          <div className="fsp-scrubber-wrap">
            <div className="fsp-scrubber-track">
              <div className="fsp-scrubber-fill" style={{ width:`${pct}%` }} />
              <input
                type="range" className="fsp-scrubber-input"
                min={0} max={duration || 100} value={progress} step={0.1}
                onChange={e => onSeek(Number(e.target.value))}
              />
            </div>
            <div className="fsp-time-row">
              <span className="fsp-time">{fmtTime(progress)}</span>
              <span className="fsp-time">{fmtTime(duration)}</span>
            </div>
          </div>

          {/* Main controls */}
          <div className="fsp-controls">
            <button
              className={`fsp-ctrl-btn${isShuffle ? ' active' : ''}`}
              onClick={onToggleShuffle} title="Shuffle"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" style={{width:18,height:18}}>
                <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5zM8.75 9.5l-1.02 1.214 2.384 2.84A3.75 3.75 0 0 0 13.151 15H15v-1.5h-1.849a2.25 2.25 0 0 1-1.724-.804l-2.677-3.196z"/>
              </svg>
              {isShuffle && <span style={{position:'absolute',bottom:-6,left:'50%',transform:'translateX(-50%)',width:3,height:3,borderRadius:'50%',background:GREEN,display:'block'}}/>}
            </button>

            <div className="fsp-ctrl-center">
              <button className="fsp-ctrl-btn" onClick={onPrev} title="Previous" style={{color:'#fff'}}>
                <svg viewBox="0 0 16 16" fill="currentColor" style={{width:22,height:22}}>
                  <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"/>
                </svg>
              </button>
              <button
                className={`fsp-play-btn${playing ? ' playing' : ''}`}
                onClick={onToggle} title={playing ? 'Pause' : 'Play'}
              >
                {playing
                  ? <svg viewBox="0 0 24 24" fill="currentColor" style={{width:24,height:24}}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  : <svg viewBox="0 0 24 24" fill="currentColor" style={{width:24,height:24,marginLeft:3}}><path d="M8 5v14l11-7z"/></svg>
                }
              </button>
              <button className="fsp-ctrl-btn" onClick={onNext} title="Next" style={{color:'#fff'}}>
                <svg viewBox="0 0 16 16" fill="currentColor" style={{width:22,height:22}}>
                  <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/>
                </svg>
              </button>
            </div>

            <button
              className={`fsp-ctrl-btn${isLoop ? ' active' : ''}`}
              onClick={onToggleLoop} title="Repeat"
              style={{ position:'relative' }}
            >
              <svg viewBox="0 0 16 16" fill="currentColor" style={{width:18,height:18}}>
                <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l3.15 3.15a.75.75 0 1 1-1.06 1.06L8.12 13.93a.75.75 0 0 1 0-1.06l3.78-3.78a.75.75 0 1 1 1.06 1.06l-3.15 3.15h2.44A2.25 2.25 0 0 0 14.5 9.75v-5A2.25 2.25 0 0 0 12.25 2.5h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/>
              </svg>
              {isLoop && <span style={{position:'absolute',bottom:-6,left:'50%',transform:'translateX(-50%)',width:3,height:3,borderRadius:'50%',background:GREEN,display:'block'}}/>}
            </button>
          </div>

          {/* Volume */}
          <div className="fsp-vol-row">
            <button className="fsp-vol-btn" onClick={() => setVolume(v => v === 0 ? 70 : 0)} title="Mute">
              {volume === 0
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                : volume < 50
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              }
            </button>
            <div className="fsp-vol-track">
              <div className="fsp-vol-fill" style={{ width:`${volume}%` }} />
              <input
                type="range" className="fsp-vol-input"
                min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
