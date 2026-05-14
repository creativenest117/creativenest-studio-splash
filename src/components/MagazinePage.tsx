'use client';

import { useState } from 'react';

// ─── Magazine Page & Themes ───────────────────────────────────────────────────

type MagazineTheme = 'newspaper' | 'vogue' | 'tech' | 'tourism';

interface ContentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'subheading' | 'image' | 'video';
  content: string;
}

interface Issue {
  id: string;
  vol: string;
  title: string;
  subtitle: string;
  theme: MagazineTheme;
  coverUrl?: string;
  blocks: ContentBlock[];
}

const SAMPLE_ISSUES: Issue[] = [
  { 
    id: '1', vol: 'VOL. 24', title: 'The Autumn Couture', subtitle: 'Published 2 days ago', theme: 'vogue',
    coverUrl: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?q=80&w=2000&auto=format&fit=crop',
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'The winds of change are sweeping through the fashion capital.' },
      { id: 'b2', type: 'image', content: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop' },
      { id: 'b3', type: 'subheading', content: 'A Return to Opulence' },
      { id: 'b4', type: 'paragraph', content: 'Minimalism is taking a back seat as rich, opulent textures make a triumphant return. Designers are leaning heavily into velvet, brocade, and oversized silhouettes that command attention.' },
      { id: 'b5', type: 'paragraph', content: '"It is no longer about blending in," says leading creative director Julian Rousseau. "It\'s about making your presence an undeniable fact of the room."' },
      { id: 'b6', type: 'paragraph', content: 'This season, expect deep emeralds, rich burgundies, and an unapologetic embrace of luxury.' },
    ]
  },
  { 
    id: '2', vol: 'VOL. 23', title: 'Quantum Computing Realized', subtitle: 'Published 1 week ago', theme: 'tech',
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop',
    blocks: [
      { id: 'b1', type: 'heading', content: 'The Next Frontier' },
      { id: 'b2', type: 'paragraph', content: 'We are officially in the post-silicon era. Quantum processors have moved from theoretical physics labs into commercial data centers.' },
      { id: 'b3', type: 'image', content: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop' },
      { id: 'b4', type: 'paragraph', content: 'The implications for cryptography, medicine, and artificial intelligence are staggering. A computation that would take the world\'s fastest supercomputer 10,000 years can now be solved in 200 seconds.' },
      { id: 'b5', type: 'subheading', content: 'Key Impacts:' },
      { id: 'b6', type: 'paragraph', content: '* Security protocols are being completely rewritten.\n* Drug discovery is happening at molecular simulation speeds.' },
      { id: 'b7', type: 'paragraph', content: 'Are we ready for what comes next?' },
    ]
  },
  { 
    id: '3', vol: 'VOL. 22', title: 'Global Markets Stumble', subtitle: 'Published 2 weeks ago', theme: 'newspaper',
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'In an unprecedented turn of events, global markets saw a sharp decline following the central bank\'s surprise announcement.' },
      { id: 'b2', type: 'paragraph', content: 'Investors scrambled as traditional safe havens proved volatile. "We haven\'t seen a shift like this since the early 80s," noted senior economic analyst Margaret Sterling. The ripple effects are already being felt in housing and commodity prices.' },
      { id: 'b3', type: 'paragraph', content: 'Experts advise caution, suggesting a "wait and see" approach as the new fiscal policies take root.' },
    ]
  },
  { 
    id: '4', vol: 'VOL. 21', title: 'Hidden Gems of the Mediterranean', subtitle: 'Published 3 weeks ago', theme: 'tourism',
    coverUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=2000&auto=format&fit=crop',
    blocks: [
      { id: 'b1', type: 'paragraph', content: 'Beyond the crowded tourist traps lies a Mediterranean largely untouched by the massive summer influx.' },
      { id: 'b2', type: 'image', content: 'https://images.unsplash.com/photo-1516483638261-f40af5ebcf89?q=80&w=1000&auto=format&fit=crop' },
      { id: 'b3', type: 'paragraph', content: 'Imagine cobblestone streets where the only sound is the distant crash of waves and the clinking of espresso cups. We spent a month traversing the lesser-known islands, discovering family-run tavernas and secluded coves.' },
      { id: 'b4', type: 'heading', content: 'The Amalfi Secret' },
      { id: 'b5', type: 'paragraph', content: 'Skip the main coastline and head slightly north. You\'ll find villages where time seems to have stopped, and the pasta is still made by hand every single morning.' },
    ]
  },
];

