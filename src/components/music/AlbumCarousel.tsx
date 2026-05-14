'use client';
import { CoverArt } from '../MusicPlayerPage';

export default function AlbumCarousel({ containers, onSelect }: { containers: any[]; onSelect: (c: any) => void }) {
  if (!containers.length) return null;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 20px', marginBottom:12 }}>
        <h3 style={{ color:'#fff', fontSize:16, fontWeight:700, fontFamily:'Inter,sans-serif', margin:0 }}>Albums & EPs</h3>
        <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12, fontWeight:600, cursor:'pointer' }}>SEE ALL</span>
      </div>
      <div className="music-no-scroll" style={{ display:'flex', gap:14, overflowX:'auto', padding:'0 20px', scrollSnapType:'x mandatory' }}>
        {containers.map((c: any) => (
          <button key={c.id} onClick={() => onSelect(c)}
            style={{ flexShrink:0, width:130, background:'none', border:'none', cursor:'pointer', padding:0, scrollSnapAlign:'start', textAlign:'left' }}>
            <CoverArt src={c.coverImage || c.thumbnail} size={130} rounded={10} />
            <p style={{ color:'#fff', fontSize:13, fontWeight:600, margin:'8px 0 2px', fontFamily:'Inter,sans-serif', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{c.name}</p>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, margin:0 }}>{c.audios?.length||0} tracks</p>
          </button>
        ))}
      </div>
    </div>
  );
}
