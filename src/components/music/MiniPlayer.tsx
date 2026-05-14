'use client';
import { CoverArt, GREEN, fmtTime } from '../MusicPlayerPage';

const G = '#1DB954';
const MP_CSS = `
  .mp-dock {
    position:fixed; left:0; right:0; bottom:0; z-index:999;
    height:72px;
    background: rgba(10,10,10,0.98);
    border-top: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 0 16px;
    gap: 8px;
    box-shadow: 0 -4px 32px rgba(0,0,0,0.6);
  }

  /* LEFT: track info */
  .mp-left {
    display:flex; align-items:center; gap:12px;
    min-width:0; overflow:hidden;
    cursor:pointer;
  }
  .mp-left-text { flex:1; min-width:0; }
  .mp-title { color:#fff; font-size:13px; font-weight:600; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mp-artist { color:#a7a7a7; font-size:12px; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mp-like-btn { background:none; border:none; cursor:pointer; padding:4px; color:rgba(255,255,255,0.5); flex-shrink:0; display:flex; align-items:center; transition:color 0.2s, transform 0.15s; }
  .mp-like-btn:hover { transform:scale(1.15); }
  .mp-like-btn.liked { color:${G}; }

  /* CENTER: controls + scrubber */
  .mp-center { display:flex; flex-direction:column; align-items:center; gap:6px; min-width:0; max-width:600px; width:100%; }
  .mp-ctrl-row { display:flex; align-items:center; gap:20px; }
  .mp-ctrl-btn { background:none; border:none; cursor:pointer; color:#b3b3b3; padding:0; display:flex; align-items:center; transition:color 0.2s, transform 0.15s; }
  .mp-ctrl-btn:hover { color:#fff; transform:scale(1.1); }
  .mp-ctrl-btn.active { color:${G} !important; }
  .mp-play-btn { width:34px; height:34px; border-radius:50%; background:#fff; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#000; transition:transform 0.15s; flex-shrink:0; }
  .mp-play-btn:hover { transform:scale(1.07); background:#f0f0f0; }
  .mp-play-btn:active { transform:scale(0.95); }

  .mp-scrubber { display:flex; align-items:center; gap:8px; width:100%; }
  .mp-time { color:#a7a7a7; font-size:10px; font-weight:500; flex-shrink:0; min-width:34px; }
  .mp-time.right { text-align:right; }
  .mp-progress-wrap { flex:1; position:relative; height:3px; background:rgba(255,255,255,0.15); border-radius:99px; cursor:pointer; transition:height 0.15s; }
  .mp-progress-wrap:hover { height:5px; }
  .mp-progress-fill { position:absolute; left:0; top:0; height:100%; background:${G}; border-radius:99px; pointer-events:none; }
  .mp-progress-wrap:hover .mp-progress-fill { background:#fff; }
  .mp-progress-input { position:absolute; inset:0; width:100%; opacity:0; cursor:pointer; }

  /* RIGHT: volume + queue */
  .mp-right { display:flex; align-items:center; justify-content:flex-end; gap:12px; }
  .mp-right-btn { background:none; border:none; cursor:pointer; color:#b3b3b3; padding:0; display:flex; align-items:center; transition:color 0.2s; flex-shrink:0; }
  .mp-right-btn:hover { color:#fff; }
  .mp-vol-wrap { display:flex; align-items:center; gap:6px; }
  .mp-vol-bar { width:80px; position:relative; height:3px; background:rgba(255,255,255,0.15); border-radius:99px; cursor:pointer; }
  .mp-vol-fill { position:absolute; left:0; top:0; height:100%; background:rgba(255,255,255,0.6); border-radius:99px; pointer-events:none; }
  .mp-vol-input { position:absolute; inset:0; width:100%; opacity:0; cursor:pointer; }
  .mp-expand-btn { background:none; border:none; cursor:pointer; color:#b3b3b3; padding:4px 0 4px 4px; display:flex; align-items:center; transition:color 0.2s; }
  .mp-expand-btn:hover { color:#fff; }

  /* Mobile adjustments */
  @media (max-width: 700px) {
    .mp-dock { grid-template-columns: 1fr auto; padding:0 12px; height:68px; }
    .mp-right { display:none; }
    .mp-left { gap:10px; }
    .mp-ctrl-row { gap:14px; }
    .mp-scrubber { display:none; }
    .mp-center { gap:0; }
    .mp-ctrl-btn.hide-sm { display:none; }
  }
  @media (max-width: 460px) {
    .mp-title { font-size:12px; }
    .mp-artist { font-size:11px; }
    .mp-ctrl-row { gap:10px; }
  }
`;