function MagazineCover({ issue, large = false, onClick }: { issue: Issue; large?: boolean, onClick: () => void }) {
  // Theme-specific cover styling
  let bgStyle = 'linear-gradient(135deg, #1a0f2e 0%, #2d1f42 100%)';
  let titleColor = '#D4AF37';
  let badgeStyle = { background: '#D4AF37', color: '#0a0810' };
  
  if (issue.theme === 'vogue') {
    bgStyle = 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)';
    titleColor = '#000000';
    badgeStyle = { background: '#000000', color: '#ffffff' };
  } else if (issue.theme === 'tech') {
    bgStyle = 'linear-gradient(135deg, #0f172a 0%, #020617 100%)';
    titleColor = '#22d3ee'; // cyan-400
    badgeStyle = { background: '#22d3ee', color: '#020617' };
  } else if (issue.theme === 'tourism') {
    bgStyle = 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)';
    titleColor = '#0369a1'; // sky-700
    badgeStyle = { background: '#0369a1', color: '#ffffff' };
  } else if (issue.theme === 'newspaper') {
    bgStyle = 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)';
    titleColor = '#1c1917';
    badgeStyle = { background: '#1c1917', color: '#ffffff' };
  }

  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.02] ${large ? 'h-72' : 'h-48'}`}
      style={{
        background: bgStyle,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}
    >
      {issue.coverUrl && (
        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 z-0">
          <img src={issue.coverUrl} alt="cover" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Vol badge */}
      <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-black tracking-widest z-10 shadow-md"
        style={badgeStyle}>
        {issue.vol}
      </div>

      {/* Magazine title lettering */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <span
          className="text-4xl font-black tracking-tighter opacity-20 drop-shadow-md"
          style={{ color: titleColor, fontFamily: "'Outfit', sans-serif", fontSize: large ? '72px' : '48px' }}
        >
          {issue.title.slice(0, 3).toUpperCase()}
        </span>
      </div>

      {/* Gradient overlay bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 z-10"
        style={{ background: `linear-gradient(to top, ${issue.theme === 'tech' || issue.theme === 'vogue' && !issue.coverUrl ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)'} 0%, transparent 100%)` }} />

      {/* Bottom text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{issue.title}</h3>
        <p className="text-xs mt-0.5 text-white/80 drop-shadow-md">{issue.subtitle}</p>
      </div>
    </div>
  );
}

function RenderBlocks({ blocks, theme }: { blocks: ContentBlock[], theme: MagazineTheme }) {
  return (
    <>
      {blocks.map((block) => {
        if (block.type === 'heading') return <h2 key={block.id} className="text-3xl font-bold mt-8 mb-4">{block.content}</h2>;
        if (block.type === 'subheading') return <h3 key={block.id} className="text-2xl font-semibold mt-6 mb-3">{block.content}</h3>;
        if (block.type === 'paragraph') return <p key={block.id} className="mb-4 whitespace-pre-wrap">{block.content}</p>;
        if (block.type === 'image') return <img key={block.id} src={block.content} alt="Article img" className="w-full h-auto my-6 rounded-lg shadow-md" />;
        if (block.type === 'video') return (
          <div key={block.id} className="relative w-full pb-[56.25%] my-6">
             <iframe src={block.content.includes('youtube') ? block.content.replace('watch?v=', 'embed/') : block.content} className="absolute inset-0 w-full h-full rounded-lg shadow-md" frameBorder="0" allowFullScreen />
          </div>
        );
        return null;
      })}
    </>
  );
}

function ArticleReader({ issue, onClose }: { issue: Issue, onClose: () => void }) {
  if (issue.theme === 'newspaper') {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#f4f1ea] text-[#2b2b2b] p-6 font-serif animation-in slide-in-from-bottom-10">
        <button onClick={onClose} className="fixed top-4 right-4 z-50 bg-[#2b2b2b] text-[#f4f1ea] p-2 rounded-full shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="max-w-2xl mx-auto pt-10 pb-20">
          <div className="border-b-4 border-double border-[#2b2b2b] pb-4 mb-8 text-center">
            <h1 className="text-4xl font-bold uppercase tracking-tight leading-none mb-4">{issue.title}</h1>
            <p className="text-xs uppercase tracking-widest text-[#555]">{issue.vol} • {issue.subtitle}</p>
          </div>
          {issue.coverUrl && (
            <div className="mb-8 border border-[#2b2b2b] p-1">
              <img src={issue.coverUrl} alt="Cover" className="w-full h-auto object-cover grayscale" />
            </div>
          )}
          <div className="columns-1 md:columns-2 gap-8 text-lg leading-relaxed text-justify">
             <RenderBlocks blocks={issue.blocks} theme={issue.theme} />
          </div>
        </div>
      </div>
    );
  }

  if (issue.theme === 'vogue') {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-white text-black font-sans animation-in slide-in-from-bottom-10">
        <button onClick={onClose} className="fixed top-4 right-4 z-50 bg-black/20 hover:bg-black text-white p-2 rounded-full backdrop-blur transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="relative h-[50vh] w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          {issue.coverUrl && <img src={issue.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/30" />
          <h1 className="relative z-10 text-4xl md:text-6xl font-light text-white text-center max-w-2xl tracking-tight leading-none px-4 drop-shadow-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {issue.title}
          </h1>
        </div>
        <div className="max-w-xl mx-auto py-12 px-6 text-lg text-gray-800 leading-loose tracking-wide font-light">
           <RenderBlocks blocks={issue.blocks} theme={issue.theme} />
        </div>
      </div>
    );
  }

  if (issue.theme === 'tech') {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0a0f1a] text-cyan-50 p-6 font-mono animation-in slide-in-from-bottom-10">
        <button onClick={onClose} className="fixed top-4 right-4 z-50 bg-cyan-900/50 text-cyan-400 p-2 rounded-lg border border-cyan-500/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="max-w-2xl mx-auto pt-10 pb-20">
          <div className="border-l-4 border-cyan-500 pl-4 mb-10">
            <div className="text-cyan-500 text-xs mb-2 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" /> SYSTEM.LOG
            </div>
            <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {issue.title}
            </h1>
          </div>
          {issue.coverUrl && (
            <div className="mb-8 border border-cyan-800/50 rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay z-10" />
              <img src={issue.coverUrl} alt="Cover" className="w-full h-auto object-cover" />
            </div>
          )}
          <div className="text-base text-slate-300 leading-relaxed">
             <RenderBlocks blocks={issue.blocks} theme={issue.theme} />
          </div>
        </div>
      </div>
    );
  }

  // Tourism / Travel
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-sky-50 text-sky-950 font-sans animation-in slide-in-from-bottom-10">
      <button onClick={onClose} className="fixed top-4 right-4 z-50 bg-white/50 hover:bg-white text-sky-900 p-2 rounded-full backdrop-blur shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div className="max-w-2xl mx-auto pt-8 pb-20 px-6">
        {issue.coverUrl && (
          <div className="w-full h-64 rounded-[2rem] overflow-hidden mb-8 shadow-lg relative">
            <img src={issue.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-sky-900 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {issue.title}
        </h1>
        <div className="w-12 h-1.5 bg-amber-400 rounded-full mb-8" />
        <div className="text-lg text-sky-800/80 leading-relaxed font-medium">
           <RenderBlocks blocks={issue.blocks} theme={issue.theme} />
        </div>
      </div>
    </div>
  );
}

export default function MagazinePage({ appConfig }: { appConfig: any }) {
  const displayName = appConfig?.appName || 'Creator';
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  return (
    <div className="w-full min-h-screen pb-24" style={{ background: '#080610' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Digital Publication
        </p>
        <h1 className="text-3xl font-black" style={{ color: '#D4AF37', fontFamily: "'Outfit', sans-serif" }}>
          {displayName} Magazine
        </h1>
      </div>

      {/* Featured Issues */}
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Featured Story</h2>
        </div>
        <MagazineCover issue={SAMPLE_ISSUES[0]} large onClick={() => setActiveIssue(SAMPLE_ISSUES[0])} />
      </div>

      {/* Recent Issues */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>Recent Articles</h2>
        <div className="grid grid-cols-2 gap-4">
          {SAMPLE_ISSUES.slice(1).map(issue => (
            <MagazineCover key={issue.id} issue={issue} onClick={() => setActiveIssue(issue)} />
          ))}
        </div>
      </div>

      {/* Active Issue Reader Popup */}
      {activeIssue && (
        <ArticleReader issue={activeIssue} onClose={() => setActiveIssue(null)} />
      )}
    </div>
  );
}

