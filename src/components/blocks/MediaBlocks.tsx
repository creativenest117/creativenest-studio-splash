'use client';

import Image from 'next/image';

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function isValidUrl(str: string) {
  try { new URL(str); return true; } catch { return false; }
}

// ─── Shared Glass Card Shell ─────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`w-full px-4 py-5 ${className}`}
      style={{ color: '#fff' }}
    >
      <div
        className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

function CardHeader({ icon, label, color, title, description }: {
  icon: string; label: string; color: string; title: string; description?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 pb-0">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-lg shrink-0"
        style={{ background: color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#ffffff60' }}>{label}</p>
        {title && <h3 className="font-semibold text-white leading-snug text-base truncate">{title}</h3>}
        {description && <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#ffffff50' }}>{description}</p>}
      </div>
    </div>
  );
}

// ─── YouTube Block ────────────────────────────────────────────────────────────

export function YouTubeBlock({ section }: { section: any }) {
  const url = section.url || section.content?.url || '';
  const videoId = extractYouTubeId(url);
  const title = section.title || section.content?.title || 'YouTube Video';
  const description = section.description || section.content?.description || '';

  return (
    <Card>
      <CardHeader icon="▶" label="YouTube" color="linear-gradient(135deg,#ff0000,#cc0000)" title={title} description={description} />
      <div className="p-4">
        {videoId ? (
          <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : url && isValidUrl(url) ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-xl py-5 font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg,#ff0000,#cc0000)' }}
          >
            <span className="text-2xl">▶</span> Watch on YouTube
          </a>
        ) : (
          <div className="flex items-center justify-center rounded-xl py-8 text-white/30 text-sm" style={{ background: 'rgba(255,0,0,0.1)', border: '1px dashed rgba(255,0,0,0.3)' }}>
            No YouTube URL configured
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Spotify Block → Real Player via Spotify Web API ─────────────────────────
// Imported from SpotifyPlayerBlock which uses our backend proxy
export { SpotifyPlayerBlock as SpotifyBlock } from './SpotifyPlayerBlock';


// ─── Video Block ──────────────────────────────────────────────────────────────

export function VideoBlock({ section }: { section: any }) {
  const mediaUrl = section.mediaUrl || section.content?.mediaUrl || '';
  const url = section.url || section.content?.url || '';
  const title = section.title || section.content?.title || 'Video';
  const description = section.description || section.content?.description || '';
  const src = mediaUrl || url;

  return (
    <Card>
      <CardHeader icon="🎬" label="Video" color="linear-gradient(135deg,#3b82f6,#1d4ed8)" title={title} description={description} />
      <div className="p-4">
        {src ? (
          <video
            controls
            className="w-full rounded-xl"
            style={{ background: '#000', maxHeight: '340px' }}
          >
            <source src={src} />
            Your browser does not support video playback.
          </video>
        ) : (
          <div className="flex items-center justify-center rounded-xl py-8 text-white/30 text-sm" style={{ background: 'rgba(59,130,246,0.1)', border: '1px dashed rgba(59,130,246,0.3)' }}>
            No video file linked
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Gallery Block ────────────────────────────────────────────────────────────

export function GalleryBlock({ section }: { section: any }) {
  const title = section.title || section.content?.title || 'Gallery';
  const description = section.description || section.content?.description || '';
  // Support both single mediaUrl and array in content.images
  const images: string[] = section.content?.images || (section.mediaUrl ? [section.mediaUrl] : []);

  return (
    <Card>
      <CardHeader icon="🖼" label="Gallery" color="linear-gradient(135deg,#8b5cf6,#6d28d9)" title={title} description={description} />
      <div className="p-4">
        {images.length > 0 ? (
          <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {images.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-black/20">
                <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl py-8 text-white/30 text-sm" style={{ background: 'rgba(139,92,246,0.1)', border: '1px dashed rgba(139,92,246,0.3)' }}>
            No images uploaded yet
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Text Block ───────────────────────────────────────────────────────────────

export function TextBlock({ section }: { section: any }) {
  const title = section.title || section.content?.title || '';
  const body = section.description || section.content?.body || section.content?.description || '';

  return (
    <Card>
      <div className="p-5">
        {title && <h3 className="text-xl font-bold text-white mb-2">{title}</h3>}
        {body && <p className="text-white/70 leading-relaxed text-sm whitespace-pre-line">{body}</p>}
      </div>
    </Card>
  );
}

// ─── Live TV Block ────────────────────────────────────────────────────────────

export function LiveTVBlock({ section }: { section: any }) {
  const url = section.url || section.content?.url || '';
  const title = section.title || section.content?.title || 'Live TV Channel';
  const description = section.description || section.content?.description || 'Now streaming';

  return (
    <Card>
      <CardHeader icon="📺" label="Live TV" color="linear-gradient(135deg,#6366f1,#4338ca)" title={title} description={description} />
      <div className="p-4">
        {url && isValidUrl(url) ? (
          <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={url}
              title={title}
              allowFullScreen
              loading="lazy"
              style={{ border: 'none' }}
            />
          </div>
        ) : (
          <a
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-xl p-4 transition-opacity hover:opacity-80"
            style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(67,56,202,0.3))', border: '1px solid rgba(99,102,241,0.4)' }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#4338ca)' }}>📺</div>
            <div>
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-white/50">{description}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-white/40 font-medium">LIVE</span>
            </div>
          </a>
        )}
      </div>
    </Card>
  );
}

// ─── Radio Block ──────────────────────────────────────────────────────────────

export function RadioBlock({ section }: { section: any }) {
  const url = section.url || section.mediaUrl || section.content?.url || section.content?.mediaUrl || '';
  const title = section.title || section.content?.title || 'Radio Station';
  const description = section.description || section.content?.description || 'Continuous audio broadcast';

  return (
    <Card>
      <CardHeader icon="📻" label="Radio" color="linear-gradient(135deg,#06b6d4,#0891b2)" title={title} description={description} />
      <div className="p-4">
        {url ? (
          <audio controls className="w-full rounded-xl" style={{ accentColor: '#06b6d4' }}>
            <source src={url} />
            Your browser does not support audio playback.
          </audio>
        ) : (
          <div className="flex items-center justify-center rounded-xl py-8 text-white/30 text-sm" style={{ background: 'rgba(6,182,212,0.1)', border: '1px dashed rgba(6,182,212,0.3)' }}>
            No audio stream URL configured
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Live Stream Block ────────────────────────────────────────────────────────

export function LiveStreamBlock({ section }: { section: any }) {
  const url = section.url || section.content?.url || '';
  const title = section.title || section.content?.title || 'Live Stream';
  const description = section.description || section.content?.description || '';

  return (
    <Card>
      <CardHeader icon="🔴" label="Live Stream" color="linear-gradient(135deg,#ec4899,#be185d)" title={title} description={description} />
      <div className="p-4">
        {url && isValidUrl(url) ? (
          <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={url}
              title={title}
              allowFullScreen
              loading="lazy"
              style={{ border: 'none' }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl py-8 text-white/30 text-sm" style={{ background: 'rgba(236,72,153,0.1)', border: '1px dashed rgba(236,72,153,0.3)' }}>
            No stream URL configured
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Booking Block ────────────────────────────────────────────────────────────

export function BookingBlock({ section }: { section: any }) {
  const url = section.url || section.content?.url || '';
  const title = section.title || section.content?.title || 'Book a Session';
  const description = section.description || section.content?.description || 'Schedule your appointment';

  return (
    <Card>
      <CardHeader icon="📅" label="Booking" color="linear-gradient(135deg,#f97316,#c2410c)" title={title} description={description} />
      <div className="p-4">
        {url && isValidUrl(url) ? (
          <iframe
            src={url}
            className="w-full rounded-xl"
            style={{ height: '500px', border: 'none' }}
            loading="lazy"
            title={title}
          />
        ) : (
          <div className="flex items-center justify-center rounded-xl py-8 text-white/30 text-sm" style={{ background: 'rgba(249,115,22,0.1)', border: '1px dashed rgba(249,115,22,0.3)' }}>
            No booking URL configured
          </div>
        )}
      </div>
    </Card>
  );
}
