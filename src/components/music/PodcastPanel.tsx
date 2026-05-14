'use client';
import { GREEN, CoverArt } from '../MusicPlayerPage';

export default function PodcastPanel({ podcasts, podTracks, currentId, playing, onPlay }: {
  podcasts: any[]; podTracks: any[]; currentId?: string; playing: boolean; onPlay: (t: any) => void;
}) {
  const episodes: any[] = [
    ...podTracks,
    ...podcasts.flatMap((p: any) => (p.audios || []).map((a: any) => ({ ...a, _pod: p.name, _podCover: p.coverImage || p.thumbnail }))),
  ];

  const featured = podcasts.length > 0 ? podcasts[0] : null;

  return (
    <div style={{ width:340, minWidth:300, background:'#000', borderLeft:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto' }} className="music-no-scroll">
      <div style={{ padding:'24px 24px 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ color:'#fff', fontSize:16, fontWeight:700, margin:0 }}>Podcasts for you</p>
          <button style={{ color:'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, background:'none', border:'none', cursor:'pointer', padding:0, textDecoration:'none' }}>Show all</button>
        </div>
      </div>

      {featured && (
        <div style={{ padding:'0 24px 24px' }}>
          <div style={{ background:'linear-gradient(145deg, #2a2a2a, #121212)', borderRadius:8, padding:16, cursor:'pointer', position:'relative', overflow:'hidden', transition:'background 0.3s' }}
               onClick={() => featured.audios?.[0] && onPlay(featured.audios[0])}>
            <div style={{ position:'absolute', top:16, left:16, background:'#fff', color:'#000', fontSize:10, fontWeight:700, padding:'4px 8px', borderRadius:4, zIndex:2 }}>A SPOTIFY EXCLUSIVE</div>
            <div style={{ position:'relative', width:'100%', aspectRatio:'1', borderRadius:8, overflow:'hidden', marginBottom:16 }}>
              <img src={featured.coverImage || featured.thumbnail} alt={featured.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            <p style={{ color:'#fff', fontSize:16, fontWeight:700, margin:'0 0 4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{featured.name}</p>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:'0 0 12px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{featured.description || featured.genre || 'Listen to the latest episodes.'}</p>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <button style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16, height:16}}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <button style={{ background:'#fff', border:'none', color:'#000', borderRadius:'50%', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                onClick={e => { e.stopPropagation(); featured.audios?.[0] && onPlay(featured.audios[0]); }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{width:16, height:16, marginLeft:2}}><polygon points="5,3 19,12 5,21"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {episodes.length > 0 && (
        <div style={{ padding:'0 24px' }}>
          {episodes.map((ep: any) => {
            const active = ep.id === currentId;
            const cover = ep.coverImage || ep.thumbnail || ep._podCover;
            return (
              <button key={ep.id} onClick={() => onPlay(ep)}
                style={{ display:'flex', gap:12, alignItems:'center', width:'100%', padding:'8px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left', marginBottom:8 }}>
                <CoverArt src={cover} size={56} rounded={8} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color: active ? GREEN : '#fff', fontSize:14, fontWeight:600, margin:'0 0 4px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{ep.title}</p>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:'0 0 4px', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{ep._pod || ep.artist || 'Podcast'}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button style={{ background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', cursor:'pointer' }} onClick={e => { e.stopPropagation(); onPlay(ep); }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{width:10, height:10, marginLeft:1}}><polygon points="5,3 19,12 5,21"/></svg>
                    </button>
                    <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>{ep.duration || '45min'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {podcasts.length === 0 && episodes.length === 0 && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, color:'rgba(255,255,255,0.2)' }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width:48, height:48, marginBottom:12 }}>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 15v4M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p style={{ fontSize:13, fontWeight:600, margin:'0 0 4px' }}>No Podcasts Yet</p>
          <p style={{ fontSize:11, textAlign:'center' }}>Add podcasts from Studio</p>
        </div>
      )}
    </div>
  );
}