export default function MiniPlayer({ 
  track, playing, progress, duration, 
  isLiked, isLoop, isShuffle,
  onToggle, onNext, onPrev, onOpen,
  onToggleLike, onToggleLoop, onToggleShuffle,
  onSeek
}: {
  track: any; playing: boolean; progress: number; duration: number;
  isLiked: boolean; isLoop: boolean; isShuffle: boolean;
  onToggle: () => void; onNext: () => void; onPrev: () => void; onOpen: () => void;
  onToggleLike: () => void; onToggleLoop: () => void; onToggleShuffle: () => void;
  onSeek?: (v: number) => void;
}) {
  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MP_CSS }} />
      <div className="mp-dock">
        {/* LEFT */}
        <div className="mp-left" onClick={onOpen}>
          <CoverArt src={track.coverImage || track.thumbnail} size={46} rounded={6} />
          <div className="mp-left-text">
            <p className="mp-title">{track.title}</p>
            <p className="mp-artist">{track.artist || 'Unknown'}</p>
          </div>
          <button
            className={`mp-like-btn${isLiked ? ' liked' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleLike(); }}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <svg viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* CENTER */}
        <div className="mp-center">
          <div className="mp-ctrl-row">
            <button
              className={`mp-ctrl-btn hide-sm${isShuffle ? ' active' : ''}`}
              onClick={e => { e.stopPropagation(); onToggleShuffle(); }}
              title="Shuffle"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" style={{width:15,height:15}}>
                <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5zM8.75 9.5l-1.02 1.214 2.384 2.84A3.75 3.75 0 0 0 13.151 15H15v-1.5h-1.849a2.25 2.25 0 0 1-1.724-.804l-2.677-3.196z"/>
              </svg>
            </button>
            <button
              className="mp-ctrl-btn"
              onClick={e => { e.stopPropagation(); onPrev(); }}
              title="Previous"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" style={{width:17,height:17}}>
                <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"/>
              </svg>
            </button>
            <button
              className="mp-play-btn"
              onClick={e => { e.stopPropagation(); onToggle(); }}
              title={playing ? 'Pause' : 'Play'}
            >
              {playing
                ? <svg viewBox="0 0 24 24" fill="currentColor" style={{width:15,height:15}}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                : <svg viewBox="0 0 24 24" fill="currentColor" style={{width:15,height:15,marginLeft:2}}><path d="M8 5v14l11-7z"/></svg>
              }
            </button>
            <button
              className="mp-ctrl-btn"
              onClick={e => { e.stopPropagation(); onNext(); }}
              title="Next"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" style={{width:17,height:17}}>
                <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/>
              </svg>
            </button>
            <button
              className={`mp-ctrl-btn hide-sm${isLoop ? ' active' : ''}`}
              onClick={e => { e.stopPropagation(); onToggleLoop(); }}
              title="Repeat"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" style={{width:15,height:15}}>
                <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l3.15 3.15a.75.75 0 1 1-1.06 1.06L8.12 13.93a.75.75 0 0 1 0-1.06l3.78-3.78a.75.75 0 1 1 1.06 1.06l-3.15 3.15h2.44A2.25 2.25 0 0 0 14.5 9.75v-5A2.25 2.25 0 0 0 12.25 2.5h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/>
              </svg>
            </button>
          </div>
          <div className="mp-scrubber">
            <span className="mp-time">{fmtTime(progress)}</span>
            <div className="mp-progress-wrap">
              <div className="mp-progress-fill" style={{ width:`${pct}%` }} />
              <input
                type="range"
                className="mp-progress-input"
                min={0} max={duration || 100} value={progress} step={0.1}
                onChange={e => { e.stopPropagation(); onSeek?.(Number(e.target.value)); }}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <span className="mp-time right">{fmtTime(duration)}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="mp-right">
          <button className="mp-right-btn" title="Queue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
          <div className="mp-vol-wrap">
            <button className="mp-right-btn" title="Volume">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
            <div className="mp-vol-bar">
              <div className="mp-vol-fill" style={{ width:'70%' }} />
              <input type="range" className="mp-vol-input" min={0} max={100} defaultValue={70} />
            </div>
          </div>
          <button className="mp-expand-btn" onClick={onOpen} title="Expand player">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:17,height:17}}>
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
              <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
