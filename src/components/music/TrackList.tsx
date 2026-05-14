'use client';
import { EqBars, CoverArt, GREEN } from '../MusicPlayerPage';

export default function TrackList({ tracks, currentId, playing, onPlay }: { tracks: any[]; currentId?: string; playing: boolean; onPlay: (t: any) => void }) {
  if (!tracks.length) return <p style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', padding:40 }}>No tracks yet</p>;
  return (
    <div>
      {tracks.map((t: any, i: number) => {
        const active = t.id === currentId;
        return (
          <button key={t.id} onClick={() => onPlay(t)}
            style={{
              display:'flex', alignItems:'center', gap:12, width:'100%', padding:'8px 20px',
              background: active ? 'rgba(29,185,84,0.08)' : 'none',
              border:'none', cursor:'pointer', textAlign:'left',
              borderLeft: active ? `2px solid ${GREEN}` : '2px solid transparent',
              animation: `slideUpFade 0.3s ease ${i*0.04}s both`,
            }}>
            <div style={{ width:18, textAlign:'center', flexShrink:0 }}>
              {active
                ? <EqBars playing={playing} />
                : <span style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>{i+1}</span>}
            </div>
            <CoverArt src={t.coverImage||t.thumbnail} size={44} rounded={6} />
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color: active ? GREEN : '#fff', fontSize:14, fontWeight:600, margin:'0 0 2px', fontFamily:'Inter,sans-serif', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{t.title}</p>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, margin:0, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{t.artist || 'Unknown'}</p>
            </div>
            <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12, flexShrink:0 }}>{t.duration || ''}</span>
          </button>
        );
      })}
    </div>
  );
}
